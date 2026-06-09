from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/p/{username}", response_model=schemas.ProfileOut)
async def get_public_profile(
    username: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Profile)
        .options(
            selectinload(models.Profile.skills),
            selectinload(models.Profile.social_links),
            selectinload(models.Profile.pinned_projects),
        )
        .where(
            models.Profile.username == username,
            models.Profile.is_public == True
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, f"Profile '{username}' not found")
    return profile
