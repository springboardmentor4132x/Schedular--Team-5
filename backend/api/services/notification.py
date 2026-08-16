from __future__ import annotations

from typing import Any

from sqlalchemy import desc

from api.database.session import SessionLocal
from api.models.notification import Notification
from api.models.notification_preference import NotificationPreference
from api.roles.notification import NotificationType


# ============================================================
# CONSTANTS
# ============================================================

ALLOWED_EMAIL_FREQUENCIES = {
    "immediate",
    "daily",
    "weekly",
}


NOTIFICATION_PREFERENCE_FIELDS = {
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


EMAIL_PREFERENCE_FIELDS = {
    "email_notifications_enabled",
    "email_frequency",
    "promotional_emails_enabled",
}


# ============================================================
# INTERNAL HELPERS
# ============================================================


def _get_or_create_preferences(
    db,
    user_id: int,
):
    """
    Get the notification preference row for a user.

    If the user does not have a preference row yet,
    create one using the model defaults.
    """

    preferences = (
        db.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == user_id
        )
        .first()
    )

    if preferences is not None:
        return preferences

    preferences = NotificationPreference(
        user_id=user_id
    )

    db.add(preferences)
    db.flush()

    return preferences


def _normalize_email_frequency(
    value: str | None,
) -> str | None:
    """
    Validate and normalize email frequency.
    """

    if value is None:
        return None

    normalized = str(value).strip().lower()

    if normalized not in ALLOWED_EMAIL_FREQUENCIES:
        raise ValueError(
            "Invalid email frequency. "
            "Allowed values: immediate, daily, weekly"
        )

    return normalized


def _notification_type_from_status(
    status: str | None,
) -> NotificationType:
    """
    Convert a post status into a NotificationType.
    """

    if not status:
        return NotificationType.INFO

    status_value = str(status).lower()

    if (
        "fail" in status_value
        or "error" in status_value
    ):
        return NotificationType.ERROR

    if (
        "publish" in status_value
        or "success" in status_value
        or "schedule" in status_value
    ):
        return NotificationType.SUCCESS

    if "warning" in status_value:
        return NotificationType.WARNING

    return NotificationType.INFO


def _ensure_notification_type(
    notification_type,
) -> NotificationType:
    """
    Make sure the supplied value is a valid NotificationType.
    """

    if isinstance(
        notification_type,
        NotificationType,
    ):
        return notification_type

    try:
        return NotificationType(
            notification_type
        )
    except (
        ValueError,
        TypeError,
    ):
        return NotificationType.INFO


def _is_notification_category_enabled(
    preferences,
    notification_type: NotificationType,
) -> bool:
    """
    Determine whether in-app notifications are enabled.

    The current NotificationPreference model contains
    separate category switches as well as the global
    in-app notification switch.
    """

    if not preferences.in_app_notifications_enabled:
        return False

    notification_type = _ensure_notification_type(
        notification_type
    )

    type_value = (
        notification_type.value
        if hasattr(
            notification_type,
            "value",
        )
        else str(notification_type)
    )

    type_value = str(
        type_value
    ).lower()

    if type_value == "success":
        return bool(
            preferences.publishing_notifications_enabled
        )

    if type_value == "info":
        return bool(
            preferences.system_notifications_enabled
        )

    if type_value == "warning":
        return bool(
            preferences.system_notifications_enabled
        )

    if type_value == "error":
        return bool(
            preferences.system_notifications_enabled
        )

    return bool(
        preferences.in_app_notifications_enabled
    )


def _create_single_notification(
    db,
    user_id: int,
    title: str,
    description: str,
    notification_type: NotificationType,
    related_post_id: int | None = None,
    related_campaign_id: int | None = None,
):
    """
    Create a notification for one user.

    Notification creation respects the user's notification
    preference settings.
    """

    preferences = _get_or_create_preferences(
        db,
        user_id,
    )

    notification_type = _ensure_notification_type(
        notification_type
    )

    if not _is_notification_category_enabled(
        preferences,
        notification_type,
    ):
        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> NOTIFICATION DISABLED BY USER PREFERENCES",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> TYPE: {notification_type}",
            flush=True,
        )
        print(
            ">>> NOTIFICATION NOT CREATED",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return None

    notification = Notification(
        user_id=user_id,
        title=str(title)[:40],
        description=str(description)[:120],
        type=notification_type,
        is_read=False,
        related_post_id=related_post_id,
        related_campaign_id=related_campaign_id,
    )

    db.add(notification)

    return notification


# ============================================================
# NOTIFICATION PREFERENCES
# ============================================================


def get_or_create_notification_preferences(
    user_id: int,
):
    """
    Get notification preferences for a user.

    Creates the preference record automatically when it
    does not already exist.
    """

    db = SessionLocal()

    try:
        preferences = _get_or_create_preferences(
            db,
            user_id,
        )

        db.commit()
        db.refresh(preferences)

        return preferences

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_notification_settings(
    user_id: int,
):
    """
    Return the complete notification settings for a user.
    """

    return get_or_create_notification_preferences(
        user_id
    )


def get_notification_preferences(
    user_id: int,
):
    """
    Compatibility function used by the notification
    preferences router.
    """

    return get_or_create_notification_preferences(
        user_id
    )


def update_notification_preferences(
    user_id: int,
    payload: Any = None,
    updates: dict[str, Any] | None = None,
):
    """
    Update notification preferences.

    Supports both:

        update_notification_preferences(
            user_id=user_id,
            payload=payload
        )

    and:

        update_notification_preferences(
            user_id=user_id,
            updates=updates
        )

    Only supplied fields are changed.
    """

    changes: dict[str, Any] = {}

    # --------------------------------------------------------
    # Convert Pydantic model / object / dictionary into dict.
    # --------------------------------------------------------

    source = payload

    if source is None:
        source = updates

    if source is not None:

        if isinstance(
            source,
            dict,
        ):
            changes.update(source)

        elif hasattr(
            source,
            "model_dump",
        ):
            changes.update(
                source.model_dump(
                    exclude_unset=True
                )
            )

        elif hasattr(
            source,
            "dict",
        ):
            changes.update(
                source.dict(
                    exclude_unset=True
                )
            )

        else:
            for field in NOTIFICATION_PREFERENCE_FIELDS:
                if hasattr(
                    source,
                    field,
                ):
                    value = getattr(
                        source,
                        field,
                    )

                    if value is not None:
                        changes[field] = value

    # --------------------------------------------------------
    # Ignore unknown fields.
    # --------------------------------------------------------

    changes = {
        field: value
        for field, value in changes.items()
        if field in NOTIFICATION_PREFERENCE_FIELDS
    }

    # --------------------------------------------------------
    # Validate email frequency.
    # --------------------------------------------------------

    if "email_frequency" in changes:

        changes["email_frequency"] = (
            _normalize_email_frequency(
                changes["email_frequency"]
            )
        )

    db = SessionLocal()

    try:

        preferences = _get_or_create_preferences(
            db,
            user_id,
        )

        # ----------------------------------------------------
        # Apply changes.
        # ----------------------------------------------------

        for field, value in changes.items():

            if not hasattr(
                preferences,
                field,
            ):
                continue

            setattr(
                preferences,
                field,
                value,
            )

        db.commit()
        db.refresh(preferences)

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
            f">>> CHANGED FIELDS: {list(changes.keys())}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return preferences

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# EMAIL PREFERENCES
# ============================================================


def get_email_preferences(
    user_id: int,
):
    """
    Return only email-related notification preferences.
    """

    preferences = (
        get_or_create_notification_preferences(
            user_id
        )
    )

    return {
        "email_notifications_enabled":
            preferences.email_notifications_enabled,

        "email_frequency":
            preferences.email_frequency,

        "promotional_emails_enabled":
            preferences.promotional_emails_enabled,
    }


def update_email_preferences(
    user_id: int,
    payload: Any = None,
    updates: dict[str, Any] | None = None,
    email_notifications_enabled: bool | None = None,
    email_frequency: str | None = None,
    promotional_emails_enabled: bool | None = None,
):
    """
    Update email notification preferences.

    Supports dictionary/Pydantic payloads and explicit
    keyword arguments.
    """

    changes: dict[str, Any] = {}

    # --------------------------------------------------------
    # Handle payload.
    # --------------------------------------------------------

    source = payload

    if source is None:
        source = updates

    if source is not None:

        if isinstance(
            source,
            dict,
        ):
            changes.update(source)

        elif hasattr(
            source,
            "model_dump",
        ):
            changes.update(
                source.model_dump(
                    exclude_unset=True
                )
            )

        elif hasattr(
            source,
            "dict",
        ):
            changes.update(
                source.dict(
                    exclude_unset=True
                )
            )

        else:
            for field in EMAIL_PREFERENCE_FIELDS:
                if hasattr(
                    source,
                    field,
                ):
                    value = getattr(
                        source,
                        field,
                    )

                    if value is not None:
                        changes[field] = value

    # --------------------------------------------------------
    # Handle explicit keyword arguments.
    # --------------------------------------------------------

    explicit_values = {
        "email_notifications_enabled":
            email_notifications_enabled,

        "email_frequency":
            email_frequency,

        "promotional_emails_enabled":
            promotional_emails_enabled,
    }

    for field, value in explicit_values.items():

        if value is not None:
            changes[field] = value

    # --------------------------------------------------------
    # Keep only valid fields.
    # --------------------------------------------------------

    changes = {
        field: value
        for field, value in changes.items()
        if field in EMAIL_PREFERENCE_FIELDS
    }

    # --------------------------------------------------------
    # Validate frequency.
    # --------------------------------------------------------

    if "email_frequency" in changes:

        changes["email_frequency"] = (
            _normalize_email_frequency(
                changes["email_frequency"]
            )
        )

    db = SessionLocal()

    try:

        preferences = _get_or_create_preferences(
            db,
            user_id,
        )

        for field, value in changes.items():

            if not hasattr(
                preferences,
                field,
            ):
                continue

            setattr(
                preferences,
                field,
                value,
            )

        db.commit()
        db.refresh(preferences)

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
            f">>> EMAIL ENABLED: "
            f"{preferences.email_notifications_enabled}",
            flush=True,
        )
        print(
            f">>> EMAIL FREQUENCY: "
            f"{preferences.email_frequency}",
            flush=True,
        )
        print(
            f">>> PROMOTIONAL EMAILS: "
            f"{preferences.promotional_emails_enabled}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return preferences

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# GET NOTIFICATIONS
# ============================================================


def get_notifications(
    user_id: int,
):
    """
    Return all notifications belonging to the specified user.

    Newest notifications are returned first.
    """

    db = SessionLocal()

    try:

        notifications = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id
            )
            .order_by(
                desc(
                    Notification.created_at
                )
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


# ============================================================
# GET UNREAD NOTIFICATION COUNT
# ============================================================


def get_unread_notification_count(
    user_id: int,
):
    """
    Return the number of unread notifications.
    """

    db = SessionLocal()

    try:

        unread_count = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
            .count()
        )

        return {
            "unread_count": unread_count,
        }

    finally:
        db.close()


# ============================================================
# MARK ONE NOTIFICATION AS READ
# ============================================================


def mark_notification_as_read(
    user_id: int,
    notification_id: int,
):
    """
    Mark one notification as read.

    The notification must belong to the current user.
    """

    db = SessionLocal()

    try:

        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
            .first()
        )

        if notification is None:
            raise ValueError(
                "Notification not found"
            )

        notification.is_read = True

        db.commit()
        db.refresh(notification)

        return notification

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# MARK ALL NOTIFICATIONS AS READ
# ============================================================


def mark_all_notifications_as_read(
    user_id: int,
):
    """
    Mark all notifications belonging to the current user
    as read.
    """

    db = SessionLocal()

    try:

        notifications = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
            .all()
        )

        count = len(notifications)

        for notification in notifications:
            notification.is_read = True

        db.commit()

        return {
            "message": "All notifications marked as read",
            "updated_count": count,
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# DELETE ONE NOTIFICATION
# ============================================================


def delete_notification(
    user_id: int,
    notification_id: int,
):
    """
    Delete one notification belonging to the current user.
    """

    db = SessionLocal()

    try:

        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
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
            "message": "Notification deleted successfully",
            "notification_id": notification_id,
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# CLEAR ALL NOTIFICATIONS
# ============================================================


def clear_notifications(
    user_id: int,
):
    """
    Delete all notifications belonging to the current user.
    """

    db = SessionLocal()

    try:

        notifications = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id
            )
            .all()
        )

        count = len(notifications)

        for notification in notifications:
            db.delete(notification)

        db.commit()

        return {
            "message": "All notifications cleared successfully",
            "deleted_count": count,
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# CREATE POST ACTIVITY NOTIFICATIONS
# ============================================================


def create_post_activity_notifications(
    post_owner_id: int | None = None,
    title: str | None = None,
    description: str | None = None,
    notification_type: NotificationType | None = None,
    related_post_id: int | None = None,
    related_campaign_id: int | None = None,
    post=None,
    status: str | None = None,
    platform_results=None,
    error_message: str | None = None,
):
    """
    Create publishing/activity notifications for a post.

    Supports both the existing direct-call style and the
    post/status style used by the project.
    """

    # --------------------------------------------------------
    # Resolve post information.
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Default title.
    # --------------------------------------------------------

    if title is None:
        title = "Post Activity"

    # --------------------------------------------------------
    # Default description.
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Determine notification type.
    # --------------------------------------------------------

    if notification_type is None:
        notification_type = (
            _notification_type_from_status(
                status
            )
        )

    notification_type = _ensure_notification_type(
        notification_type
    )

    db = SessionLocal()

    try:

        recipient_ids: list[int] = []

        # ----------------------------------------------------
        # Always notify post owner.
        # ----------------------------------------------------

        recipient_ids.append(
            int(post_owner_id)
        )

        # ----------------------------------------------------
        # Try to find assigned marketing team member.
        #
        # This is intentionally defensive because the
        # BusinessAssignment model may differ between
        # project versions.
        # ----------------------------------------------------

        try:

            from api.models.business_assignment import (
                BusinessAssignment,
            )

            assignment_columns = {
                column.name
                for column in
                BusinessAssignment.__table__.columns
            }

            business_columns = [
                "business_user_id",
                "business_user",
                "user_id",
                "business_id",
                "business_user_user_id",
            ]

            marketing_columns = [
                "marketing_team_id",
                "marketing_user_id",
                "marketing_team_user_id",
                "assigned_marketing_user_id",
            ]

            business_column = next(
                (
                    field
                    for field in business_columns
                    if field in assignment_columns
                ),
                None,
            )

            marketing_column = next(
                (
                    field
                    for field in marketing_columns
                    if field in assignment_columns
                ),
                None,
            )

            if (
                business_column
                and marketing_column
            ):

                assignment = (
                    db.query(
                        BusinessAssignment
                    )
                    .filter(
                        getattr(
                            BusinessAssignment,
                            business_column,
                        )
                        == post_owner_id
                    )
                    .first()
                )

                if assignment:

                    marketing_value = getattr(
                        assignment,
                        marketing_column,
                        None,
                    )

                    if marketing_value is not None:

                        try:

                            marketing_user_id = int(
                                marketing_value
                            )

                            if (
                                marketing_user_id
                                not in recipient_ids
                            ):
                                recipient_ids.append(
                                    marketing_user_id
                                )

                        except (
                            TypeError,
                            ValueError,
                        ):
                            pass

        except Exception as assignment_error:

            print(
                ">>> MARKETING TEAM LOOKUP SKIPPED:",
                assignment_error,
                flush=True,
            )

        # ----------------------------------------------------
        # Remove duplicates.
        # ----------------------------------------------------

        recipient_ids = list(
            dict.fromkeys(
                recipient_ids
            )
        )

        # ----------------------------------------------------
        # Create notifications.
        # ----------------------------------------------------

        notifications = []

        for recipient_id in recipient_ids:

            notification = (
                _create_single_notification(
                    db=db,
                    user_id=recipient_id,
                    title=title,
                    description=description,
                    notification_type=notification_type,
                    related_post_id=related_post_id,
                    related_campaign_id=related_campaign_id,
                )
            )

            if notification is not None:
                notifications.append(
                    notification
                )

        db.commit()

        for notification in notifications:
            db.refresh(notification)

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> POST ACTIVITY NOTIFICATIONS CREATED",
            flush=True,
        )
        print(
            f">>> POST OWNER ID: {post_owner_id}",
            flush=True,
        )
        print(
            f">>> RECIPIENT IDS: {recipient_ids}",
            flush=True,
        )
        print(
            f">>> NOTIFICATION COUNT: "
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