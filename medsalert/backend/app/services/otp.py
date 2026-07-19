import secrets

import redis.asyncio as redis
from fastapi import HTTPException

from app.config import settings

_redis = redis.from_url(settings.redis_url, decode_responses=True)


async def issue_otp(phone: str) -> str:
    rate_key = f"otp_rate:{phone}"
    count = await _redis.incr(rate_key)
    if count == 1:
        await _redis.expire(rate_key, 3600)
    if count > settings.otp_max_requests_per_hour:
        raise HTTPException(429, "Too many OTP requests. Try again later.")

    code = f"{secrets.randbelow(1_000_000):06d}"
    await _redis.set(f"otp:{phone}", code, ex=settings.otp_ttl_seconds)
    return code


async def verify_otp(phone: str, code: str) -> bool:
    key = f"otp:{phone}"
    stored = await _redis.get(key)
    if stored is None or not secrets.compare_digest(stored, code):
        return False
    await _redis.delete(key)
    return True
