
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.auth.auth import get_current_user
from api.database.session import SessionLocal
from api.models.user import User
from api.schemas.notification import (
    NotificationResponse,
    NotificationUnreadCountResponse,
)
from api.services.notification import (
    get_notifications,
    get_notification_detail,
    get_unread_notification_count,
    mark_notification_as_read,
    mark_all_notifications_as_read,
    delete_notification,
    clear_notifications,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# =========================================================
# GET CURRENT USER ID
# =========================================================

def get_current_user_id(
    current_user,
):
    """
    Get the database user ID from the authenticated user.
    """

    db = SessionLocal()

    try:
        username = current_user.get("username")

        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Username missing from authentication token",
            )

        user = (
            db.query(User)
            .filter(
                User.username == username
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        print(
            "=================================================",
            flush=True,
        )
        print(
            ">>> NOTIFICATION CURRENT USER",
            flush=True,
        )
        print(
            f">>> USERNAME: {user.username}",
            flush=True,
        )
        print(
            f">>> USER ID: {user.id}",
            flush=True,
        )
        print(
            f">>> USER ROLE: {user.role}",
            flush=True,
        )
        print(
            "=================================================",
            flush=True,
        )

        return user.id

    finally:
        db.close()


# =========================================================
# GET USER NOTIFICATION HISTORY
# =========================================================

@router.get(
    "",
    response_model=list[NotificationResponse],
)
def get_user_notifications(
    search: str | None = Query(
        default=None,
        description=(
            "Search notifications by title or description."
        ),
    ),
    notification_type: str | None = Query(
        default=None,
        description=(
            "Filter by notification type: "
            "info, success, warning, error."
        ),
    ),
    category: str | None = Query(
        default=None,
        description=(
            "Filter by notification category: "
            "publishing, campaign, account_activity, "
            "team_collaboration, system."
        ),
    ),
    date_from: datetime | None = Query(
        default=None,
        description=(
            "Return notifications created on or after "
            "this date/time."
        ),
    ),
    date_to: datetime | None = Query(
        default=None,
        description=(
            "Return notifications created on or before "
            "this date/time."
        ),
    ),
    current_user=Depends(get_current_user),
):
    """
    Get notification history for the currently
    authenticated user.

    Supported filters:

    - Search by title or description
    - Notification type
    - Notification category
    - Date from
    - Date to

    Results are always restricted to the
    currently authenticated user.
    """

    user_id = get_current_user_id(
        current_user
    )

    return get_notifications(
        user_id=user_id,
        search=search,
        notification_type=notification_type,
        category=category,
        date_from=date_from,
        date_to=date_to,
    )


# =========================================================
# GET NOTIFICATION DETAIL
# =========================================================

@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def get_user_notification_detail(
    notification_id: int,
    current_user=Depends(get_current_user),
):
    """
    Get details of one notification.

    The notification must belong to the
    currently authenticated user.
    """

    user_id = get_current_user_id(
        current_user
    )

    try:
        return get_notification_detail(
            user_id=user_id,
            notification_id=notification_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


# =========================================================
# GET UNREAD NOTIFICATION COUNT
# =========================================================

@router.get(
    "/unread-count",
    response_model=NotificationUnreadCountResponse,
)
def get_user_unread_notification_count(
    current_user=Depends(get_current_user),
):
    """
    Get the number of unread notifications
    for the currently authenticated user.
    """

    user_id = get_current_user_id(
        current_user
    )

    return get_unread_notification_count(
        user_id
    )


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_as_read(
    notification_id: int,
    current_user=Depends(get_current_user),
):
    """
    Mark one notification as read.
    """

    user_id = get_current_user_id(
        current_user
    )

    try:
        return mark_notification_as_read(
            user_id=user_id,
            notification_id=notification_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

@router.patch(
    "/read-all",
)
def mark_all_as_read(
    current_user=Depends(get_current_user),
):
    """
    Mark all notifications belonging to the
    current user as read.
    """

    user_id = get_current_user_id(
        current_user
    )

    return mark_all_notifications_as_read(
        user_id
    )


# =========================================================
# DELETE ONE NOTIFICATION
# =========================================================

@router.delete(
    "/{notification_id}",
)
def delete_user_notification(
    notification_id: int,
    current_user=Depends(get_current_user),
):
    """
    Delete one notification belonging to
    the current user.
    """

    user_id = get_current_user_id(
        current_user
    )

    try:
        return delete_notification(
            user_id=user_id,
            notification_id=notification_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


# =========================================================
# CLEAR ALL NOTIFICATIONS
# =========================================================

@router.delete(
    "",
)
def clear_user_notifications(
    current_user=Depends(get_current_user),
):
    """
    Delete all notifications belonging to
    the current user.
    """

    user_id = get_current_user_id(
        current_user
    )

    return clear_notifications(
        user_id
    )
