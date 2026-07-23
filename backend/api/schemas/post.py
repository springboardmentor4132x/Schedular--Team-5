
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

from api.roles.post import MediaType, Status


class PostCreate(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: MediaType
    scheduled_time: Optional[datetime] = None

    # Default timezone for new posts is Indian Standard Time
    timezone: Optional[str] = "Asia/Kolkata"

    campaign_id: Optional[int] = None
    social_account_ids: List[int] = []  # platforms this post should publish to
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

