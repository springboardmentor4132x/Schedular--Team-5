from datetime import datetime, timezone

from fastapi import HTTPException

from api.database.session import SessionLocal
from api.models.post import Post
from api.roles.post import Status


def get_posts():
    db = SessionLocal()
    try:
        return db.query(Post).all()
    finally:
        db.close()


def get_post(post_id: int):
    db = SessionLocal()
    try:
        return db.query(Post).filter(Post.id == post_id).first()
    finally:
        db.close()


def create_post(post, user_id):
    db = SessionLocal()
    try:

        if post.scheduled_time is not None:
            now = datetime.now(timezone.utc)

            if post.scheduled_time <= now:
                raise HTTPException(
                    status_code=400,
                    detail="Scheduled time must be in the future."
                )

        new_post = Post(
            user_id=user_id,
            campaign_id=post.campaign_id,
            content=post.content,
            media_url=post.media_url,
            media_type=post.media_type,
            scheduled_time=post.scheduled_time,
            status=Status.DRAFT if post.scheduled_time is None else Status.SCHEDULED
        )

        db.add(new_post)
        db.commit()
        db.refresh(new_post)

        return {
            "message": "Post created successfully",
            "id": new_post.id
        }

    finally:
        db.close()


def update_post(post_id, data):
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()

        if not post:
            return {"message": "Post not found"}

        if data.content is not None:
            post.content = data.content

        if data.media_url is not None:
            post.media_url = data.media_url

        if data.media_type is not None:
            post.media_type = data.media_type

        if data.campaign_id is not None:
            post.campaign_id = data.campaign_id

        if data.scheduled_time is not None:

            now = datetime.now(timezone.utc)

            if data.scheduled_time <= now:
                raise HTTPException(
                    status_code=400,
                    detail="Scheduled time must be in the future."
                )

            post.scheduled_time = data.scheduled_time
            post.status = Status.SCHEDULED

        if data.status is not None:
            post.status = data.status

        db.commit()
        db.refresh(post)

        return post

    finally:
        db.close()


def delete_post(post_id):
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()

        if not post:
            return {"message": "Post not found"}

        db.delete(post)
        db.commit()

        return {"message": "Post deleted successfully"}

    finally:
        db.close()

def get_scheduled_posts():
    db = SessionLocal()
    try:
        return db.query(Post).filter(
            Post.status == Status.SCHEDULED
        ).all()
    finally:
        db.close()


def get_draft_posts():
    db = SessionLocal()
    try:
        return db.query(Post).filter(
            Post.status == Status.DRAFT
        ).all()
    finally:
        db.close()

def get_calendar_posts():
    db = SessionLocal()
    try:
        return (
            db.query(Post)
            .filter(Post.scheduled_time != None)
            .order_by(Post.scheduled_time)
            .all()
        )
    finally:
        db.close()