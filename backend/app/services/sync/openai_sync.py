"""OpenAI usage sync connector.

Note: OpenAI's billing/costs endpoints require org admin scopes (api.usage.read)
which are NOT available on standard project API keys.
The /v1/usage endpoint works but returns token counts, not dollar costs.
We use /v1/usage to get token counts and estimate costs.
"""
import logging
import os
from datetime import datetime, timezone, timedelta

import httpx

logger = logging.getLogger(__name__)

# Approximate cost per 1K tokens (blended input+output avg for GPT-4.1/5.x)
COST_PER_1K_TOKENS = 0.01  # rough estimate, $10 per 1M tokens


async def fetch_openai_usage() -> dict | None:
    """Fetch current month usage from OpenAI API.

    Uses /v1/usage endpoint (works with standard project keys).
    Falls back gracefully if no data available.

    Returns:
        {"total_cost_usd": float, "total_tokens": int, "synced": bool}
        or None if no API key configured.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set, skipping OpenAI sync")
        return None

    now = datetime.now(timezone.utc)
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    headers = {"Authorization": f"Bearer {api_key}"}

    async with httpx.AsyncClient() as client:
        total_tokens = 0

        # Fetch each day of the current month via /v1/usage
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
                    # Sum tokens from completions data
                    for entry in data.get("data", []):
                        total_tokens += entry.get("n_context_tokens_total", 0)
                        total_tokens += entry.get("n_generated_tokens_total", 0)
                    # Also check whisper, tts, dalle
                    for entry in data.get("whisper_api_data", []):
                        total_tokens += entry.get("num_seconds", 0) * 100  # rough token equiv
                    for entry in data.get("tts_api_data", []):
                        total_tokens += entry.get("num_characters", 0)
                    for entry in data.get("dalle_api_data", []):
                        total_tokens += entry.get("num_images", 0) * 10000  # rough equiv
                elif resp.status_code == 401 or resp.status_code == 403:
                    logger.warning(f"OpenAI /v1/usage auth error: {resp.status_code}")
                    return {"total_cost_usd": 0.0, "total_tokens": 0, "synced": False}
            except Exception as e:
                logger.warning(f"OpenAI usage endpoint error for {date_str}: {e}")
            
            day += timedelta(days=1)

        # Estimate cost from tokens
        estimated_cost = (total_tokens / 1000) * COST_PER_1K_TOKENS
        logger.info(f"OpenAI usage: {total_tokens} tokens, estimated ${estimated_cost:.2f}")
        return {"total_cost_usd": estimated_cost, "total_tokens": total_tokens, "synced": True}
