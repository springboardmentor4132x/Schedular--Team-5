
from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.auth.auth import get_current_user
from api.database.session import SessionLocal
from api.models.user import User
from api.schemas.team_activity import TeamActivityResponse
from api.services.team_activity import (
    get_team_activity,
    list_team_activities,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/team-activities",
    tags=["Team Activity"],
)


# =========================================================
# GET CURRENT USER ID
# =========================================================

def get_current_user_id(
    current_user,
):
    """
    Get the database user ID from the
    authenticated user.
    """

    db = SessionLocal()

    try:
        username = current_user.get("username")

        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "Username missing from authentication token"
                ),
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
            ">>> TEAM ACTIVITY CURRENT USER",
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
# GET TEAM ACTIVITY FEED
# =========================================================

@router.get(
    "",
    response_model=list[TeamActivityResponse],
)
def get_team_activity_feed(
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
        description=(
            "Maximum number of activities to return."
        ),
    ),
    offset: int = Query(
        default=0,
        ge=0,
        description=(
            "Number of activities to skip."
        ),
    ),
    current_user=Depends(get_current_user),
):
    """
    Get the Team Activity Feed.

    Activities are returned newest first.
    """

    # Make sure the request is authenticated.
    get_current_user_id(
        current_user
    )

    return list_team_activities(
        limit=limit,
        offset=offset,
    )


# =========================================================
# GET ONE TEAM ACTIVITY
# =========================================================

@router.get(
    "/{activity_id}",
    response_model=TeamActivityResponse,
)
def get_one_team_activity(
    activity_id: int,
    current_user=Depends(get_current_user),
):
    """
    Get one Team Activity by ID.
    """

    # Make sure the request is authenticated.
    get_current_user_id(
        current_user
    )

    activity = get_team_activity(
        activity_id
    )

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team activity not found",
        )

    return activity
