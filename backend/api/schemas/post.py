from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from api.roles.post import MediaType, Status


class PostCreate(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: MediaType

    scheduled_time: Optional[datetime] = None

    timezone: Optional[str] = "Asia/Kolkata"

    campaign_id: Optional[int] = None

    social_account_ids: List[int] = Field(
        default_factory=list
    )

    save_as_draft: bool = False


class PostUpdate(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[MediaType] = None
    scheduled_time: Optional[datetime] = None
    timezone: Optional[str] = None
    campaign_id: Optional[int] = None
    social_account_ids: Optional[List[int]] = None


class PostResponse(BaseModel):
    id: int
    user_id: int
    campaign_id: Optional[int]

    content: Optional[str]
    media_url: Optional[str]
    media_type: MediaType

    scheduled_time: Optional[datetime]
    timezone: Optional[str]

    published_time: Optional[datetime]

    status: Status

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True