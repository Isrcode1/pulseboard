import math
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models import Drug, SearchLog, StockEntry, StockStatus
from app.schemas import SearchResponse, SearchResult

router = APIRouter(tags=["search"])


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    # Fine at city scale with <100 pharmacies; move to PostGIS when this
    # query needs an index instead of a scan.
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = math.radians(lat2 - lat1), math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


@router.get("/search", response_model=SearchResponse)
async def search(
    drug_id: int,
    lat: float = Query(ge=-90, le=90),
    lng: float = Query(ge=-180, le=180),
    radius_km: float = Query(default=settings.default_search_radius_km, gt=0, le=50),
    db: AsyncSession = Depends(get_db),
):
    drug = await db.get(Drug, drug_id)
    if drug is None:
        raise HTTPException(404, "Unknown drug")

    entries = (
        await db.scalars(
            select(StockEntry)
            .where(
                StockEntry.drug_id == drug_id,
                StockEntry.status != StockStatus.out_of_stock,
            )
            .options(selectinload(StockEntry.pharmacy))
        )
    ).all()

    stale_cutoff = datetime.now(timezone.utc) - timedelta(hours=settings.stock_stale_hours)
    results = []
    for entry in entries:
        distance = haversine_km(lat, lng, entry.pharmacy.lat, entry.pharmacy.lng)
        if distance > radius_km:
            continue
        results.append(
            SearchResult(
                pharmacy=entry.pharmacy,
                status=entry.status,
                price=entry.price,
                updated_at=entry.updated_at,
                distance_km=round(distance, 2),
                fresh=entry.updated_at >= stale_cutoff,
            )
        )

    # Fresh entries first, then by distance — stale data exists but never
    # outranks confirmed stock.
    results.sort(key=lambda r: (not r.fresh, r.distance_km))

    # Every search is demand data — this table is the future revenue line.
    db.add(SearchLog(drug_id=drug_id, lat=lat, lng=lng, results_count=len(results)))
    await db.commit()

    return SearchResponse(drug=drug, results=results)
