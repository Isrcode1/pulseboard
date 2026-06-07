import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class UserOut(BaseModel):
    id: uuid.UUID
    github_username: str
    github_name: Optional[str]
    github_avatar_url: Optional[str]
    github_email: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenVerifyResponse(BaseModel):
    user_id: str
    github_username: str
    valid: bool
