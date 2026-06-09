import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.database import get_db
from app.config import settings
from app import models, schemas

router = APIRouter()


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> uuid.UUID:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing token")
    token = authorization.split(" ")[1]
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.AUTH_SERVICE_URL}/auth/verify",
            params={"token": token},
        )
    if resp.status_code != 200:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    return uuid.UUID(resp.json()["user_id"])


@router.post("/profile", response_model=schemas.ProfileOut, status_code=201)
async def create_profile(
    data: schemas.ProfileCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(models.Profile).where(models.Profile.user_id == user_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Profile already exists. Use PUT to update.")

    username_taken = await db.execute(
        select(models.Profile).where(models.Profile.username == data.username)
    )
    if username_taken.scalar_one_or_none():
        raise HTTPException(400, "Username already taken")

    profile = models.Profile(user_id=user_id, **data.model_dump())
    db.add(profile)
    await db.flush()
    await db.refresh(profile)
    return profile


@router.get("/profile/me", response_model=schemas.ProfileOut)
async def get_my_profile(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Profile).where(models.Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Profile not found. Create one first.")
    return profile


@router.put("/profile/me", response_model=schemas.ProfileOut)
async def update_profile(
    data: schemas.ProfileUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Profile).where(models.Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Profile not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(profile, field, value)

    await db.flush()
    await db.refresh(profile)
    return profile


@router.post("/profile/me/skills", response_model=schemas.SkillOut, status_code=201)
async def add_skill(
    data: schemas.SkillCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Profile).where(models.Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Profile not found")

    skill = models.Skill(profile_id=profile.id, **data.model_dump())
    db.add(skill)
    await db.flush()
    await db.refresh(skill)
    return skill


@router.delete("/profile/me/skills/{skill_id}", status_code=204)
async def delete_skill(
    skill_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Profile).where(models.Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Profile not found")

    skill_result = await db.execute(
        select(models.Skill).where(
            models.Skill.id == skill_id,
            models.Skill.profile_id == profile.id
        )
    )
    skill = skill_result.scalar_one_or_none()
    if not skill:
        raise HTTPException(404, "Skill not found")

    await db.delete(skill)


@router.post("/profile/me/social-links", response_model=schemas.SocialLinkOut, status_code=201)
async def add_social_link(
    data: schemas.SocialLinkCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Profile).where(models.Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Profile not found")

    link = models.SocialLink(profile_id=profile.id, **data.model_dump())
    db.add(link)
    await db.flush()
    await db.refresh(link)
    return link


@router.post("/profile/me/projects", response_model=schemas.PinnedProjectOut, status_code=201)
async def add_project(
    data: schemas.PinnedProjectCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Profile).where(models.Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Profile not found")

    project = models.PinnedProject(profile_id=profile.id, **data.model_dump())
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project
