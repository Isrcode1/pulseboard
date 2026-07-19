from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import AlertStatus, Drug, StockAlert
from app.schemas import AlertCreate

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.post("", status_code=201)
async def create_alert(body: AlertCreate, db: AsyncSession = Depends(get_db)):
    """Patient waitlist: 'text me when this drug is available'."""
    if await db.get(Drug, body.drug_id) is None:
        raise HTTPException(404, "Unknown drug")

    existing = await db.scalar(
        select(StockAlert).where(
            StockAlert.phone == body.phone,
            StockAlert.drug_id == body.drug_id,
            StockAlert.status == AlertStatus.pending,
        )
    )
    if existing:
        return {"id": existing.id, "status": "already_subscribed"}

    alert = StockAlert(phone=body.phone, drug_id=body.drug_id, lat=body.lat, lng=body.lng)
    db.add(alert)
    await db.commit()
    return {"id": alert.id, "status": "subscribed"}
