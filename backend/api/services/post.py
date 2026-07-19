from datetime import datetime, timezone as dt_timezone

from api.database.session import SessionLocal
from api.models.post import Post
from api.models.post_social_account import PostSocialAccount
from api.roles.post import Status
from api.roles.post_social_account import PublishStatus
from api.exceptions.post import PostNotFoundException


def _attach_platforms(db, post: Post, social_account_ids: list[int]):
    """Replace the set of platforms a post is linked to."""
    db.query(PostSocialAccount).filter(
        PostSocialAccount.post_id == post.id
    ).delete()

    for account_id in social_account_ids:
        db.add(PostSocialAccount(
            post_id=post.id,
            social_account_id=account_id,
            publish_status=PublishStatus.SCHEDULED
        ))


def create_post(user_id: int, data):
    db = SessionLocal()
    try:
        status = Status.DRAFT if data.save_as_draft else Status.SCHEDULED

        new_post = Post(
            user_id=user_id,
            campaign_id=data.campaign_id,
            content=data.content,
            media_url=data.media_url,
            media_type=data.media_type,
            scheduled_time=data.scheduled_time,
            timezone=data.timezone,
            status=status,
        )
        db.add(new_post)
        db.flush()  # get new_post.id before commit

        if data.social_account_ids:
            _attach_platforms(db, new_post, data.social_account_ids)

        db.commit()
        db.refresh(new_post)
        return new_post
    finally:
        db.close()


def list_posts(user_id: int, status: str | None = None):
    db = SessionLocal()
    try:
        query = db.query(Post).filter(Post.user_id == user_id)
        if status:
            query = query.filter(Post.status == status)
        return query.order_by(Post.scheduled_time.asc()).all()
    finally:
        db.close()


def get_post(user_id: int, post_id: int):
    db = SessionLocal()
    try:
        post = db.query(Post).filter(
            Post.id == post_id,
            Post.user_id == user_id
        ).first()
        if not post:
            raise PostNotFoundException(post_id)
        return post
    finally:
        db.close()


def update_post(user_id: int, post_id: int, data):
    db = SessionLocal()
    try:
        post = db.query(Post).filter(
            Post.id == post_id,
            Post.user_id == user_id
        ).first()
        if not post:
            raise PostNotFoundException(post_id)

        update_data = data.dict(exclude_unset=True, exclude={"social_account_ids"})
        for field, value in update_data.items():
            setattr(post, field, value)

        if data.social_account_ids is not None:
            _attach_platforms(db, post, data.social_account_ids)

        post.updated_at = datetime.now(dt_timezone.utc)
        db.commit()
        db.refresh(post)
        return post
    finally:
        db.close()


def cancel_post(user_id: int, post_id: int):
    db = SessionLocal()
    try:
        post = db.query(Post).filter(
            Post.id == post_id,
            Post.user_id == user_id
        ).first()
        if not post:
            raise PostNotFoundException(post_id)

        post.status = Status.CANCELLED
        db.commit()
        db.refresh(post)
        return post
    finally:
        db.close()


def delete_post(user_id: int, post_id: int):
    db = SessionLocal()
    try:
        post = db.query(Post).filter(
            Post.id == post_id,
            Post.user_id == user_id
        ).first()
        if not post:
            raise PostNotFoundException(post_id)
        db.delete(post)
        db.commit()
        return {"message": f"Post {post_id} deleted"}
    finally:
        db.close()


def get_calendar(user_id: int):
    """Returns all scheduled (non-draft) posts, ordered by date — for the Publishing Calendar page."""
    db = SessionLocal()
    try:
        return db.query(Post).filter(
            Post.user_id == user_id,
            Post.status.in_([Status.SCHEDULED, Status.PUBLISHED])
        ).order_by(Post.scheduled_time.asc()).all()
    finally:
        db.close()


def get_queue(user_id: int):
    """Returns posts still waiting to be published — for the Queue Management page."""
    db = SessionLocal()
    try:
        return db.query(Post).filter(
            Post.user_id == user_id,
            Post.status == Status.SCHEDULED
        ).order_by(Post.scheduled_time.asc()).all()
    finally:
        db.close()