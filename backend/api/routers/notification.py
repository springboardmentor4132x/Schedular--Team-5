
from fastapi import APIRouter, Depends, HTTPException, status

from api.auth.auth import get_current_user
from api.database.session import SessionLocal
from api.models.user import User
from api.schemas.notification import (
    NotificationResponse,
    NotificationUnreadCountResponse,
)
from api.services.notification import (
    get_notifications,
    get_unread_notification_count,
    mark_notification_as_read,
    mark_all_notifications_as_read,
    delete_notification,
    clear_notifications,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


def get_current_user_id(current_user):
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


@router.get(
    "",
    response_model=list[NotificationResponse],
)
def get_user_notifications(
    current_user=Depends(get_current_user),
):
    user_id = get_current_user_id(
        current_user
    )

    return get_notifications(
        user_id
    )


@router.get(
    "/unread-count",
    response_model=NotificationUnreadCountResponse,
)
def get_user_unread_notification_count(
    current_user=Depends(get_current_user),
):
    user_id = get_current_user_id(
        current_user
    )

    return get_unread_notification_count(
        user_id
    )


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_as_read(
    notification_id: int,
    current_user=Depends(get_current_user),
):
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


@router.patch(
    "/read-all",
)
def mark_all_as_read(
    current_user=Depends(get_current_user),
):
    user_id = get_current_user_id(
        current_user
    )

    return mark_all_notifications_as_read(
        user_id
    )


@router.delete(
    "/{notification_id}",
)
def delete_user_notification(
    notification_id: int,
    current_user=Depends(get_current_user),
):
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


@router.delete(
    "",
)
def clear_user_notifications(
    current_user=Depends(get_current_user),
):
    user_id = get_current_user_id(
        current_user
    )

    return clear_notifications(
        user_id
    )

