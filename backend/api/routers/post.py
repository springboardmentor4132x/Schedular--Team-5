from fastapi import APIRouter, Depends
<<<<<<< HEAD
from typing import Optional

from api.schemas.post import PostCreate, PostUpdate, PostResponse
from api.services import post as service
from api.auth.auth import get_current_user
from api.services.user import get_users

router = APIRouter(prefix="/posts", tags=["Posts"])


def _get_user_id(current_user: dict) -> int:
    users = get_users()
    for user in users:
        if user.username == current_user["username"]:
            return user.id
    raise Exception("User not found")


def _resolve_target_id(current_user, client_id: Optional[int]) -> int:
    """Helper to determine if we should query for the client or the logged-in user."""
    user_id = _get_user_id(current_user)
    
    # Normalize role check to handle both "Marketing Team" and "marketing_team"
    role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", "")
    is_marketing = role and role.lower().replace(" ", "_") == "marketing_team"

    if is_marketing and client_id is not None:
        return client_id
    return user_id


@router.get("/", response_model=list[PostResponse])
def list_posts(
    status: Optional[str] = None, 
    client_id: Optional[int] = None, 
    current_user=Depends(get_current_user)
):
    target_id = _resolve_target_id(current_user, client_id)
    return service.list_posts(target_id, status)


@router.post("/", response_model=PostResponse)
def create_post(post: PostCreate, client_id: Optional[int] = None, current_user=Depends(get_current_user)):
    target_id = _resolve_target_id(current_user, client_id)
    return service.create_post(target_id, post)


@router.get("/calendar", response_model=list[PostResponse])
def get_calendar(client_id: Optional[int] = None, current_user=Depends(get_current_user)):
    target_id = _resolve_target_id(current_user, client_id)
    return service.get_calendar(target_id)


@router.get("/queue", response_model=list[PostResponse])
def get_queue(client_id: Optional[int] = None, current_user=Depends(get_current_user)):
    target_id = _resolve_target_id(current_user, client_id)
    return service.get_queue(target_id)


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, current_user=Depends(get_current_user)):
    user_id = _get_user_id(current_user)
    return service.get_post(user_id, post_id)


@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post: PostUpdate, current_user=Depends(get_current_user)):
    user_id = _get_user_id(current_user)
    return service.update_post(user_id, post_id, post)


@router.post("/{post_id}/cancel", response_model=PostResponse)
def cancel_post(post_id: int, current_user=Depends(get_current_user)):
    user_id = _get_user_id(current_user)
    return service.cancel_post(user_id, post_id)


@router.delete("/{post_id}")
def delete_post(post_id: int, current_user=Depends(get_current_user)):
    user_id = _get_user_id(current_user)
    return service.delete_post(user_id, post_id)
=======

from api.auth.auth import get_current_user
from api.schemas.post import PostCreate, PostUpdate
from api.services.post_service import (
    create_post,
    delete_post,
    get_calendar_posts,
    get_draft_posts,
    get_post,
    get_posts,
    get_scheduled_posts,
    update_post,
)

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)


@router.get("/")
def read_posts():
    return get_posts()


@router.get("/drafts")
def read_drafts():
    return get_draft_posts()


@router.get("/scheduled")
def read_scheduled_posts():
    return get_scheduled_posts()


@router.get("/calendar")
def calendar_posts():
    return get_calendar_posts()


@router.get("/{post_id}")
def read_post(post_id: int):
    return get_post(post_id)


@router.get("/{post_id}/preview")
def preview_post(post_id: int):

    post = get_post(post_id)

    if not post:
        return {
            "message": "Post not found"
        }

    return {
        "id": post.id,
        "content": post.content,
        "media_url": post.media_url,
        "media_type": post.media_type,
        "status": post.status,
        "scheduled_time": post.scheduled_time,
        "preview": {
            "caption": post.content,
            "media": post.media_url,
            "type": post.media_type
        }
    }


@router.post("/")
def add_post(
    post: PostCreate,
    current_user=Depends(get_current_user)
):
    return create_post(post, current_user["id"])


@router.put("/{post_id}")
def edit_post(
    post_id: int,
    post: PostUpdate,
    current_user=Depends(get_current_user)
):
    return update_post(post_id, post)


@router.delete("/{post_id}")
def remove_post(
    post_id: int,
    current_user=Depends(get_current_user)
):
    return delete_post(post_id)
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)
