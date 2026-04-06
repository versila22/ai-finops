"""Sync orchestrator — fetches live data from auto-sync providers and updates DB."""
import logging
from datetime import datetime as dt
from datetime import timezone

from sqlalchemy.orm import Session

from app.models.provider import Provider
from app.services.notification_service import check_and_notify_alerts
from .elevenlabs_sync import fetch_elevenlabs_usage
from .openai_sync import fetch_openai_usage

logger = logging.getLogger(__name__)


def _compute_recommendation(usage_percent: float, days_until_reset: int) -> tuple[str, str, str]:
    """Derive recommendation, recommendation_text, urgency from usage stats."""
    if usage_percent >= 100:
        return "upgrade", "Quota exceeded — upgrade needed", "high"
    elif usage_percent >= 85:
        return "watch", "Quota exhaustion risk", "high"
    elif usage_percent >= 70:
        return "watch", "High usage — monitor closely", "medium"
    elif usage_percent <= 30 and days_until_reset < 15:
        return "downgrade", "Underused plan", "low"
    else:
        return "maintain", "Well-sized plan", "low"


def _now_iso() -> str:
    return dt.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


async def _sync_openai(db: Session) -> dict:
    """Sync OpenAI provider."""
    try:
        result = await fetch_openai_usage()
        if result is None:
            return {"provider": "openai", "status": "skipped", "reason": "no_api_key"}

        provider = db.query(Provider).filter_by(id="openai").first()
        if not provider:
            return {"provider": "openai", "status": "skipped", "reason": "provider_not_found"}

        if result.get("synced"):
            cost = result["total_cost_usd"]
            provider.consumed = cost
            provider.remaining = 0
            provider.included_quota = provider.included_quota or 0
            if provider.monthly_cost and provider.monthly_cost > 0:
                provider.usage_percent = round((cost / provider.monthly_cost) * 100, 1)
            else:
                provider.usage_percent = 0
            provider.sync_status = "synced"
            provider.last_sync = _now_iso()
            provider.data_origin = "auto"

            rec, rec_text, urgency = _compute_recommendation(
                provider.usage_percent, provider.days_until_reset
            )
            provider.recommendation = rec
            provider.recommendation_text = rec_text
            provider.urgency = urgency

            db.commit()
            logger.info(f"OpenAI synced: ${cost:.4f} this month ({provider.usage_percent:.1f}%)")
            return {"provider": "openai", "status": "synced", "cost_usd": cost}

        provider.sync_status = "error"
        provider.last_sync = _now_iso()
        db.commit()
        return {"provider": "openai", "status": "error", "reason": "api_failed"}
    except Exception as e:
        logger.error(f"OpenAI sync exception: {e}")
        try:
            provider = db.query(Provider).filter_by(id="openai").first()
            if provider:
                provider.sync_status = "error"
                provider.last_sync = _now_iso()
                db.commit()
        except Exception:
            pass
        return {"provider": "openai", "status": "error", "reason": str(e)}


async def _sync_elevenlabs(db: Session) -> dict:
    """Sync ElevenLabs provider."""
    try:
        result = await fetch_elevenlabs_usage()
        if result is None:
            return {"provider": "elevenlabs", "status": "skipped", "reason": "no_api_key"}

        provider = db.query(Provider).filter_by(id="elevenlabs").first()
        if not provider:
            return {"provider": "elevenlabs", "status": "skipped", "reason": "provider_not_found"}

        if result.get("synced"):
            char_count = result["character_count"]
            char_limit = result["character_limit"]

            provider.consumed = char_count
            provider.included_quota = char_limit if char_limit > 0 else provider.included_quota

            if provider.included_quota > 0:
                provider.remaining = max(0, provider.included_quota - char_count)
                provider.usage_percent = round((char_count / provider.included_quota) * 100, 1)
                provider.overage = max(0, char_count - provider.included_quota)
            else:
                provider.remaining = 0
                provider.usage_percent = 0
                provider.overage = 0

            tier = result.get("tier", "")
            if tier and tier != "unknown":
                provider.plan = f"{tier.title()} Plan"

            next_invoice = result.get("next_invoice_date_unix", 0)
            if next_invoice:
                next_dt = dt.fromtimestamp(next_invoice, tz=timezone.utc)
                provider.reset_date = next_dt.strftime("%Y-%m-%d")
                delta = (next_dt - dt.now(timezone.utc)).days
                provider.days_until_reset = max(0, delta)

            provider.sync_status = "synced"
            provider.last_sync = _now_iso()
            provider.data_origin = "auto"

            rec, rec_text, urgency = _compute_recommendation(
                provider.usage_percent, provider.days_until_reset
            )
            provider.recommendation = rec
            provider.recommendation_text = rec_text
            provider.urgency = urgency

            db.commit()
            logger.info(
                f"ElevenLabs synced: {char_count}/{char_limit} chars ({provider.usage_percent:.1f}%)"
            )
            return {
                "provider": "elevenlabs",
                "status": "synced",
                "character_count": char_count,
                "character_limit": char_limit,
                "usage_percent": provider.usage_percent,
            }

        provider.sync_status = "error"
        provider.last_sync = _now_iso()
        db.commit()
        return {"provider": "elevenlabs", "status": "error", "reason": "api_failed"}
    except Exception as e:
        logger.error(f"ElevenLabs sync exception: {e}")
        try:
            provider = db.query(Provider).filter_by(id="elevenlabs").first()
            if provider:
                provider.sync_status = "error"
                provider.last_sync = _now_iso()
                db.commit()
        except Exception:
            pass
        return {"provider": "elevenlabs", "status": "error", "reason": str(e)}


async def sync_all_providers(db: Session) -> list[dict]:
    """Sync all auto-sync providers sequentially, then evaluate alerts."""
    logger.info("Starting sync for all auto-sync providers...")
    results = [
        await _sync_openai(db),
        await _sync_elevenlabs(db),
    ]
    new_alerts = check_and_notify_alerts(db)
    logger.info(f"Sync complete: {results} | new alerts: {len(new_alerts)}")
    return list(results)


async def sync_provider_by_id(provider_id: str, db: Session) -> dict:
    """Sync a specific provider by ID, then evaluate alerts."""
    if provider_id == "openai":
        result = await _sync_openai(db)
    elif provider_id == "elevenlabs":
        result = await _sync_elevenlabs(db)
    else:
        return {"provider": provider_id, "status": "skipped", "reason": "manual_provider"}

    check_and_notify_alerts(db)
    return result
