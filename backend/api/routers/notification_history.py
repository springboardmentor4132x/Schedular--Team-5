from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query

from api.auth.auth import get_current_user

from api.schemas.notification import (
    NotificationHistoryResponse,
    NotificationHistoryDetailResponse,
    NotificationHistoryDeleteResponse,
)

from api.services.notification import (
    get_notification_history,
    get_notification_history_detail,
    delete_notification_history,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/notification-history",
    tags=["Notification History"],
)


# =========================================================
# GET NOTIFICATION HISTORY
# =========================================================

@router.get(
    "",
    response_model=list[NotificationHistoryResponse],
    summary="Get Notification History",
)
def fetch_notification_history(
    search: str | None = Query(
        None,
        description=(
            "Search term for title or description"
        ),
    ),
    category: str | None = Query(
        None,
        description="Filter by category",
    ),
    notification_type: str | None = Query(
        None,
        description="Filter by notification type",
    ),
    is_read: bool | None = Query(
        None,
        description="Filter by read/unread status",
    ),
    date_from: datetime | None = Query(
        None,
        description=(
            "Filter from date (IST/UTC datetime)"
        ),
    ),
    date_to: datetime | None = Query(
        None,
        description=(
            "Filter to date (IST/UTC datetime)"
        ),
    ),
    current_user=Depends(get_current_user),
):
    """
    Retrieve historical notifications for the
    authenticated user with optional filters.
    """

    return get_notification_history(
        user_id=current_user["id"],
        search=search,
        notification_type=notification_type,
        category=category,
        is_read=is_read,
        date_from=date_from,
        date_to=date_to,
    )


# =========================================================
# GET NOTIFICATION HISTORY DETAIL
# =========================================================

@router.get(
    "/{notification_id}",
    response_model=NotificationHistoryDetailResponse,
    summary="Get Notification History Detail",
)
def fetch_notification_history_detail(
    notification_id: int,
    current_user=Depends(get_current_user),
):
    """
    Get full details of a specific notification
    item from history.

    The notification must belong to the
    authenticated user.
    """

    try:
        return get_notification_history_detail(
            user_id=current_user["id"],
            notification_id=notification_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


# =========================================================
# DELETE NOTIFICATION HISTORY RECORD
# =========================================================

@router.delete(
    "/{notification_id}",
    response_model=NotificationHistoryDeleteResponse,
    summary="Delete Notification from History",
)
def remove_notification_history_item(
    notification_id: int,
    current_user=Depends(get_current_user),
):
    """
    Delete a specific notification history record.

    The notification must belong to the
    authenticated user.
    """

    try:
        return delete_notification_history(
            user_id=current_user["id"],
            notification_id=notification_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )