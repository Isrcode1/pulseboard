from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models import (
    AlertStatus,
    Drug,
    Pharmacy,
    PharmacyUser,
    SearchLog,
    StockAlert,
    StockEntry,
    StockStatus,
)
from app.schemas import PharmacyOut, StatsOut, StockRow, StockUpdate
from app.services.sms import send_sms

router = APIRouter(prefix="/pharmacy", tags=["pharmacy"])


@router.get("/me", response_model=PharmacyOut)
async def me(user: PharmacyUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await db.get(Pharmacy, user.pharmacy_id)


@router.get("/stock", response_model=list[StockRow])
async def list_stock(
    user: PharmacyUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Every catalog drug, with this pharmacy's entry if one exists."""
    drugs = (await db.scalars(select(Drug).order_by(Drug.category, Drug.generic_name))).all()
    entries = {
        e.drug_id: e
        for e in await db.scalars(
            select(StockEntry).where(StockEntry.pharmacy_id == user.pharmacy_id)
        )
    }
    return [
        StockRow(
            drug=d,
            status=entries[d.id].status if d.id in entries else None,
            price=entries[d.id].price if d.id in entries else None,
            updated_at=entries[d.id].updated_at if d.id in entries else None,
        )
        for d in drugs
    ]


@router.put("/stock/{drug_id}", response_model=StockRow)
async def update_stock(
    drug_id: int,
    body: StockUpdate,
    user: PharmacyUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    drug = await db.get(Drug, drug_id)
    if drug is None:
        raise HTTPException(404, "Unknown drug")

    entry = await db.scalar(
        select(StockEntry).where(
            StockEntry.pharmacy_id == user.pharmacy_id, StockEntry.drug_id == drug_id
        )
    )
    if entry is None:
        entry = StockEntry(pharmacy_id=user.pharmacy_id, drug_id=drug_id)
        db.add(entry)
    entry.status = body.status
    entry.price = body.price
    entry.updated_at = datetime.now(timezone.utc)
    await db.commit()

    if body.status == StockStatus.in_stock:
        await _notify_waitlist(db, drug, user.pharmacy_id)

    return StockRow(drug=drug, status=entry.status, price=entry.price, updated_at=entry.updated_at)


@router.post("/confirm", status_code=204)
async def confirm_stock(
    user: PharmacyUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """One-tap 'stock unchanged today' — refreshes every entry's timestamp."""
    await db.execute(
        update(StockEntry)
        .where(StockEntry.pharmacy_id == user.pharmacy_id)
        .values(updated_at=datetime.now(timezone.utc))
    )
    await db.commit()


@router.get("/stats", response_model=StatsOut)
async def stats(
    user: PharmacyUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """The retention hook: show pharmacies the demand they're capturing."""
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    stocked = select(StockEntry.drug_id).where(
        StockEntry.pharmacy_id == user.pharmacy_id,
        StockEntry.status != StockStatus.out_of_stock,
    )
    searches = await db.scalar(
        select(func.count(SearchLog.id)).where(
            SearchLog.drug_id.in_(stocked), SearchLog.created_at >= week_ago
        )
    )
    pending = await db.scalar(
        select(func.count(StockAlert.id)).where(StockAlert.status == AlertStatus.pending)
    )
    return StatsOut(searches_this_week=searches or 0, alerts_pending=pending or 0)


async def _notify_waitlist(db: AsyncSession, drug: Drug, pharmacy_id: int) -> None:
    pharmacy = await db.get(Pharmacy, pharmacy_id)
    alerts = (
        await db.scalars(
            select(StockAlert).where(
                StockAlert.drug_id == drug.id, StockAlert.status == AlertStatus.pending
            )
        )
    ).all()
    for alert in alerts:
        await send_sms(
            alert.phone,
            f"MedsAlert: {drug.generic_name} {drug.strength} is now in stock at "
            f"{pharmacy.name}, {pharmacy.address}. Call {pharmacy.phone}.",
        )
        alert.status = AlertStatus.notified
        alert.notified_at = datetime.now(timezone.utc)
    await db.commit()
