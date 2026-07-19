from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import PharmacyUser
from app.schemas import OtpRequest, OtpVerify, TokenOut
from app.services.otp import issue_otp, verify_otp
from app.services.sms import send_sms

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/request-otp", status_code=204)
async def request_otp(body: OtpRequest, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(PharmacyUser).where(PharmacyUser.phone == body.phone))
    if user is None:
        # Onboarding is manual in the MVP — no self-serve signup.
        raise HTTPException(404, "Phone not registered. Contact the MedsAlert team to onboard your pharmacy.")
    code = await issue_otp(body.phone)
    await send_sms(body.phone, f"Your MedsAlert login code is {code}. Valid for 5 minutes.")


@router.post("/verify-otp", response_model=TokenOut)
async def verify(body: OtpVerify, db: AsyncSession = Depends(get_db)):
    if not await verify_otp(body.phone, body.code):
        raise HTTPException(401, "Invalid or expired code")

    user = await db.scalar(select(PharmacyUser).where(PharmacyUser.phone == body.phone))
    if user is None:
        raise HTTPException(404, "Phone not registered")

    token = jwt.encode(
        {
            "sub": str(user.id),
            "pharmacy_id": user.pharmacy_id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expiry_hours),
        },
        settings.jwt_secret_key,
        algorithm="HS256",
    )
    return TokenOut(access_token=token)
