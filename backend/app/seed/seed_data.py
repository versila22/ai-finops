"""Seed the database with Jerome's real AI provider plans."""
from datetime import datetime, timezone

from app.core.db import SessionLocal, create_tables
from app.models.adjustment import ManualAdjustment
from app.models.alert import Alert
from app.models.plan import Plan
from app.models.provider import Provider
from app.models.settings import Settings

# Seed version — bump this to force a re-seed when data changes
SEED_VERSION = "3"


def _get_reset_date() -> tuple[str, int]:
    """Return (reset_date_str, days_until_reset) for end of current month."""
    now = datetime.now(timezone.utc)
    # Last day of current month
    if now.month == 12:
        end = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        end = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
    days = max(0, (end - now).days)
    # Just return end of month as YYYY-MM-DD
    import calendar
    last_day = calendar.monthrange(now.year, now.month)[1]
    return f"{now.year}-{now.month:02d}-{last_day:02d}", days


def seed():
    create_tables()
    db = SessionLocal()

    # Check if already seeded at current version
    # We detect a re-seed need by checking if OpenAI plan matches our new config
    existing_openai = db.query(Provider).filter_by(id="openai").first()
    if existing_openai and existing_openai.plan == "API Pay-as-you-go":
        print(f"Database already seeded at version {SEED_VERSION}, skipping.")
        db.close()
        return

    # Re-seed: wipe existing data
    print(f"Seeding database (version {SEED_VERSION})...")
    db.query(ManualAdjustment).delete()
    db.query(Alert).delete()
    db.query(Plan).delete()
    db.query(Provider).delete()
    db.query(Settings).delete()
    db.commit()

    reset_date, days_until_reset = _get_reset_date()

    # --- Providers (Jerome's real plans) ---
    providers = [
        # 1. OpenAI - pay-as-you-go, variable cost. consumed/usage_percent updated by auto-sync.
        Provider(
            id="openai",
            name="OpenAI",
            logo="O",
            category="LLM / API",
            plan="API Pay-as-you-go",
            plan_type="monthly_quota",
            monthly_cost=0,          # variable — updated by sync
            included_quota=0,         # no fixed quota
            quota_unit="USD",
            consumed=0,               # updated by sync
            remaining=0,
            usage_percent=0,
            overage=0,
            reset_date=reset_date,
            days_until_reset=days_until_reset,
            sync_status="synced",
            last_sync="",
            data_origin="auto",
            recommendation="maintain",
            recommendation_text="Sync pending",
            recommendation_detail="Auto-sync will update usage data on startup.",
            urgency="low",
            projected_end_of_cycle=0,
            trend="stable",
        ),
        # 2. Anthropic - API credits with auto-reload $30. Manual.
        Provider(
            id="anthropic",
            name="Anthropic",
            logo="A",
            category="LLM / API",
            plan="API Credits (auto-reload $30)",
            plan_type="monthly_quota",
            monthly_cost=30,
            included_quota=30,
            quota_unit="USD",
            consumed=23.36,
            remaining=6.64,
            usage_percent=78,
            overage=0,
            reset_date=reset_date,
            days_until_reset=days_until_reset,
            sync_status="manual",
            last_sync="",
            data_origin="manual",
            recommendation="maintain",
            recommendation_text="Manual tracking",
            recommendation_detail="No public Anthropic usage API. Update consumed manually each month.",
            urgency="low",
            projected_end_of_cycle=0,
            trend="stable",
        ),
        # 3. Google One AI Premium — 21.99€/mo, 1000 AI credits. Manual.
        Provider(
            id="google",
            name="Google / Gemini",
            logo="G",
            category="LLM / Cloud AI",
            plan="One AI Premium",
            plan_type="monthly_quota",
            monthly_cost=21.99,
            included_quota=1000,
            quota_unit="credits",
            consumed=0,
            remaining=1000,
            usage_percent=0,
            overage=0,
            reset_date=reset_date,
            days_until_reset=days_until_reset,
            sync_status="manual",
            last_sync="",
            data_origin="manual",
            recommendation="maintain",
            recommendation_text="Manual tracking",
            recommendation_detail="Google AI Studio has no public billing API. Update consumed manually.",
            urgency="low",
            projected_end_of_cycle=0,
            trend="stable",
        ),
        # 4. ElevenLabs - Creator plan ($22/mo). Auto-sync via subscription API.
        Provider(
            id="elevenlabs",
            name="ElevenLabs",
            logo="E",
            category="Voice AI",
            plan="Creator",
            plan_type="monthly_quota",
            monthly_cost=22,
            included_quota=100_000,   # default Creator tier; updated by sync
            quota_unit="characters",
            consumed=0,               # updated by sync
            remaining=100_000,
            usage_percent=0,
            overage=0,
            reset_date=reset_date,
            days_until_reset=days_until_reset,
            sync_status="synced",
            last_sync="",
            data_origin="auto",
            recommendation="maintain",
            recommendation_text="Sync pending",
            recommendation_detail="Auto-sync will update usage data on startup.",
            urgency="low",
            projected_end_of_cycle=0,
            trend="stable",
        ),
        # 5. Lovable - Pro 1 plan (25€/mo, 100 monthly + 5 daily + rollover credits).
        Provider(
            id="lovable",
            name="Lovable",
            logo="L",
            category="AI Dev Platform",
            plan="Pro 1",
            plan_type="monthly_quota",
            monthly_cost=25,
            included_quota=187.3,
            quota_unit="credits",
            consumed=0,
            remaining=187.3,
            usage_percent=0,
            overage=0,
            reset_date=reset_date,
            days_until_reset=days_until_reset,
            sync_status="manual",
            last_sync="",
            data_origin="manual",
            recommendation="maintain",
            recommendation_text="Manual tracking",
            recommendation_detail="Lovable has no public API. Update consumed credits manually each month.",
            urgency="low",
            projected_end_of_cycle=0,
            trend="stable",
        ),
    ]
    db.add_all(providers)

    # --- Plans ---
    plans = [
        Plan(id="p1", provider_id="openai", provider_name="OpenAI", name="API Pay-as-you-go", plan_type="monthly_quota", monthly_cost=0, included_quota=0, quota_unit="USD"),
        Plan(id="p2", provider_id="anthropic", provider_name="Anthropic", name="API Credits (auto-reload $30)", plan_type="monthly_quota", monthly_cost=30, included_quota=30, quota_unit="USD"),
        Plan(id="p3", provider_id="google", provider_name="Google / Gemini", name="One AI Premium", plan_type="monthly_quota", monthly_cost=21.99, included_quota=1000, quota_unit="credits"),
        Plan(id="p4", provider_id="elevenlabs", provider_name="ElevenLabs", name="Creator", plan_type="monthly_quota", monthly_cost=22, included_quota=100_000, quota_unit="characters"),
        Plan(id="p5", provider_id="lovable", provider_name="Lovable", name="Pro 1", plan_type="monthly_quota", monthly_cost=25, included_quota=187.3, quota_unit="credits"),
    ]
    db.add_all(plans)

    # --- Alerts ---
    alerts = [
        Alert(
            id="a1",
            type="Manual Mode",
            severity="info",
            provider_id="anthropic",
            provider_name="Anthropic",
            trigger_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            description="Anthropic is in manual tracking mode. No public usage API available.",
            recommended_action="Update consumed tokens manually each month.",
            status="active",
        ),
        Alert(
            id="a2",
            type="Manual Mode",
            severity="info",
            provider_id="google",
            provider_name="Google / Gemini",
            trigger_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            description="Google AI Studio is in manual tracking mode. No public billing API.",
            recommended_action="Update consumed credits manually each month.",
            status="active",
        ),
        Alert(
            id="a3",
            type="Manual Mode",
            severity="info",
            provider_id="lovable",
            provider_name="Lovable",
            trigger_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            description="Lovable is in manual tracking mode. No public API.",
            recommended_action="Update consumed credits manually after each session.",
            status="active",
        ),
    ]
    db.add_all(alerts)

    # --- Settings ---
    settings_obj = Settings(
        id="global",
        monthly_budget=200,          # Jerome's approximate monthly AI budget
        alert_threshold_warning=75,
        alert_threshold_critical=90,
        currency="EUR",
    )
    # Store seed version in a simple way via the Settings id
    db.add(settings_obj)

    db.commit()
    db.close()
    print(f"Database seeded successfully (version {SEED_VERSION})!")


if __name__ == "__main__":
    seed()
