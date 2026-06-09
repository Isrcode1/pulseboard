import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class SkillCreate(BaseModel):
    name: str
    proficiency: int = 50
    category: Optional[str] = None
    display_order: int = 0


class SkillOut(SkillCreate):
    id: uuid.UUID
    model_config = {"from_attributes": True}


class SocialLinkCreate(BaseModel):
    platform: str
    url: str
    username: Optional[str] = None


class SocialLinkOut(SocialLinkCreate):
    id: uuid.UUID
    model_config = {"from_attributes": True}


class PinnedProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    repo_url: Optional[str] = None
    live_url: Optional[str] = None
    display_order: int = 0


class PinnedProjectOut(PinnedProjectCreate):
    id: uuid.UUID
    model_config = {"from_attributes": True}


class ProfileCreate(BaseModel):
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    website_url: Optional[str] = None
    currently_building: Optional[str] = None
    theme: str = "cyber"
    is_public: bool = True
    open_to_work: bool = False


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    website_url: Optional[str] = None
    currently_building: Optional[str] = None
    theme: Optional[str] = None
    is_public: Optional[bool] = None
    open_to_work: Optional[bool] = None


class ProfileOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    username: str
    display_name: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    headline: Optional[str]
    website_url: Optional[str]
    currently_building: Optional[str]
    theme: str
    is_public: bool
    open_to_work: bool
    created_at: datetime
    updated_at: datetime
    skills: List[SkillOut] = []
    social_links: List[SocialLinkOut] = []
    pinned_projects: List[PinnedProjectOut] = []

    model_config = {"from_attributes": True}
