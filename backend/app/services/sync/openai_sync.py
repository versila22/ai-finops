"""OpenAI usage sync connector.

Uses /v1/organization/costs endpoint (requires Admin key with read-only scope).
Falls back to token estimation if no admin key is available.
"""
import logging
import os
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

# Fallback cost per 1K tokens (blended estimate)
COST_PER_1K_TOKENS = 0.01


async def fetch_openai_usage() -> dict | None:
    """Fetch current month costs from OpenAI.

    Uses /v1/organization/costs with admin key if available (accurate),
    falls back to /v1/usage token estimation otherwise.

    Returns:
        {"total_cost_usd": float, "total_tokens": int, "synced": bool, "method": str}
        or None if no API key configured.
    """
    admin_key = os.getenv("OPENAI_ADMIN_KEY")
    api_key = os.getenv("OPENAI_API_KEY")

    if not admin_key and not api_key:
        logger.warning("No OpenAI API key configured, skipping sync")
        return None

    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    start_ts = int(start_of_month.timestamp())

    # --- Method 1: Admin key → real costs ---
    if admin_key:
        try:
            async with httpx.AsyncClient() as client:
                total_cost = 0.0
                next_page = None

                while True:
                    params = {"start_time": start_ts, "limit": 100}
                    if next_page:
                        params["page"] = next_page

                    resp = await client.get(
                        "https://api.openai.com/v1/organization/costs",
                        headers={"Authorization": f"Bearer {admin_key}"},
                        params=params,
                        timeout=20,
                    )

                    if resp.status_code != 200:
                        logger.warning(f"OpenAI /organization/costs error: {resp.status_code} — {resp.text[:200]}")
                        break

                    data = resp.json()
                    for bucket in data.get("data", []):
                        for result in bucket.get("results", []):
                            amount = result.get("amount", {})
                            total_cost += float(amount.get("value", 0))

                    if data.get("has_more") and data.get("next_page"):
                        next_page = data["next_page"]
                    else:
                        break

                logger.info(f"OpenAI real cost this month: ${total_cost:.4f}")
                return {
                    "total_cost_usd": total_cost,
                    "total_tokens": 0,
                    "synced": True,
                    "method": "organization_costs",
                }
        except Exception as e:
            logger.error(f"OpenAI admin key sync error: {e} — falling back to token estimation")

    # --- Method 2: Standard key → token estimation ---
    if not api_key:
        return None

    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    headers = {"Authorization": f"Bearer {api_key}"}
    total_tokens = 0

    async with httpx.AsyncClient() as client:
        from datetime import timedelta
        day = start
        while day.date() <= now.date():
            date_str = day.strftime("%Y-%m-%d")
            try:
                resp = await client.get(
                    "https://api.openai.com/v1/usage",
                    params={"date": date_str},
                    headers=headers,
                    timeout=15,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    for entry in data.get("data", []):
                        total_tokens += entry.get("n_context_tokens_total", 0)
                        total_tokens += entry.get("n_generated_tokens_total", 0)
                elif resp.status_code in (401, 403):
                    return {"total_cost_usd": 0.0, "total_tokens": 0, "synced": False, "method": "tokens"}
            except Exception as e:
                logger.warning(f"OpenAI /v1/usage error for {date_str}: {e}")
            day += timedelta(days=1)

    estimated_cost = (total_tokens / 1000) * COST_PER_1K_TOKENS
    logger.info(f"OpenAI estimated: {total_tokens} tokens → ~${estimated_cost:.4f}")
    return {
        "total_cost_usd": estimated_cost,
        "total_tokens": total_tokens,
        "synced": True,
        "method": "token_estimation",
    }
