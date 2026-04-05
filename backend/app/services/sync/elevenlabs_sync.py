"""ElevenLabs usage sync connector."""
import logging
import os

import httpx

logger = logging.getLogger(__name__)


async def fetch_elevenlabs_usage() -> dict | None:
    """Fetch subscription info from ElevenLabs.

    Returns:
        {
            "character_count": int,
            "character_limit": int,
            "tier": str,
            "next_invoice_date_unix": int,
            "synced": bool,
        }
        or None if no API key configured.
    """
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        logger.warning("ELEVENLABS_API_KEY not set, skipping ElevenLabs sync")
        return None

    headers = {"xi-api-key": api_key}

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://api.elevenlabs.io/v1/user/subscription",
                headers=headers,
                timeout=15,
            )
            logger.info(f"ElevenLabs subscription endpoint status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                result = {
                    "character_count": data.get("character_count", 0),
                    "character_limit": data.get("character_limit", 0),
                    "tier": data.get("tier", "unknown"),
                    "next_invoice_date_unix": data.get("next_invoice_date_unix", 0),
                    "synced": True,
                }
                logger.info(
                    f"ElevenLabs: {result['character_count']}/{result['character_limit']} chars, tier={result['tier']}"
                )
                return result
            else:
                logger.error(f"ElevenLabs API error: {resp.status_code} - {resp.text[:200]}")
        except Exception as e:
            logger.error(f"ElevenLabs sync error: {e}")

    return {"synced": False}
