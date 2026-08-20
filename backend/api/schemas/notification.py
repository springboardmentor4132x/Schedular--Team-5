from datetime import datetime

from pydantic import BaseModel, ConfigDict

from api.roles.notification import NotificationType


# =========================================================
# NOTIFICATION
# =========================================================


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


class NotificationUnreadCountResponse(BaseModel):

    unread_count: int


# =========================================================
# NOTIFICATION HISTORY
# =========================================================


class NotificationHistoryResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    user_id: int
    title: str
    description: str
    type: NotificationType
    category: str
    delivery_channel: str
    is_read: bool
    related_post_id: int | None
    related_campaign_id: int | None
    created_at: datetime


class NotificationHistoryDetailResponse(
    NotificationHistoryResponse
):
    pass


class NotificationHistoryDeleteResponse(BaseModel):

    message: str
    notification_id: int


# =========================================================
# NOTIFICATION PREFERENCES
# =========================================================


class NotificationSettingsResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    user_id: int

    publishing_notifications_enabled: bool
    campaign_notifications_enabled: bool
    account_activity_notifications_enabled: bool
    team_collaboration_notifications_enabled: bool
    system_notifications_enabled: bool

    in_app_notifications_enabled: bool
    email_notifications_enabled: bool
    push_notifications_enabled: bool

    email_frequency: str
    promotional_emails_enabled: bool

    created_at: datetime
    updated_at: datetime


class NotificationSettingsUpdate(BaseModel):

    publishing_notifications_enabled: bool | None = None
    campaign_notifications_enabled: bool | None = None
    account_activity_notifications_enabled: bool | None = None
    team_collaboration_notifications_enabled: bool | None = None
    system_notifications_enabled: bool | None = None

    in_app_notifications_enabled: bool | None = None
    email_notifications_enabled: bool | None = None
    push_notifications_enabled: bool | None = None

    email_frequency: str | None = None
    promotional_emails_enabled: bool | None = None


# =========================================================
# EMAIL PREFERENCES
# =========================================================


class EmailPreferencesResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    email_notifications_enabled: bool
    email_frequency: str
    promotional_emails_enabled: bool


class EmailPreferencesUpdate(BaseModel):

    email_notifications_enabled: bool | None = None
    email_frequency: str | None = None
    promotional_emails_enabled: bool | None = None