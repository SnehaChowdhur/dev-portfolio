from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# --- Project Schemas ---
class ProjectBase(BaseModel):
    title: str
    description: str
    tech_stack: str
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Post (Blog) Schemas ---
class PostBase(BaseModel):
    title: str
    slug: str
    content: str
    tags: Optional[str] = None


class PostCreate(PostBase):
    pass


class PostResponse(PostBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Auth / User Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str