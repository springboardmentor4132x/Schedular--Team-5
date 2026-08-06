from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from api.roles.post import MediaType, Status
from api.roles.post_social_account import PublishStatus


class PostCreate(BaseModel):
    client_id: Optional[int] = None
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


# =========================================================
# SOCIAL ACCOUNT INFORMATION RETURNED WITH A POST
# =========================================================

class PostSocialAccountResponse(BaseModel):
    id: int
    platform: str
    account_name: Optional[str] = None
    account_id: Optional[str] = None
    publish_status: PublishStatus
    platform_post_id: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# POST RESPONSE
# =========================================================

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

    # IMPORTANT:
    # This is what was missing before.
    social_accounts: List[PostSocialAccountResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(
        from_attributes=True
    )


class SchedulePost(BaseModel):
    user_id: int
    account_id: int | str
    content: str
    scheduled_time: datetime
    media_url: str