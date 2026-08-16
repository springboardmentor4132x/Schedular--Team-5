
from api.database.session import SessionLocal
from api.models.notification_preference import NotificationPreference


# =========================================================
# GET OR CREATE NOTIFICATION PREFERENCES
# =========================================================

def get_or_create_notification_preferences(
    user_id: int,
):
    """
    Get notification preferences for a user.

    If the user does not have a preference record yet,
    create one using the model's default values.
    """

    db = SessionLocal()

    try:
        preferences = (
            db.query(NotificationPreference)
            .filter(
                NotificationPreference.user_id == user_id
            )
            .first()
        )

        if preferences:
            print(
                "=================================================",
                flush=True,
            )
            print(
                ">>> NOTIFICATION PREFERENCES FOUND",
                flush=True,
            )
            print(
                f">>> USER ID: {user_id}",
                flush=True,
            )
            print(
                f">>> PREFERENCE ID: {preferences.id}",
                flush=True,
            )
            print(
                "=================================================",
                flush=True,
            )

            return preferences

        # -------------------------------------------------
        # Create default preferences
        # -------------------------------------------------

        preferences = NotificationPreference(
            user_id=user_id,
        )

        db.add(preferences)
        db.commit()
        db.refresh(preferences)

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> DEFAULT NOTIFICATION PREFERENCES CREATED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> PREFERENCE ID: {preferences.id}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return preferences

    except Exception as exc:
        db.rollback()

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> GET/CREATE NOTIFICATION PREFERENCES FAILED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> ERROR: {exc}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        raise

    finally:
        db.close()


# =========================================================
# GET NOTIFICATION SETTINGS
# =========================================================

def get_notification_settings(
    user_id: int,
):
    """
    Return all notification category and channel settings
    for the specified user.
    """

    preferences = get_or_create_notification_preferences(
        user_id
    )

    return {
        "publishing_notifications_enabled":
            preferences.publishing_notifications_enabled,

        "campaign_notifications_enabled":
            preferences.campaign_notifications_enabled,

        "account_activity_notifications_enabled":
            preferences.account_activity_notifications_enabled,

        "team_collaboration_notifications_enabled":
            preferences.team_collaboration_notifications_enabled,

        "system_notifications_enabled":
            preferences.system_notifications_enabled,

        "in_app_notifications_enabled":
            preferences.in_app_notifications_enabled,

        "email_notifications_enabled":
            preferences.email_notifications_enabled,

        "push_notifications_enabled":
            preferences.push_notifications_enabled,
    }


# =========================================================
# UPDATE NOTIFICATION SETTINGS
# =========================================================

def update_notification_settings(
    user_id: int,
    publishing_notifications_enabled: bool | None = None,
    campaign_notifications_enabled: bool | None = None,
    account_activity_notifications_enabled: bool | None = None,
    team_collaboration_notifications_enabled: bool | None = None,
    system_notifications_enabled: bool | None = None,
    in_app_notifications_enabled: bool | None = None,
    email_notifications_enabled: bool | None = None,
    push_notifications_enabled: bool | None = None,
):
    """
    Update notification category/channel preferences.

    Only values explicitly provided by the user are changed.
    """

    db = SessionLocal()

    try:
        preferences = (
            db.query(NotificationPreference)
            .filter(
                NotificationPreference.user_id == user_id
            )
            .first()
        )

        if not preferences:
            preferences = NotificationPreference(
                user_id=user_id,
            )

            db.add(preferences)
            db.flush()

        # -------------------------------------------------
        # Notification categories
        # -------------------------------------------------

        if publishing_notifications_enabled is not None:
            preferences.publishing_notifications_enabled = (
                publishing_notifications_enabled
            )

        if campaign_notifications_enabled is not None:
            preferences.campaign_notifications_enabled = (
                campaign_notifications_enabled
            )

        if account_activity_notifications_enabled is not None:
            preferences.account_activity_notifications_enabled = (
                account_activity_notifications_enabled
            )

        if team_collaboration_notifications_enabled is not None:
            preferences.team_collaboration_notifications_enabled = (
                team_collaboration_notifications_enabled
            )

        if system_notifications_enabled is not None:
            preferences.system_notifications_enabled = (
                system_notifications_enabled
            )

        # -------------------------------------------------
        # Notification channels
        # -------------------------------------------------

        if in_app_notifications_enabled is not None:
            preferences.in_app_notifications_enabled = (
                in_app_notifications_enabled
            )

        if email_notifications_enabled is not None:
            preferences.email_notifications_enabled = (
                email_notifications_enabled
            )

        if push_notifications_enabled is not None:
            preferences.push_notifications_enabled = (
                push_notifications_enabled
            )

        db.commit()
        db.refresh(preferences)

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> NOTIFICATION SETTINGS UPDATED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> PREFERENCE ID: {preferences.id}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return preferences

    except Exception as exc:
        db.rollback()

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> UPDATE NOTIFICATION SETTINGS FAILED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> ERROR: {exc}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        raise

    finally:
        db.close()


# =========================================================
# GET EMAIL PREFERENCES
# =========================================================

def get_email_preferences(
    user_id: int,
):
    """
    Return email-related notification preferences.
    """

    preferences = get_or_create_notification_preferences(
        user_id
    )

    return {
        "email_notifications_enabled":
            preferences.email_notifications_enabled,

        "email_frequency":
            preferences.email_frequency,

        "promotional_emails_enabled":
            preferences.promotional_emails_enabled,
    }


# =========================================================
# UPDATE EMAIL PREFERENCES
# =========================================================

def update_email_preferences(
    user_id: int,
    email_notifications_enabled: bool | None = None,
    email_frequency: str | None = None,
    promotional_emails_enabled: bool | None = None,
):
    """
    Update email notification preferences.

    Supported email frequencies:

        immediate
        daily
        weekly
    """

    allowed_frequencies = {
        "immediate",
        "daily",
        "weekly",
    }

    if (
        email_frequency is not None
        and email_frequency not in allowed_frequencies
    ):
        raise ValueError(
            "Invalid email frequency. "
            "Allowed values: immediate, daily, weekly"
        )

    db = SessionLocal()

    try:
        preferences = (
            db.query(NotificationPreference)
            .filter(
                NotificationPreference.user_id == user_id
            )
            .first()
        )

        if not preferences:
            preferences = NotificationPreference(
                user_id=user_id,
            )

            db.add(preferences)
            db.flush()

        # -------------------------------------------------
        # Email settings
        # -------------------------------------------------

        if email_notifications_enabled is not None:
            preferences.email_notifications_enabled = (
                email_notifications_enabled
            )

        if email_frequency is not None:
            preferences.email_frequency = email_frequency

        if promotional_emails_enabled is not None:
            preferences.promotional_emails_enabled = (
                promotional_emails_enabled
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

    except Exception as exc:
        db.rollback()

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> UPDATE EMAIL PREFERENCES FAILED",
            flush=True,
        )
        print(
            f">>> USER ID: {user_id}",
            flush=True,
        )
        print(
            f">>> ERROR: {exc}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        raise

    finally:
        db.close()
