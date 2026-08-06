from datetime import datetime

from pydantic import BaseModel, ConfigDict

from api.roles.notification import NotificationType


class NotificationResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    user_id: int
    title: str
    description: str
    type: NotificationType
    is_read: bool
    related_post_id: int | None
    related_campaign_id: int | None
    created_at: datetime