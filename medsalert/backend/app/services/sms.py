import logging

import httpx

from app.config import settings

logger = logging.getLogger("medsalert.sms")


async def send_sms(phone: str, message: str) -> None:
    """Send an SMS via the configured provider.

    'console' logs the message (local dev); 'termii' uses the Termii API
    (popular in NG — swap for Africa's Talking or Twilio by adding a branch).
    """
    if settings.sms_provider == "termii":
        await _send_termii(phone, message)
    else:
        logger.info("[SMS → %s] %s", phone, message)


async def _send_termii(phone: str, message: str) -> None:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            "https://api.ng.termii.com/api/sms/send",
            json={
                "to": phone,
                "from": settings.termii_sender_id,
                "sms": message,
                "type": "plain",
                "channel": "generic",
                "api_key": settings.termii_api_key,
            },
        )
        if resp.status_code >= 400:
            logger.error("Termii send failed (%s): %s", resp.status_code, resp.text)
