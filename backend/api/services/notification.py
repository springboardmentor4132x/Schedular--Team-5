from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo

from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from api.database.session import SessionLocal
from api.models.notification import Notification
from api.models.notification_preference import NotificationPreference
from api.roles.notification import NotificationType


# =========================================================
# TIMEZONE
# =========================================================

INDIA_TIMEZONE = ZoneInfo("Asia/Kolkata")


# =========================================================
# INTERNAL DATABASE HELPER
# =========================================================

def _get_notification_db() -> Session:
    """
    Create and return a database session.
    """
    return SessionLocal()


# =========================================================
# NOTIFICATION TYPE HELPERS
# =========================================================

def _ensure_notification_type(
    notification_type,
) -> str:
    """
    Convert NotificationType enum values into the string
    expected by the Notification model/database.

    If an invalid or missing value is supplied, INFO is used.
    """

    if notification_type is None:
        return "info"

    if isinstance(
        notification_type,
        NotificationType,
    ):
        return str(
            notification_type.value
        )

    try:
        value = str(
            notification_type
        ).strip().lower()
    except Exception:
        return "info"

    try:
        normalized = NotificationType(
            value
        )

        return str(
            normalized.value
        )

    except (
        ValueError,
        TypeError,
    ):
        return "info"


def _notification_type_from_status(
    status: str | None,
) -> str:
    """
    Convert a post status into a notification type.
    """

    if status is None:
        return "info"

    normalized_status = str(
        status
    ).strip().lower()

    status_mapping = {
        "scheduled": "success",
        "published": "success",
        "publishing": "info",
        "draft": "info",
        "pending_approval": "info",
        "updated": "info",
        "rescheduled": "info",
        "cancelled": "warning",
        "canceled": "warning",
        "failed": "error",
    }

    return status_mapping.get(
        normalized_status,
        "info",
    )


# =========================================================
# GET OR CREATE NOTIFICATION PREFERENCES
# =========================================================

def _get_or_create_notification_preference(
    db: Session,
    user_id: int,
) -> NotificationPreference:
    """
    Get the notification preferences for a user.

    If the user does not have a preference record yet,
    create one using the model defaults.
    """

    preference = (
        db.query(
            NotificationPreference
        )
        .filter(
            NotificationPreference.user_id
            == user_id
        )
        .first()
    )

    if preference is None:
        preference = NotificationPreference(
            user_id=user_id,
        )

        db.add(preference)
        db.flush()

    return preference


# =========================================================
# CREATE NOTIFICATION
# =========================================================

def create_notification(
    user_id: int,
    title: str,
    description: str,
    notification_type: str = "info",
    category: str = "system",
    delivery_channel: str = "in_app",
    related_post_id: int | None = None,
    related_campaign_id: int | None = None,
) -> Notification | None:
    """
    Create a notification for a specific user.
    """

    db = _get_notification_db()

    try:

        notification_type = (
            _ensure_notification_type(
                notification_type
            )
        )

        preference = (
            _get_or_create_notification_preference(
                db=db,
                user_id=user_id,
            )
        )

        category_preferences = {
            "publishing": (
                preference.publishing_notifications_enabled
            ),
            "campaign": (
                preference.campaign_notifications_enabled
            ),
            "account_activity": (
                preference.account_activity_notifications_enabled
            ),
            "team_collaboration": (
                preference.team_collaboration_notifications_enabled
            ),
            "system": (
                preference.system_notifications_enabled
            ),
        }

        category_enabled = category_preferences.get(
            category,
            True,
        )

        if not category_enabled:

            print(
                "=================================================",
                flush=True,
            )

            print(
                ">>> NOTIFICATION BLOCKED BY USER PREFERENCE",
                flush=True,
            )

            print(
                f">>> USER ID: {user_id}",
                flush=True,
            )

            print(
                f">>> CATEGORY: {category}",
                flush=True,
            )

            print(
                "=================================================",
                flush=True,
            )

            db.rollback()

            return None

        if delivery_channel == "in_app":

            if not preference.in_app_notifications_enabled:

                print(
                    ">>> IN-APP NOTIFICATION BLOCKED",
                    flush=True,
                )

                print(
                    f">>> USER ID: {user_id}",
                    flush=True,
                )

                db.rollback()

                return None

        elif delivery_channel == "email":

            if not preference.email_notifications_enabled:

                print(
                    ">>> EMAIL NOTIFICATION BLOCKED",
                    flush=True,
                )

                print(
                    f">>> USER ID: {user_id}",
                    flush=True,
                )

                db.rollback()

                return None

        elif delivery_channel == "push":

            if not preference.push_notifications_enabled:

                print(
                    ">>> PUSH NOTIFICATION BLOCKED",
                    flush=True,
                )

                print(
                    f">>> USER ID: {user_id}",
                    flush=True,
                )

                db.rollback()

                return None

        notification = Notification(
            user_id=user_id,
            title=title,
            description=description,
            type=notification_type,
            category=category,
            delivery_channel=delivery_channel,
            is_read=False,
            related_post_id=related_post_id,
            related_campaign_id=related_campaign_id,
        )

        db.add(notification)

        db.commit()

        db.refresh(notification)

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> NOTIFICATION CREATED",
            flush=True,
        )

        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )

        print(
            f">>> TITLE: {title}",
            flush=True,
        )

        print(
            f">>> TYPE: {notification_type}",
            flush=True,
        )

        print(
            f">>> CATEGORY: {category}",
            flush=True,
        )

        print(
            f">>> CHANNEL: {delivery_channel}",
            flush=True,
        )

        if related_campaign_id is not None:

            print(
                f">>> RELATED CAMPAIGN ID: "
                f"{related_campaign_id}",
                flush=True,
            )

        if related_post_id is not None:

            print(
                f">>> RELATED POST ID: "
                f"{related_post_id}",
                flush=True,
            )

        print(
            "=================================================",
            flush=True,
        )

        return notification

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# CREATE POST ACTIVITY NOTIFICATIONS
# =========================================================

def create_post_activity_notifications(
    post_owner_id: int | None = None,
    title: str | None = None,
    description: str | None = None,
    notification_type: NotificationType | str | None = None,
    related_post_id: int | None = None,
    related_campaign_id: int | None = None,
    post=None,
    status: str | None = None,
    platform_results=None,
    error_message: str | None = None,
):
    """
    Create publishing/activity notifications for a post.

    Recipients:

        1. Post owner
        2. Assigned Marketing Team user

    Notification failures are isolated from the
    actual post operation.
    """

    if post is not None:

        if post_owner_id is None:

            post_owner_id = getattr(
                post,
                "user_id",
                None,
            )

        if related_post_id is None:

            related_post_id = getattr(
                post,
                "id",
                None,
            )

        if related_campaign_id is None:

            related_campaign_id = getattr(
                post,
                "campaign_id",
                None,
            )

    if post_owner_id is None:

        raise ValueError(
            "post_owner_id is required"
        )

    post_owner_id = int(
        post_owner_id
    )

    if title is None:

        title = "Post Activity"

    if description is None:

        if error_message:

            description = error_message

        elif status:

            description = (
                f"Post activity status: {status}"
            )

        else:

            description = (
                "There is an update regarding your post."
            )

    if notification_type is None:

        notification_type = (
            _notification_type_from_status(
                status
            )
        )

    notification_type = (
        _ensure_notification_type(
            notification_type
        )
    )

    db = SessionLocal()

    try:

        recipient_ids: list[int] = []

        recipient_ids.append(
            post_owner_id
        )

        try:

            from api.models.business_assignment import (
                BusinessAssignment,
            )

            assignments = (
                db.query(
                    BusinessAssignment
                )
                .filter(
                    BusinessAssignment.business_user_id
                    == post_owner_id
                )
                .all()
            )

            print(
                "=================================================",
                flush=True,
            )

            print(
                ">>> MARKETING TEAM ASSIGNMENTS FOUND",
                flush=True,
            )

            print(
                f">>> BUSINESS USER ID: "
                f"{post_owner_id}",
                flush=True,
            )

            print(
                f">>> ASSIGNMENT COUNT: "
                f"{len(assignments)}",
                flush=True,
            )

            for assignment in assignments:

                marketing_team_id = getattr(
                    assignment,
                    "marketing_team_id",
                    None,
                )

                if marketing_team_id is None:
                    continue

                marketing_team_id = int(
                    marketing_team_id
                )

                print(
                    f">>> MARKETING TEAM USER ID: "
                    f"{marketing_team_id}",
                    flush=True,
                )

                if (
                    marketing_team_id
                    not in recipient_ids
                ):

                    recipient_ids.append(
                        marketing_team_id
                    )

            print(
                "=================================================",
                flush=True,
            )

        except Exception as assignment_error:

            print(
                "=================================================",
                flush=True,
            )

            print(
                ">>> MARKETING TEAM LOOKUP FAILED",
                flush=True,
            )

            print(
                f">>> ERROR: "
                f"{assignment_error}",
                flush=True,
            )

            print(
                "=================================================",
                flush=True,
            )

        recipient_ids = list(
            dict.fromkeys(
                recipient_ids
            )
        )

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> CREATING POST ACTIVITY NOTIFICATIONS",
            flush=True,
        )

        print(
            f">>> POST ID: "
            f"{related_post_id}",
            flush=True,
        )

        print(
            f">>> POST OWNER ID: "
            f"{post_owner_id}",
            flush=True,
        )

        print(
            f">>> NOTIFICATION TITLE: "
            f"{title}",
            flush=True,
        )

        print(
            f">>> NOTIFICATION TYPE: "
            f"{notification_type}",
            flush=True,
        )

        print(
            f">>> NOTIFICATION CATEGORY: publishing",
            flush=True,
        )

        print(
            f">>> NOTIFICATION RECIPIENT IDS: "
            f"{recipient_ids}",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        notifications = []

        for recipient_id in recipient_ids:

            print(
                "-------------------------------------------------",
                flush=True,
            )

            print(
                ">>> CREATING POST ACTIVITY NOTIFICATION",
                flush=True,
            )

            print(
                f">>> RECIPIENT USER ID: "
                f"{recipient_id}",
                flush=True,
            )

            try:

                notification = create_notification(
                    user_id=recipient_id,
                    title=title,
                    description=description,
                    notification_type=notification_type,
                    category="publishing",
                    delivery_channel="in_app",
                    related_post_id=related_post_id,
                    related_campaign_id=related_campaign_id,
                )

                if notification is not None:

                    notifications.append(
                        notification
                    )

                    print(
                        ">>> POST ACTIVITY NOTIFICATION "
                        "CREATED SUCCESSFULLY",
                        flush=True,
                    )

                    print(
                        f">>> NOTIFICATION ID: "
                        f"{notification.id}",
                        flush=True,
                    )

                    print(
                        f">>> RECIPIENT ID: "
                        f"{recipient_id}",
                        flush=True,
                    )

                else:

                    print(
                        ">>> POST ACTIVITY NOTIFICATION "
                        "NOT CREATED",
                        flush=True,
                    )

                    print(
                        f">>> RECIPIENT ID: "
                        f"{recipient_id}",
                        flush=True,
                    )

                    print(
                        ">>> REASON: Notification preference "
                        "blocked the notification",
                        flush=True,
                    )

            except Exception as notification_error:

                print(
                    ">>> POST ACTIVITY NOTIFICATION "
                    "CREATION FAILED",
                    flush=True,
                )

                print(
                    f">>> RECIPIENT ID: "
                    f"{recipient_id}",
                    flush=True,
                )

                print(
                    f">>> NOTIFICATION ERROR: "
                    f"{notification_error}",
                    flush=True,
                )

                continue

        print(
            "-------------------------------------------------",
            flush=True,
        )

        print(
            ">>> POST ACTIVITY NOTIFICATION PROCESS COMPLETED",
            flush=True,
        )

        print(
            f">>> POST OWNER ID: "
            f"{post_owner_id}",
            flush=True,
        )

        print(
            f">>> RECIPIENT IDS: "
            f"{recipient_ids}",
            flush=True,
        )

        print(
            f">>> NOTIFICATION COUNT CREATED: "
            f"{len(notifications)}",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return notifications

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# CREATE CAMPAIGN ACTIVITY NOTIFICATION
# =========================================================

def create_campaign_activity_notification(
    user_id: int,
    title: str,
    description: str,
    notification_type: str = "info",
    related_campaign_id: int | None = None,
) -> Notification | None:

    return create_notification(
        user_id=user_id,
        title=title,
        description=description,
        notification_type=notification_type,
        category="campaign",
        delivery_channel="in_app",
        related_campaign_id=related_campaign_id,
    )


# =========================================================
# CAMPAIGN CREATED
# =========================================================

def create_campaign_created_notification(
    user_id: int,
    campaign_id: int,
    campaign_name: str,
) -> Notification | None:

    return create_campaign_activity_notification(
        user_id=user_id,
        title="Campaign Created",
        description=(
            f'Your campaign "{campaign_name}" '
            "was created successfully."
        ),
        notification_type="success",
        related_campaign_id=campaign_id,
    )


# =========================================================
# CAMPAIGN UPDATED
# =========================================================

def create_campaign_updated_notification(
    user_id: int,
    campaign_id: int,
    campaign_name: str,
) -> Notification | None:

    return create_campaign_activity_notification(
        user_id=user_id,
        title="Campaign Updated",
        description=(
            f'Your campaign "{campaign_name}" '
            "was updated successfully."
        ),
        notification_type="info",
        related_campaign_id=campaign_id,
    )


# =========================================================
# CAMPAIGN STARTED
# =========================================================

def create_campaign_started_notification(
    user_id: int,
    campaign_id: int,
    campaign_name: str,
) -> Notification | None:

    return create_campaign_activity_notification(
        user_id=user_id,
        title="Campaign Started",
        description=(
            f'Your campaign "{campaign_name}" '
            "has started."
        ),
        notification_type="success",
        related_campaign_id=campaign_id,
    )


# =========================================================
# CAMPAIGN COMPLETED
# =========================================================

def create_campaign_completed_notification(
    user_id: int,
    campaign_id: int,
    campaign_name: str,
) -> Notification | None:

    return create_campaign_activity_notification(
        user_id=user_id,
        title="Campaign Completed",
        description=(
            f'Your campaign "{campaign_name}" '
            "has been completed."
        ),
        notification_type="success",
        related_campaign_id=campaign_id,
    )


# =========================================================
# CAMPAIGN DEADLINE APPROACHING
# =========================================================

def create_campaign_deadline_notification(
    user_id: int,
    campaign_id: int,
    campaign_name: str,
) -> Notification | None:

    return create_campaign_activity_notification(
        user_id=user_id,
        title="Campaign Deadline Approaching",
        description=(
            f'The deadline for campaign '
            f'"{campaign_name}" is approaching.'
        ),
        notification_type="warning",
        related_campaign_id=campaign_id,
    )


# =========================================================
# CREATE ACCOUNT ACTIVITY NOTIFICATION
# =========================================================

def create_account_activity_notification(
    user_id: int,
    title: str,
    description: str,
    notification_type: str = "info",
) -> Notification | None:

    return create_notification(
        user_id=user_id,
        title=title,
        description=description,
        notification_type=notification_type,
        category="account_activity",
        delivery_channel="in_app",
    )


# =========================================================
# ACCOUNT CONNECTED
# =========================================================

def create_account_connected_notification(
    user_id: int,
    platform: str,
    account_name: str,
) -> Notification | None:

    platform_name = str(
        platform
    ).strip().title()

    return create_account_activity_notification(
        user_id=user_id,
        title="Social Account Connected",
        description=(
            f'Your {platform_name} account '
            f'"{account_name}" was connected successfully.'
        ),
        notification_type="success",
    )


# =========================================================
# ACCOUNT DISCONNECTED
# =========================================================

def create_account_disconnected_notification(
    user_id: int,
    platform: str,
    account_name: str,
) -> Notification | None:

    platform_name = str(
        platform
    ).strip().title()

    return create_account_activity_notification(
        user_id=user_id,
        title="Social Account Disconnected",
        description=(
            f'Your {platform_name} account '
            f'"{account_name}" was disconnected.'
        ),
        notification_type="info",
    )


# =========================================================
# GET NOTIFICATIONS
# =========================================================

def get_notifications(
    user_id: int,
    search: str | None = None,
    notification_type: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    category: str | None = None,
) -> list[Notification]:

    db = _get_notification_db()

    try:

        query = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id
            )
        )

        if search and search.strip():

            search_value = (
                f"%{search.strip()}%"
            )

            query = query.filter(
                or_(
                    Notification.title.ilike(
                        search_value
                    ),
                    Notification.description.ilike(
                        search_value
                    ),
                )
            )

        if notification_type:

            query = query.filter(
                Notification.type
                == notification_type
            )

        if category:

            query = query.filter(
                Notification.category
                == category
            )

        normalized_date_from = (
            _normalize_notification_filter_datetime(
                date_from
            )
        )

        if normalized_date_from:

            query = query.filter(
                Notification.created_at
                >= normalized_date_from
            )

        normalized_date_to = (
            _normalize_notification_filter_datetime(
                date_to,
                is_end=True,
            )
        )

        if normalized_date_to:

            query = query.filter(
                Notification.created_at
                <= normalized_date_to
            )

        notifications = (
            query
            .order_by(
                Notification.created_at.desc()
            )
            .all()
        )

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> NOTIFICATIONS FETCHED",
            flush=True,
        )

        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )

        print(
            f">>> SEARCH: {search}",
            flush=True,
        )

        print(
            f">>> TYPE: {notification_type}",
            flush=True,
        )

        print(
            f">>> CATEGORY: {category}",
            flush=True,
        )

        print(
            f">>> DATE FROM: {normalized_date_from}",
            flush=True,
        )

        print(
            f">>> DATE TO: {normalized_date_to}",
            flush=True,
        )

        print(
            f">>> COUNT: {len(notifications)}",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return notifications

    finally:

        db.close()


# =========================================================
# GET NOTIFICATION DETAIL
# =========================================================

def get_notification_detail(
    user_id: int,
    notification_id: int,
) -> Notification:

    db = _get_notification_db()

    try:

        notification = (
            db.query(Notification)
            .filter(
                and_(
                    Notification.id
                    == notification_id,
                    Notification.user_id
                    == user_id,
                )
            )
            .first()
        )

        if notification is None:

            raise ValueError(
                "Notification not found"
            )

        return notification

    finally:

        db.close()


# =========================================================
# GET UNREAD COUNT
# =========================================================

def get_unread_notification_count(
    user_id: int,
) -> dict[str, int]:

    db = _get_notification_db()

    try:

        unread_count = (
            db.query(
                func.count(
                    Notification.id
                )
            )
            .filter(
                Notification.user_id
                == user_id,
                Notification.is_read.is_(False),
            )
            .scalar()
        )

        return {
            "unread_count": int(
                unread_count or 0
            )
        }

    finally:

        db.close()


# =========================================================
# MARK ONE AS READ
# =========================================================

def mark_notification_as_read(
    user_id: int,
    notification_id: int,
) -> Notification:

    db = _get_notification_db()

    try:

        notification = (
            db.query(Notification)
            .filter(
                and_(
                    Notification.id
                    == notification_id,
                    Notification.user_id
                    == user_id,
                )
            )
            .first()
        )

        if notification is None:

            raise ValueError(
                "Notification not found"
            )

        notification.is_read = True

        notification.read_at = datetime.now(
            timezone.utc
        )

        db.commit()

        db.refresh(notification)

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> NOTIFICATION MARKED AS READ",
            flush=True,
        )

        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )

        print(
            f">>> NOTIFICATION ID: "
            f"{notification_id}",
            flush=True,
        )

        print(
            f">>> READ AT: "
            f"{notification.read_at}",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return notification

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# MARK ALL AS READ
# =========================================================

def mark_all_notifications_as_read(
    user_id: int,
) -> dict[str, Any]:

    db = _get_notification_db()

    try:

        now = datetime.now(
            timezone.utc
        )

        updated_count = (
            db.query(Notification)
            .filter(
                Notification.user_id
                == user_id,
                Notification.is_read.is_(False),
            )
            .update(
                {
                    Notification.is_read: True,
                    Notification.read_at: now,
                },
                synchronize_session=False,
            )
        )

        db.commit()

        return {
            "message": (
                "All notifications marked as read"
            ),
            "updated_count": int(
                updated_count
            ),
        }

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# DELETE ONE NOTIFICATION
# =========================================================

def delete_notification(
    user_id: int,
    notification_id: int,
) -> dict[str, Any]:

    db = _get_notification_db()

    try:

        notification = (
            db.query(Notification)
            .filter(
                and_(
                    Notification.id
                    == notification_id,
                    Notification.user_id
                    == user_id,
                )
            )
            .first()
        )

        if notification is None:

            raise ValueError(
                "Notification not found"
            )

        db.delete(notification)

        db.commit()

        return {
            "message": (
                "Notification deleted successfully"
            ),
            "notification_id": notification_id,
        }

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# CLEAR ALL NOTIFICATIONS
# =========================================================

def clear_notifications(
    user_id: int,
) -> dict[str, Any]:

    db = _get_notification_db()

    try:

        deleted_count = (
            db.query(Notification)
            .filter(
                Notification.user_id
                == user_id
            )
            .delete(
                synchronize_session=False
            )
        )

        db.commit()

        return {
            "message": (
                "All notifications cleared successfully"
            ),
            "deleted_count": int(
                deleted_count
            ),
        }

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# GET NOTIFICATION PREFERENCES
# =========================================================

def get_notification_preferences(
    user_id: int,
) -> NotificationPreference:

    db = _get_notification_db()

    try:

        preference = (
            _get_or_create_notification_preference(
                db=db,
                user_id=user_id,
            )
        )

        db.commit()

        db.refresh(preference)

        return preference

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# UPDATE NOTIFICATION PREFERENCES
# =========================================================

def update_notification_preferences(
    user_id: int,
    payload,
) -> NotificationPreference:

    db = _get_notification_db()

    try:

        preference = (
            _get_or_create_notification_preference(
                db=db,
                user_id=user_id,
            )
        )

        if hasattr(
            payload,
            "model_dump",
        ):

            updates = payload.model_dump(
                exclude_unset=True
            )

        else:

            updates = payload.dict(
                exclude_unset=True
            )

        allowed_fields = {
            "publishing_notifications_enabled",
            "campaign_notifications_enabled",
            "account_activity_notifications_enabled",
            "team_collaboration_notifications_enabled",
            "system_notifications_enabled",
            "in_app_notifications_enabled",
            "email_notifications_enabled",
            "push_notifications_enabled",
            "email_frequency",
            "promotional_emails_enabled",
        }

        if (
            "email_frequency" in updates
            and updates["email_frequency"]
            is not None
        ):

            allowed_frequencies = {
                "immediate",
                "daily",
                "weekly",
            }

            if (
                updates["email_frequency"]
                not in allowed_frequencies
            ):

                raise ValueError(
                    "email_frequency must be one of: "
                    "immediate, daily, weekly"
                )

        for field, value in updates.items():

            if field not in allowed_fields:
                continue

            if value is None:
                continue

            setattr(
                preference,
                field,
                value,
            )

        db.commit()

        db.refresh(preference)

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> NOTIFICATION PREFERENCES UPDATED",
            flush=True,
        )

        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )

        print(
            f">>> UPDATED FIELDS: "
            f"{list(updates.keys())}",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return preference

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# GET EMAIL PREFERENCES
# =========================================================

def get_email_preferences(
    user_id: int,
) -> NotificationPreference:

    db = _get_notification_db()

    try:

        preference = (
            _get_or_create_notification_preference(
                db=db,
                user_id=user_id,
            )
        )

        db.commit()

        db.refresh(preference)

        return preference

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# UPDATE EMAIL PREFERENCES
# =========================================================

def update_email_preferences(
    user_id: int,
    payload,
) -> NotificationPreference:

    db = _get_notification_db()

    try:

        preference = (
            _get_or_create_notification_preference(
                db=db,
                user_id=user_id,
            )
        )

        if hasattr(
            payload,
            "model_dump",
        ):

            updates = payload.model_dump(
                exclude_unset=True
            )

        else:

            updates = payload.dict(
                exclude_unset=True
            )

        allowed_fields = {
            "email_notifications_enabled",
            "email_frequency",
            "promotional_emails_enabled",
        }

        if (
            "email_frequency" in updates
            and updates["email_frequency"]
            is not None
        ):

            allowed_frequencies = {
                "immediate",
                "daily",
                "weekly",
            }

            if (
                updates["email_frequency"]
                not in allowed_frequencies
            ):

                raise ValueError(
                    "email_frequency must be one of: "
                    "immediate, daily, weekly"
                )

        for field, value in updates.items():

            if field not in allowed_fields:
                continue

            if value is None:
                continue

            setattr(
                preference,
                field,
                value,
            )

        db.commit()

        db.refresh(preference)

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> EMAIL PREFERENCES UPDATED",
            flush=True,
        )

        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )

        print(
            f">>> UPDATED FIELDS: "
            f"{list(updates.keys())}",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return preference

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# NOTIFICATION HISTORY
# =========================================================

def get_notification_history(
    user_id: int,
    search: str | None = None,
    notification_type: str | None = None,
    category: str | None = None,
    is_read: bool | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> list[Notification]:

    db = _get_notification_db()

    try:

        query = (
            db.query(Notification)
            .filter(
                Notification.user_id
                == user_id
            )
        )

        if search and search.strip():

            search_value = (
                f"%{search.strip()}%"
            )

            query = query.filter(
                or_(
                    Notification.title.ilike(
                        search_value
                    ),
                    Notification.description.ilike(
                        search_value
                    ),
                )
            )

        if notification_type:

            query = query.filter(
                Notification.type
                == notification_type
            )

        if category:

            query = query.filter(
                Notification.category
                == category
            )

        if is_read is not None:

            query = query.filter(
                Notification.is_read
                == is_read
            )

        normalized_date_from = (
            _normalize_notification_filter_datetime(
                date_from
            )
        )

        if normalized_date_from:

            query = query.filter(
                Notification.created_at
                >= normalized_date_from
            )

        normalized_date_to = (
            _normalize_notification_filter_datetime(
                date_to,
                is_end=True,
            )
        )

        if normalized_date_to:

            query = query.filter(
                Notification.created_at
                <= normalized_date_to
            )

        notifications = (
            query
            .order_by(
                Notification.created_at.desc()
            )
            .all()
        )

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> NOTIFICATION HISTORY FETCHED",
            flush=True,
        )

        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )

        print(
            f">>> SEARCH: {search}",
            flush=True,
        )

        print(
            f">>> TYPE: {notification_type}",
            flush=True,
        )

        print(
            f">>> CATEGORY: {category}",
            flush=True,
        )

        print(
            f">>> IS READ: {is_read}",
            flush=True,
        )

        print(
            f">>> DATE FROM: "
            f"{normalized_date_from}",
            flush=True,
        )

        print(
            f">>> DATE TO: "
            f"{normalized_date_to}",
            flush=True,
        )

        print(
            f">>> COUNT: "
            f"{len(notifications)}",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return notifications

    finally:

        db.close()


# =========================================================
# GET NOTIFICATION HISTORY DETAIL
# =========================================================

def get_notification_history_detail(
    user_id: int,
    notification_id: int,
) -> Notification:

    db = _get_notification_db()

    try:

        notification = (
            db.query(Notification)
            .filter(
                and_(
                    Notification.id
                    == notification_id,
                    Notification.user_id
                    == user_id,
                )
            )
            .first()
        )

        if notification is None:

            raise ValueError(
                "Notification history record not found"
            )

        return notification

    finally:

        db.close()


# =========================================================
# DELETE NOTIFICATION HISTORY RECORD
# =========================================================

def delete_notification_history(
    user_id: int,
    notification_id: int,
) -> dict[str, Any]:

    db = _get_notification_db()

    try:

        notification = (
            db.query(Notification)
            .filter(
                and_(
                    Notification.id
                    == notification_id,
                    Notification.user_id
                    == user_id,
                )
            )
            .first()
        )

        if notification is None:

            raise ValueError(
                "Notification history record not found"
            )

        db.delete(notification)

        db.commit()

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> NOTIFICATION HISTORY RECORD DELETED",
            flush=True,
        )

        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )

        print(
            f">>> NOTIFICATION ID: "
            f"{notification_id}",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return {
            "message": (
                "Notification history record "
                "deleted successfully"
            ),
            "notification_id": notification_id,
        }

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# =========================================================
# NORMALIZE NOTIFICATION FILTER DATETIME
# =========================================================

def _normalize_notification_filter_datetime(
    value: datetime | None,
    *,
    is_end: bool = False,
) -> datetime | None:
    """
    Normalize notification date filters to UTC.

    Rules:

    - timezone-aware datetime -> UTC
    - timezone-naive datetime -> treated as IST
    - date_to -> expanded to end of selected minute
    """

    if value is None:
        return None

    if value.tzinfo is not None:

        normalized = value.astimezone(
            timezone.utc
        )

    else:

        value = value.replace(
            tzinfo=INDIA_TIMEZONE
        )

        normalized = value.astimezone(
            timezone.utc
        )

    if is_end:

        normalized = normalized.replace(
            second=59,
            microsecond=999999,
        )

    return normalized