from datetime import datetime
<<<<<<< HEAD
from typing import List, Optional

from pydantic import BaseModel, Field
=======

from pydantic import BaseModel
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)

from api.roles.post import MediaType, Status


class PostCreate(BaseModel):
<<<<<<< HEAD
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
=======
    content: str | None = None
    media_url: str | None = None
    media_type: MediaType
    scheduled_time: datetime | None = None
    campaign_id: int | None = None


class PostUpdate(BaseModel):
    content: str | None = None
    media_url: str | None = None
    media_type: MediaType | None = None
    scheduled_time: datetime | None = None
    campaign_id: int | None = None
    status: Status | None = None
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)


class PostResponse(BaseModel):
    id: int
    user_id: int
<<<<<<< HEAD
    campaign_id: Optional[int]

    content: Optional[str]
    media_url: Optional[str]
    media_type: MediaType

    scheduled_time: Optional[datetime]
    timezone: Optional[str]

    published_time: Optional[datetime]

    status: Status

=======
    campaign_id: int | None = None
    content: str | None = None
    media_url: str | None = None
    media_type: MediaType
    scheduled_time: datetime | None = None
    published_time: datetime | None = None
    status: Status
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True