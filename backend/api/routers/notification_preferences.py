from fastapi import APIRouter, Depends, HTTPException, status

from api.auth.auth import get_current_user
from api.schemas.notification import (
    NotificationSettingsResponse,
    NotificationSettingsUpdate,
    EmailPreferencesResponse,
    EmailPreferencesUpdate,
)
from api.services.notification import (
    get_notification_preferences,
    update_notification_preferences,
    get_email_preferences,
    update_email_preferences,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/notification-preferences",
    tags=["Notification Preferences"],
)


# =========================================================
# GET CURRENT USER ID
# =========================================================

def get_current_user_id(current_user):
    """
    Get the authenticated user's database ID
    directly from the JWT payload.

    get_current_user() returns:

    {
        "id": user_id,
        "username": username,
        "role": role,
    }
    """

    user_id = current_user.get("id")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is not available.",
        )

    return int(user_id)


# =========================================================
# GET ALL NOTIFICATION PREFERENCES
# =========================================================

@router.get(
    "",
    response_model=NotificationSettingsResponse,
)
def get_user_notification_preferences(
    current_user=Depends(get_current_user),
):
    """
    Return the authenticated user's complete
    notification settings.
    """

    user_id = get_current_user_id(
        current_user
    )

    try:
        return get_notification_preferences(
            user_id=user_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


# =========================================================
# UPDATE NOTIFICATION PREFERENCES
# =========================================================

@router.patch(
    "",
    response_model=NotificationSettingsResponse,
)
def update_user_notification_preferences(
    payload: NotificationSettingsUpdate,
    current_user=Depends(get_current_user),
):
    """
    Update one or more notification preference fields.

    Only fields supplied in the request body are changed.
    """

    user_id = get_current_user_id(
        current_user
    )

    try:
        return update_notification_preferences(
            user_id=user_id,
            payload=payload,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =========================================================
# GET EMAIL PREFERENCES
# =========================================================

@router.get(
    "/email",
    response_model=EmailPreferencesResponse,
)
def get_user_email_preferences(
    current_user=Depends(get_current_user),
):
    """
    Return only the authenticated user's
    email notification settings.
    """

    user_id = get_current_user_id(
        current_user
    )

    try:
        return get_email_preferences(
            user_id=user_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


# =========================================================
# UPDATE EMAIL PREFERENCES
# =========================================================

@router.patch(
    "/email",
    response_model=EmailPreferencesResponse,
)
def update_user_email_preferences(
    payload: EmailPreferencesUpdate,
    current_user=Depends(get_current_user),
):
    """
    Update email notification preferences.

    Supported fields:

    - email_notifications_enabled
    - email_frequency
    - promotional_emails_enabled
    """

    user_id = get_current_user_id(
        current_user
    )

    try:
        return update_email_preferences(
            user_id=user_id,
            payload=payload,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )