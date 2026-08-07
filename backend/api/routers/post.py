from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from api.auth.auth import get_current_user
from api.roles.user import Role
from api.schemas.post import PostCreate, PostUpdate, PostResponse
from api.services import post as service
from api.services.user import get_users


router = APIRouter(
    prefix="/posts",
    tags=["Posts"],
)


def _get_user(current_user: dict):
    users = get_users()

    for user in users:
        if user.username == current_user["username"]:
            return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User not found",
    )


def _get_role(current_user: dict) -> str:
    role = current_user.get("role", "")

    if hasattr(role, "value"):
        role = role.value

    return str(role).lower()


def _resolve_target_id(
    current_user: dict,
    client_id: Optional[int],
) -> int:
    user = _get_user(current_user)
    role = _get_role(current_user)

    if role == Role.MARKETING_TEAM.value:
        if client_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="client_id is required for Marketing Team users",
            )

        return user.id

    if role == Role.CONTENT_CREATOR.value:
        if client_id is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content Creator cannot create content for another client",
            )

        return user.id

    if role == Role.BUSINESS_USER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business Users cannot create or schedule posts",
        )

    if role == Role.ADMINISTRATOR.value:
        return client_id if client_id is not None else user.id

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You are not authorized to manage posts",
    )


def _resolve_view_target_id(
    current_user: dict,
    client_id: Optional[int],
) -> int:
    user = _get_user(current_user)
    role = _get_role(current_user)

    if role == Role.BUSINESS_USER.value:
        return user.id

    if role == Role.CONTENT_CREATOR.value:
        if client_id is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Content Creator cannot view another client's posts",
            )

        return user.id

    if role == Role.MARKETING_TEAM.value:
        return client_id if client_id is not None else user.id

    if role == Role.ADMINISTRATOR.value:
        return client_id if client_id is not None else user.id

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You are not authorized to view posts",
    )


@router.get(
    "/",
    response_model=list[PostResponse],
)
def list_posts(
    status_filter: Optional[str] = None,
    client_id: Optional[int] = None,
    current_user=Depends(get_current_user),
):
    target_id = _resolve_view_target_id(
        current_user,
        client_id,
    )

    return service.list_posts(
        target_id,
        status_filter,
    )


@router.post(
    "/",
    response_model=PostResponse,
)
def create_post(
    post: PostCreate,
    current_user=Depends(get_current_user),
):
    target_id = _resolve_target_id(
        current_user,
        post.client_id,
    )

    try:
        return service.create_post(
            target_id,
            post,
            current_user_role=_get_role(current_user),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/calendar",
    response_model=list[PostResponse],
)
def get_calendar(
    client_id: Optional[int] = None,
    current_user=Depends(get_current_user),
):
    target_id = _resolve_view_target_id(
        current_user,
        client_id,
    )

    try:
        return service.get_calendar(target_id, client_id)
    except TypeError:
        return service.get_calendar(target_id)


@router.get(
    "/queue",
    response_model=list[PostResponse],
)
def get_queue(
    client_id: Optional[int] = None,
    current_user=Depends(get_current_user),
):
    target_id = _resolve_view_target_id(
        current_user,
        client_id,
    )

    return service.get_queue(target_id)


@router.get(
    "/{post_id}",
    response_model=PostResponse,
)
def get_post(
    post_id: int,
    current_user=Depends(get_current_user),
):
    user = _get_user(current_user)
    role = _get_role(current_user)

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
            detail="You are not authorized to view this post",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.put(
    "/{post_id}",
    response_model=PostResponse,
)
def update_post(
    post_id: int,
    post: PostUpdate,
    current_user=Depends(get_current_user),
):
    user = _get_user(current_user)
    role = _get_role(current_user)

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
            detail="You are not authorized to edit posts",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post(
    "/{post_id}/cancel",
    response_model=PostResponse,
)
def cancel_post(
    post_id: int,
    current_user=Depends(get_current_user),
):
    user = _get_user(current_user)
    role = _get_role(current_user)

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
            detail="You are not authorized to cancel posts",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.delete(
    "/{post_id}",
)
def delete_post(
    post_id: int,
    current_user=Depends(get_current_user),
):
    user = _get_user(current_user)
    role = _get_role(current_user)

    if role == Role.BUSINESS_USER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business Users cannot delete posts",
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
            detail="You are not authorized to delete posts",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )