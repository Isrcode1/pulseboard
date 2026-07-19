from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Drug
from app.schemas import DrugOut

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/drugs", response_model=list[DrugOut])
async def list_drugs(
    q: str = Query(default="", max_length=80),
    db: AsyncSession = Depends(get_db),
):
    """Autocomplete over the curated catalog — matches generic and brand names."""
    stmt = select(Drug).order_by(Drug.generic_name)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(or_(Drug.generic_name.ilike(pattern), Drug.brand_names.ilike(pattern)))
    return (await db.scalars(stmt.limit(20))).all()
