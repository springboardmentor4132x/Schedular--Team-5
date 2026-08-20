
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from api.auth.auth import get_current_user
from api.database.session import SessionLocal
from api.roles.user import Role
from api.schemas.post import (
    PostCreate,
    PostUpdate,
    PostResponse,
)
from api.services import post as service
from api.services.user import get_users
from api.services.content_workflow import (
    submit_for_review,
    approve_content,
    reject_content,
    ContentNotFoundError,
    InvalidWorkflowStateError,
    WorkflowAuthorizationError,
)


router = APIRouter(
    prefix="/posts",
    tags=["Posts"],
)


# =========================================================
# EXISTING USER HELPERS
# =========================================================

def _get_user(
    current_user: dict,
):
    users = get_users()

    for user in users:
        if user.username == current_user["username"]:
            return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User not found",
    )


def _get_role(
    current_user: dict,
) -> str:
    role = current_user.get(
        "role",
        "",
    )

    if hasattr(
        role,
        "value",
    ):
        role = role.value

    return str(
        role
    ).lower()


# =========================================================
# EXISTING TARGET RESOLUTION
# =========================================================

def _resolve_target_id(
    current_user: dict,
    client_id: Optional[int],
) -> int:
    user = _get_user(
        current_user
    )

    role = _get_role(
        current_user
    )

    if role == Role.MARKETING_TEAM.value:

        if client_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "client_id is required for "
                    "Marketing Team users"
                ),
            )

        return user.id

    if role == Role.CONTENT_CREATOR.value:

        if client_id is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Content Creator cannot create "
                    "content for another client"
                ),
            )

        return user.id

    if role == Role.BUSINESS_USER.value:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Business Users cannot create "
                "or schedule posts"
            ),
        )

    if role == Role.ADMINISTRATOR.value:

        return (
            client_id
            if client_id is not None
            else user.id
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=(
            "You are not authorized to manage posts"
        ),
    )


def _resolve_view_target_id(
    current_user: dict,
    client_id: Optional[int],
) -> int:
    user = _get_user(
        current_user
    )

    role = _get_role(
        current_user
    )

    if role == Role.BUSINESS_USER.value:
        return user.id

    if role == Role.CONTENT_CREATOR.value:

        if client_id is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Content Creator cannot view "
                    "another client's posts"
                ),
            )

        return user.id

    if role == Role.MARKETING_TEAM.value:

        return (
            client_id
            if client_id is not None
            else user.id
        )

    if role == Role.ADMINISTRATOR.value:

        return (
            client_id
            if client_id is not None
            else user.id
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=(
            "You are not authorized to view posts"
        ),
    )


# =========================================================
# CREATE POST
# =========================================================

@router.post(
    "/",
    response_model=PostResponse,
)
def create_post(
    post: PostCreate,
    current_user=Depends(
        get_current_user
    ),
):
    target_id = _resolve_target_id(
        current_user,
        post.client_id,
    )

    try:

        return service.create_post(
            target_id,
            post,
            current_user_role=_get_role(
                current_user
            ),
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =========================================================
# CALENDAR
# =========================================================

@router.get(
    "/calendar",
    response_model=list[PostResponse],
)
def get_calendar(
    client_id: Optional[int] = None,
    current_user=Depends(
        get_current_user
    ),
):
    target_id = _resolve_view_target_id(
        current_user,
        client_id,
    )

    try:

        return service.get_calendar(
            target_id,
            client_id,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =========================================================
# QUEUE
# =========================================================

@router.get(
    "/queue",
    response_model=list[PostResponse],
)
def get_queue(
    client_id: Optional[int] = None,
    current_user=Depends(
        get_current_user
    ),
):
    target_id = _resolve_view_target_id(
        current_user,
        client_id,
    )

    try:

        return service.get_queue(
            target_id,
            client_id,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =========================================================
# LIST POSTS
# =========================================================

@router.get(
    "/",
    response_model=list[PostResponse],
)
def list_posts(
    client_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    current_user=Depends(
        get_current_user
    ),
):
    target_id = _resolve_view_target_id(
        current_user,
        client_id,
    )

    try:

        return service.list_posts(
            target_id,
            status_filter,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =========================================================
# SUBMIT FOR REVIEW
# =========================================================

@router.post(
    "/{post_id}/submit-for-review",
    response_model=PostResponse,
)
def submit_post_for_review(
    post_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    """
    Submit a draft post for review.

    Allowed roles:

    - Content Creator
    - Administrator

    Marketing Team users are not intended to submit
    content for review through this endpoint.
    """

    role = _get_role(
        current_user
    )

    if role not in (
        Role.CONTENT_CREATOR.value,
        Role.ADMINISTRATOR.value,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only Content Creators and "
                "Administrators can submit content "
                "for review."
            ),
        )

    user = _get_user(
        current_user
    )

    db = SessionLocal()

    try:

        post = submit_for_review(
            db=db,
            post_id=post_id,
            user_id=user.id,
            user_role=role,
        )

        return post

    except ContentNotFoundError as exc:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except InvalidWorkflowStateError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except WorkflowAuthorizationError as exc:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    finally:

        db.close()


# =========================================================
# APPROVE CONTENT
# =========================================================

@router.post(
    "/{post_id}/approve",
    response_model=PostResponse,
)
def approve_post(
    post_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    """
    Approve content that is waiting for review.

    Allowed roles:

    - Marketing Team
    - Administrator
    """

    role = _get_role(
        current_user
    )

    if role not in (
        Role.MARKETING_TEAM.value,
        Role.ADMINISTRATOR.value,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only Marketing Team users and "
                "Administrators can approve content."
            ),
        )

    user = _get_user(
        current_user
    )

    db = SessionLocal()

    try:

        post = approve_content(
            db=db,
            post_id=post_id,
            user_id=user.id,
            user_role=role,
        )

        return post

    except ContentNotFoundError as exc:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except InvalidWorkflowStateError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except WorkflowAuthorizationError as exc:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    finally:

        db.close()


# =========================================================
# REJECT CONTENT
# =========================================================

@router.post(
    "/{post_id}/reject",
    response_model=PostResponse,
)
def reject_post(
    post_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    """
    Reject content that is waiting for review.

    Allowed roles:

    - Marketing Team
    - Administrator
    """

    role = _get_role(
        current_user
    )

    if role not in (
        Role.MARKETING_TEAM.value,
        Role.ADMINISTRATOR.value,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only Marketing Team users and "
                "Administrators can reject content."
            ),
        )

    user = _get_user(
        current_user
    )

    db = SessionLocal()

    try:

        post = reject_content(
            db=db,
            post_id=post_id,
            user_id=user.id,
            user_role=role,
        )

        return post

    except ContentNotFoundError as exc:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except InvalidWorkflowStateError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except WorkflowAuthorizationError as exc:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    finally:

        db.close()


# =========================================================
# GET SINGLE POST
# =========================================================

@router.get(
    "/{post_id}",
    response_model=PostResponse,
)
def get_post(
    post_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    user = _get_user(
        current_user
    )

    role = _get_role(
        current_user
    )

    try:

        if role == Role.MARKETING_TEAM.value:

            return service.get_post_for_marketing_team(
                user.id,
                post_id,
            )

        if role in (
            Role.BUSINESS_USER.value,
            Role.CONTENT_CREATOR.value,
            Role.ADMINISTRATOR.value,
        ):

            return service.get_post(
                user.id,
                post_id,
            )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not authorized "
                "to view this post"
            ),
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =========================================================
# PREVIEW POST
# =========================================================

@router.get(
    "/{post_id}/preview",
)
def preview_post(
    post_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    try:

        post = service.get_post(
            _get_user(
                current_user
            ).id,
            post_id,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    if not post:

        return {
            "message": "Post not found"
        }

    return {
        "id": post["id"],
        "content": post["content"],
        "media_url": post["media_url"],
        "media_type": post["media_type"],
        "status": post["status"],
        "scheduled_time": post["scheduled_time"],
        "preview": {
            "caption": post["content"],
            "media": post["media_url"],
            "type": post["media_type"],
        },
    }


# =========================================================
# UPDATE POST
# =========================================================

@router.put(
    "/{post_id}",
    response_model=PostResponse,
)
def update_post(
    post_id: int,
    post: PostUpdate,
    current_user=Depends(
        get_current_user
    ),
):
    user = _get_user(
        current_user
    )

    role = _get_role(
        current_user
    )

    if role == Role.BUSINESS_USER.value:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business Users cannot edit posts",
        )

    try:

        if role == Role.MARKETING_TEAM.value:

            return service.update_post_for_marketing_team(
                user.id,
                post_id,
                post,
            )

        if role in (
            Role.CONTENT_CREATOR.value,
            Role.ADMINISTRATOR.value,
        ):

            return service.update_post(
                user.id,
                post_id,
                post,
            )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not authorized "
                "to edit posts"
            ),
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =========================================================
# CANCEL POST
# =========================================================

@router.post(
    "/{post_id}/cancel",
    response_model=PostResponse,
)
def cancel_post(
    post_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    user = _get_user(
        current_user
    )

    role = _get_role(
        current_user
    )

    if role == Role.BUSINESS_USER.value:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business Users cannot cancel posts",
        )

    try:

        if role == Role.MARKETING_TEAM.value:

            return service.cancel_post_for_marketing_team(
                user.id,
                post_id,
            )

        if role in (
            Role.CONTENT_CREATOR.value,
            Role.ADMINISTRATOR.value,
        ):

            return service.cancel_post(
                user.id,
                post_id,
            )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not authorized "
                "to cancel posts"
            ),
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# =========================================================
# DELETE POST FROM SOCIAL ACCOUNT
# =========================================================

@router.delete(
    "/{post_id}/social-accounts/{social_account_id}",
)
def delete_post_from_social_account(
    post_id: int,
    social_account_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    user = _get_user(
        current_user
    )

    role = _get_role(
        current_user
    )

    if role == Role.BUSINESS_USER.value:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Business Users cannot "
                "delete posts"
            ),
        )

    try:

        if role == Role.MARKETING_TEAM.value:

            return (
                service
                .delete_post_from_social_account_for_marketing_team(
                    user.id,
                    post_id,
                    social_account_id,
                )
            )

        if role in (
            Role.CONTENT_CREATOR.value,
            Role.ADMINISTRATOR.value,
        ):

            return service.delete_post_from_social_account(
                user.id,
                post_id,
                social_account_id,
            )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not authorized "
                "to delete posts"
            ),
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )


# =========================================================
# DELETE POST
# =========================================================

@router.delete(
    "/{post_id}",
)
def delete_post(
    post_id: int,
    current_user=Depends(
        get_current_user
    ),
):
    user = _get_user(
        current_user
    )

    role = _get_role(
        current_user
    )

    if role == Role.BUSINESS_USER.value:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Business Users cannot "
                "delete posts"
            ),
        )

    try:

        if role == Role.MARKETING_TEAM.value:

            return service.delete_post_for_marketing_team(
                user.id,
                post_id,
            )

        if role in (
            Role.CONTENT_CREATOR.value,
            Role.ADMINISTRATOR.value,
        ):

            return service.delete_post(
                user.id,
                post_id,
            )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not authorized "
                "to delete posts"
            ),
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )
