"""OpenAI usage sync connector."""
import logging
import os
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)


async def fetch_openai_usage() -> dict | None:
    """Fetch current month usage from OpenAI API.

    Returns:
        {"total_cost_usd": float, "synced": bool}
        or None if no API key configured.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set, skipping OpenAI sync")
        return None

    now = datetime.now(timezone.utc)
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    start_str = start.strftime("%Y-%m-%d")
    end_str = now.strftime("%Y-%m-%d")

    headers = {"Authorization": f"Bearer {api_key}"}

    async with httpx.AsyncClient() as client:
        # Try the newer organization/costs endpoint first
        try:
            resp = await client.get(
                "https://api.openai.com/v1/organization/costs",
                params={
                    "start_time": start.strftime("%Y-%m-%dT00:00:00Z"),
                    "limit": 31,
                },
                headers=headers,
                timeout=15,
            )
            logger.info(f"OpenAI costs endpoint status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                total = 0.0
                for bucket in data.get("data", []):
                    results = bucket.get("results", [])
                    if results:
                        # amount.value is in dollars (not cents) in this endpoint
                        val = results[0].get("amount", {}).get("value", 0)
                        total += val
                logger.info(f"OpenAI costs total: ${total:.4f}")
                return {"total_cost_usd": total, "synced": True}
        except Exception as e:
            logger.warning(f"OpenAI costs endpoint error: {e}")

        # Fallback: try the older billing/usage endpoint
        try:
            resp2 = await client.get(
                "https://api.openai.com/dashboard/billing/usage",
                params={"start_date": start_str, "end_date": end_str},
                headers=headers,
                timeout=15,
            )
            logger.info(f"OpenAI billing endpoint status: {resp2.status_code}")
            if resp2.status_code == 200:
                data = resp2.json()
                # total_usage is in cents
                total_cents = data.get("total_usage", 0)
                total_usd = total_cents / 100.0
                logger.info(f"OpenAI billing total: ${total_usd:.4f}")
                return {"total_cost_usd": total_usd, "synced": True}
        except Exception as e:
            logger.warning(f"OpenAI billing endpoint error: {e}")

    logger.error("All OpenAI endpoints failed")
    return {"total_cost_usd": 0.0, "synced": False}
