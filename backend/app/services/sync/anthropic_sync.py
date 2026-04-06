"""Anthropic usage sync connector.

Anthropic does NOT have a public billing/usage API endpoint.
This connector validates the API key and estimates usage based on
a minimal API call + token counting from response headers.

The real usage should be updated manually from console.anthropic.com
until Anthropic provides a billing API.
"""
import logging
import os
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

# Approximate cost per 1M tokens for Claude Sonnet 4.6 (blended input/output)
# Input: $3/1M, Output: $15/1M → blended ~$6/1M assuming 3:1 input:output ratio
COST_PER_1M_TOKENS = 6.0


async def fetch_anthropic_usage() -> dict | None:
    """Check Anthropic API key validity and estimate monthly usage.

    Uses the /v1/messages endpoint with a minimal request to:
    1. Verify the API key works
    2. Read rate limit headers for usage hints

    Returns:
        {"estimated_cost_usd": float, "api_key_valid": bool, "synced": bool}
        or None if no API key configured.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set, skipping Anthropic sync")
        return None

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2024-10-22",
        "content-type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        try:
            # Minimal API call to verify key and get rate limit headers
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json={
                    "model": "claude-haiku-4-5",
                    "max_tokens": 1,
                    "messages": [{"role": "user", "content": "hi"}],
                },
                timeout=15,
            )

            if resp.status_code in (401, 403):
                logger.warning(f"Anthropic API auth error: {resp.status_code}")
                return {"estimated_cost_usd": 0.0, "api_key_valid": False, "synced": False}

            # Extract usage from response headers if available
            rate_limit_tokens = resp.headers.get("anthropic-ratelimit-tokens-limit", "0")
            rate_limit_remaining = resp.headers.get("anthropic-ratelimit-tokens-remaining", "0")

            # Extract usage from response body
            usage_data = {}
            if resp.status_code == 200:
                data = resp.json()
                usage = data.get("usage", {})
                input_tokens = usage.get("input_tokens", 0)
                output_tokens = usage.get("output_tokens", 0)
                usage_data = {
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                }

            # We can't get total monthly usage from the API
            # Return what we know — the sync service will keep the existing
            # consumed value and just update sync status
            logger.info(
                f"Anthropic API key valid. Rate limits: {rate_limit_tokens} tokens/min. "
                f"Last call usage: {usage_data}"
            )

            return {
                "api_key_valid": True,
                "synced": True,
                "rate_limit_tokens": int(rate_limit_tokens),
                "rate_limit_remaining": int(rate_limit_remaining),
                **usage_data,
            }

        except Exception as e:
            logger.error(f"Anthropic sync error: {e}")
            return {"estimated_cost_usd": 0.0, "api_key_valid": False, "synced": False}
