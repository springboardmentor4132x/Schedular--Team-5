from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from api.database.session import SessionLocal
from api.models.user import User

from api.services.notification import create_notification


# =========================================================
# ADMINISTRATOR HELPERS
# =========================================================


def _get_admin_user_id(
    db: Session,
) -> int | None:
    """
    Find the Administrator user's ID.

    The application is designed to have only one
    Administrator account.

    The function checks the user's role instead of
    assuming that the Administrator has a particular
    database ID.
    """

    try:
        # -------------------------------------------------
        # Try the common role value used by the project.
        # -------------------------------------------------

        admin_user = (
            db.query(User)
            .filter(
                User.role == "Administrator"
            )
            .first()
        )

        if admin_user is None:

            admin_user = (
                db.query(User)
                .filter(
                    User.role == "administrator"
                )
                .first()
            )

        if admin_user is None:

            print(
                "=================================================",
                flush=True,
            )

            print(
                ">>> ADMINISTRATOR USER NOT FOUND",
                flush=True,
            )

            print(
                ">>> ADMIN NOTIFICATION WAS NOT CREATED",
                flush=True,
            )

            print(
                "=================================================",
                flush=True,
            )

            return None

        return int(
            admin_user.id
        )

    except Exception as error:

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> ADMINISTRATOR LOOKUP FAILED",
            flush=True,
        )

        print(
            f">>> ERROR: {error}",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return None


# =========================================================
# INTERNAL ADMIN NOTIFICATION CREATOR
# =========================================================


def _create_admin_notification(
    title: str,
    description: str,
    notification_type: str = "info",
    category: str = "system",
    related_post_id: int | None = None,
    related_campaign_id: int | None = None,
) -> Any:
    """
    Create a notification specifically for the
    Administrator.

    This function uses the existing create_notification()
    function so that all existing notification preference
    and database logic remains centralized.
    """

    db = SessionLocal()

    try:

        admin_user_id = _get_admin_user_id(
            db
        )

        if admin_user_id is None:

            return None

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> CREATING ADMINISTRATOR NOTIFICATION",
            flush=True,
        )

        print(
            f">>> ADMIN USER ID: {admin_user_id}",
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
            "=================================================",
            flush=True,
        )

    finally:

        db.close()

    # -----------------------------------------------------
    # IMPORTANT
    # -----------------------------------------------------
    # create_notification() creates its own database
    # session. Therefore we intentionally call it after
    # closing the lookup session.
    # -----------------------------------------------------

    try:

        notification = create_notification(
            user_id=admin_user_id,
            title=title,
            description=description,
            notification_type=notification_type,
            category=category,
            delivery_channel="in_app",
            related_post_id=related_post_id,
            related_campaign_id=related_campaign_id,
        )

        if notification is not None:

            print(
                ">>> ADMINISTRATOR NOTIFICATION CREATED",
                flush=True,
            )

            print(
                f">>> NOTIFICATION ID: "
                f"{notification.id}",
                flush=True,
            )

        else:

            print(
                ">>> ADMINISTRATOR NOTIFICATION BLOCKED",
                flush=True,
            )

            print(
                ">>> REASON: Administrator notification "
                "preference blocked it",
                flush=True,
            )

        return notification

    except Exception as error:

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> ADMINISTRATOR NOTIFICATION CREATION FAILED",
            flush=True,
        )

        print(
            f">>> ERROR: {error}",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        # -------------------------------------------------
        # Notification failure must never break the
        # original application operation.
        # -------------------------------------------------

        return None


# =========================================================
# 1. USER / ACCOUNT ADMIN NOTIFICATIONS
# =========================================================


def create_admin_new_user_notification(
    user_id: int,
    user_name: str,
    user_role: str,
) -> Any:
    """
    Notify the Administrator when a new user registers.
    """

    return _create_admin_notification(
        title="New User Registered",
        description=(
            f'User "{user_name}" '
            f'registered successfully with the '
            f"{user_role} role."
        ),
        notification_type="info",
        category="system",
    )


def create_admin_user_account_notification(
    action: str,
    user_name: str,
    user_id: int | None = None,
) -> Any:
    """
    Notify the Administrator about an important
    user-account change.

    Examples:

        Account Deactivated
        Account Deleted
        Role Changed
        Account Status Changed
    """

    normalized_action = (
        str(action)
        .strip()
    )

    return _create_admin_notification(
        title=f"User Account {normalized_action}",
        description=(
            f'User "{user_name}" '
            f"has been affected by the following "
            f"account action: {normalized_action}."
        ),
        notification_type="info",
        category="system",
    )


# =========================================================
# 2. TEAM / BUSINESS USER ADMIN NOTIFICATIONS
# =========================================================


def create_admin_team_created_notification(
    team_name: str,
    team_id: int | None = None,
) -> Any:
    """
    Notify the Administrator when a Marketing Team
    is created.
    """

    return _create_admin_notification(
        title="Marketing Team Created",
        description=(
            f'Marketing Team "{team_name}" '
            "was created successfully."
        ),
        notification_type="success",
        category="team_collaboration",
    )


def create_admin_business_assignment_notification(
    business_user_name: str,
    marketing_team_name: str,
    action: str = "assigned",
) -> Any:
    """
    Notify the Administrator when a Business User
    is assigned to or removed from a Marketing Team.
    """

    normalized_action = (
        str(action)
        .strip()
        .lower()
    )

    if normalized_action == "removed":

        title = "Business User Removed From Team"

        description = (
            f'Business User "{business_user_name}" '
            f'was removed from Marketing Team '
            f'"{marketing_team_name}".'
        )

        notification_type = "warning"

    else:

        title = "Business User Assigned To Team"

        description = (
            f'Business User "{business_user_name}" '
            f'was assigned to Marketing Team '
            f'"{marketing_team_name}".'
        )

        notification_type = "info"

    return _create_admin_notification(
        title=title,
        description=description,
        notification_type=notification_type,
        category="team_collaboration",
    )


def create_admin_team_member_notification(
    member_name: str,
    team_name: str,
    action: str = "added",
) -> Any:
    """
    Notify the Administrator when a team member is
    added to or removed from a Marketing Team.
    """

    normalized_action = (
        str(action)
        .strip()
        .lower()
    )

    if normalized_action == "removed":

        title = "Team Member Removed"

        description = (
            f'Team member "{member_name}" '
            f'was removed from Marketing Team '
            f'"{team_name}".'
        )

        notification_type = "warning"

    else:

        title = "Team Member Added"

        description = (
            f'Team member "{member_name}" '
            f'was added to Marketing Team '
            f'"{team_name}".'
        )

        notification_type = "info"

    return _create_admin_notification(
        title=title,
        description=description,
        notification_type=notification_type,
        category="team_collaboration",
    )


# =========================================================
# 3. SOCIAL ACCOUNT / INTEGRATION ADMIN NOTIFICATIONS
# =========================================================


def create_admin_social_account_issue_notification(
    platform: str,
    account_name: str,
    issue: str,
) -> Any:
    """
    Notify the Administrator about an important
    social-media integration/account issue.

    Supported platforms include:

        Facebook
        Instagram
        YouTube
        LinkedIn
    """

    platform_name = (
        str(platform)
        .strip()
        .title()
    )

    return _create_admin_notification(
        title="Social Account Requires Attention",
        description=(
            f'The {platform_name} account '
            f'"{account_name}" has the following issue: '
            f"{issue}."
        ),
        notification_type="warning",
        category="account_activity",
    )


def create_admin_social_account_disconnected_notification(
    platform: str,
    account_name: str,
) -> Any:
    """
    Notify the Administrator when a social account
    is disconnected.
    """

    platform_name = (
        str(platform)
        .strip()
        .title()
    )

    return _create_admin_notification(
        title="Social Account Disconnected",
        description=(
            f'The {platform_name} account '
            f'"{account_name}" was disconnected.'
        ),
        notification_type="warning",
        category="account_activity",
    )


# =========================================================
# 4. OAUTH TOKEN / REAUTHORIZATION ADMIN NOTIFICATIONS
# =========================================================


def create_admin_token_expired_notification(
    platform: str,
    account_name: str,
) -> Any:
    """
    Notify the Administrator when a social account's
    OAuth access token expires.
    """

    platform_name = (
        str(platform)
        .strip()
        .title()
    )

    return _create_admin_notification(
        title="Social Account Token Expired",
        description=(
            f'The access token for the '
            f'{platform_name} account '
            f'"{account_name}" has expired. '
            "The account requires reauthorization."
        ),
        notification_type="error",
        category="account_activity",
    )


def create_admin_reauthorization_notification(
    platform: str,
    account_name: str,
) -> Any:
    """
    Notify the Administrator when a social account
    requires reauthorization.
    """

    platform_name = (
        str(platform)
        .strip()
        .title()
    )

    return _create_admin_notification(
        title="Social Account Requires Reauthorization",
        description=(
            f'The {platform_name} account '
            f'"{account_name}" requires '
            "reauthorization."
        ),
        notification_type="warning",
        category="account_activity",
    )


# =========================================================
# 5. PUBLISHING FAILURE ADMIN NOTIFICATION
# =========================================================


def create_admin_publishing_failure_notification(
    post_id: int,
    platform: str,
    error_message: str | None = None,
) -> Any:
    """
    Notify the Administrator when publishing a post
    fails.

    Routine successful publishing is NOT sent to the
    Administrator.
    """

    platform_name = (
        str(platform)
        .strip()
        .title()
    )

    if error_message:

        description = (
            f"Post #{post_id} failed to publish "
            f"on {platform_name}. "
            f"Reason: {error_message}"
        )

    else:

        description = (
            f"Post #{post_id} failed to publish "
            f"on {platform_name}."
        )

    return _create_admin_notification(
        title="Publishing Failed",
        description=description,
        notification_type="error",
        category="publishing",
        related_post_id=post_id,
    )


# =========================================================
# 6. SYSTEM / SECURITY ADMIN NOTIFICATIONS
# =========================================================


def create_admin_system_notification(
    title: str,
    description: str,
    notification_type: str = "info",
) -> Any:
    """
    Create a system-level notification for the
    Administrator.

    Examples:

        Maintenance
        Application updates
        Security alerts
        General announcements
        Critical integration failures
    """

    return _create_admin_notification(
        title=title,
        description=description,
        notification_type=notification_type,
        category="system",
    )


def create_admin_security_alert_notification(
    title: str,
    description: str,
) -> Any:
    """
    Create a security alert for the Administrator.
    """

    return _create_admin_notification(
        title=title,
        description=description,
        notification_type="error",
        category="system",
    )


# =========================================================
# 7. APPLICATION MAINTENANCE / ANNOUNCEMENTS
# =========================================================


def create_admin_maintenance_notification(
    title: str,
    description: str,
) -> Any:
    """
    Notify the Administrator about planned or
    important maintenance.
    """

    return _create_admin_notification(
        title=title,
        description=description,
        notification_type="warning",
        category="system",
    )


def create_admin_application_update_notification(
    version: str,
    description: str,
) -> Any:
    """
    Notify the Administrator about an application
    update.
    """

    return _create_admin_notification(
        title="Application Update",
        description=(
            f"SocialPilot has been updated to "
            f"version {version}. "
            f"{description}"
        ),
        notification_type="info",
        category="system",
    )


# =========================================================
# ADMIN NOTIFICATION SUMMARY
# =========================================================


def get_admin_notification_policy() -> dict[str, list[str]]:
    """
    Return the Administrator notification policy.

    This is mainly useful for documentation, testing,
    and future frontend/admin configuration.
    """

    return {
        "user_account": [
            "new_user_registered",
            "account_deactivated",
            "account_deleted",
            "role_changed",
            "account_status_changed",
        ],

        "team_management": [
            "marketing_team_created",
            "business_user_assigned",
            "business_user_removed",
            "team_member_added",
            "team_member_removed",
        ],

        "social_accounts": [
            "social_account_disconnected",
            "social_account_connection_failed",
            "social_account_issue",
        ],

        "oauth": [
            "access_token_expired",
            "reauthorization_required",
        ],

        "publishing": [
            "publishing_failed",
        ],

        "system": [
            "maintenance",
            "application_update",
            "general_announcement",
            "security_alert",
            "critical_system_issue",
        ],
    }