from fastapi import APIRouter, Depends

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
        return {"message": "Post not found"}

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
            "type": post.media_type,
        },
    }


@router.post("/")
def add_post(
    post: PostCreate,
    current_user=Depends(get_current_user),
):
    return create_post(post, current_user["id"])


@router.put("/{post_id}")
def edit_post(
    post_id: int,
    post: PostUpdate,
    current_user=Depends(get_current_user),
):
    return update_post(post_id, post)


@router.delete("/{post_id}")
def remove_post(
    post_id: int,
    current_user=Depends(get_current_user),
):
    return delete_post(post_id)