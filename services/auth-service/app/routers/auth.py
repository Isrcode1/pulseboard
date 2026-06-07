import hashlib
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.config import settings
from app.utils.jwt import create_access_token, create_refresh_token_str, decode_token
from app.utils.github import exchange_code_for_token, get_github_user
from app import models, schemas

router = APIRouter()

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"


@router.get("/github/login")
async def github_login():
    url = (
        f"{GITHUB_AUTH_URL}"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
        f"&scope=user:email+read:user"
    )
    return RedirectResponse(url)


@router.get("/github/callback", response_model=schemas.TokenResponse)
async def github_callback(code: str, db: AsyncSession = Depends(get_db)):
    # Exchange code for GitHub token
    github_token = await exchange_code_for_token(code)
    if not github_token:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid OAuth code")

    # Get user info from GitHub
    gh_user = await get_github_user(github_token)
    if "id" not in gh_user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Could not fetch GitHub user")

    # Upsert user
    result = await db.execute(
        select(models.User).where(models.User.github_id == gh_user["id"])
    )
    user = result.scalar_one_or_none()

    if user is None:
        user = models.User(
            github_id=gh_user["id"],
            github_username=gh_user["login"],
            github_avatar_url=gh_user.get("avatar_url"),
            github_email=gh_user.get("email"),
            github_name=gh_user.get("name"),
            github_token=github_token,
        )
        db.add(user)
    else:
        user.github_token = github_token
        user.github_avatar_url = gh_user.get("avatar_url")
        user.github_name = gh_user.get("name")
        user.last_login_at = datetime.now(timezone.utc)

    await db.flush()

    # Create tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token_str = create_refresh_token_str(str(user.id))

    # Store refresh token hash
    token_hash = hashlib.sha256(refresh_token_str.encode()).hexdigest()
    refresh_token_obj = models.RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(
            days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
        ),
    )
    db.add(refresh_token_obj)

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        user=schemas.UserOut.model_validate(user),
    )


@router.post("/verify", response_model=schemas.TokenVerifyResponse)
async def verify_token(token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

    result = await db.execute(
        select(models.User).where(models.User.id == payload["sub"])
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    return schemas.TokenVerifyResponse(
        user_id=str(user.id),
        github_username=user.github_username,
        valid=True,
    )
