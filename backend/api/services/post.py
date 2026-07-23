from datetime import datetime, timezone as dt_timezone
from zoneinfo import ZoneInfo

from api.database.session import SessionLocal
from api.models.post import Post
from api.models.post_social_account import PostSocialAccount
from api.roles.post import Status
from api.roles.post_social_account import PublishStatus
from api.exceptions.post import PostNotFoundException


DEFAULT_TIMEZONE = "Asia/Kolkata"


def _convert_to_utc(scheduled_time, timezone_name):
    if scheduled_time is None:
        return None

    timezone_name = timezone_name or DEFAULT_TIMEZONE

    try:
        user_timezone = ZoneInfo(timezone_name)
    except Exception:
        raise ValueError(
            f"Invalid timezone: {timezone_name}"
        )

    if scheduled_time.tzinfo is None:
        scheduled_time = scheduled_time.replace(
            tzinfo=user_timezone
        )

    return scheduled_time.astimezone(dt_timezone.utc)


def _attach_platforms(
    db,
    post: Post,
    social_account_ids: list[int],
):
    db.query(PostSocialAccount).filter(
        PostSocialAccount.post_id == post.id
    ).delete(
        synchronize_session=False
    )

    for account_id in social_account_ids:
        db.add(
            PostSocialAccount(
                post_id=post.id,
                social_account_id=account_id,
                publish_status=PublishStatus.SCHEDULED,
            )
        )


def create_post(user_id: int, data):
    db = SessionLocal()

    try:
        if data.save_as_draft:
            status = Status.DRAFT
        else:
            status = Status.SCHEDULED

        timezone_name = (
            data.timezone
            or DEFAULT_TIMEZONE
        )

        scheduled_time = _convert_to_utc(
            data.scheduled_time,
            timezone_name,
        )

        if not data.save_as_draft and scheduled_time is None:
            raise ValueError(
                "scheduled_time is required for scheduled posts"
            )

        if (
            not data.save_as_draft
            and scheduled_time <= datetime.now(dt_timezone.utc)
        ):
            raise ValueError(
                "scheduled_time must be in the future"
            )

        if (
            not data.save_as_draft
            and not data.social_account_ids
        ):
            raise ValueError(
                "At least one social account is required for scheduled posts"
            )

        new_post = Post(
            user_id=user_id,
            campaign_id=data.campaign_id,
            content=data.content,
            media_url=data.media_url,
            media_type=data.media_type,
            scheduled_time=scheduled_time,
            timezone=timezone_name,
            status=status,
        )

        db.add(new_post)

        db.flush()

        if data.social_account_ids:
            _attach_platforms(
                db,
                new_post,
                data.social_account_ids,
            )

        db.commit()
        db.refresh(new_post)

        return new_post

    finally:
        db.close()


def list_posts(
    user_id: int,
    status: str | None = None,
):
    db = SessionLocal()

    try:
        query = db.query(Post).filter(
            Post.user_id == user_id
        )

        if status:
            query = query.filter(
                Post.status == status
            )

        return query.order_by(
            Post.scheduled_time.asc()
        ).all()

    finally:
        db.close()


def get_post(
    user_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:
        post = db.query(Post).filter(
            Post.id == post_id,
            Post.user_id == user_id,
        ).first()

        if not post:
            raise PostNotFoundException(post_id)

        return post

    finally:
        db.close()


def update_post(
    user_id: int,
    post_id: int,
    data,
):
    db = SessionLocal()

    try:
        post = db.query(Post).filter(
            Post.id == post_id,
            Post.user_id == user_id,
        ).first()

        if not post:
            raise PostNotFoundException(post_id)

        update_data = data.dict(
            exclude_unset=True,
            exclude={"social_account_ids"},
        )

        timezone_name = (
            update_data.get("timezone")
            or post.timezone
            or DEFAULT_TIMEZONE
        )

        if "scheduled_time" in update_data:
            scheduled_time = update_data["scheduled_time"]

            if scheduled_time is not None:
                scheduled_time = _convert_to_utc(
                    scheduled_time,
                    timezone_name,
                )

                if scheduled_time <= datetime.now(
                    dt_timezone.utc
                ):
                    raise ValueError(
                        "scheduled_time must be in the future"
                    )

                update_data[
                    "scheduled_time"
                ] = scheduled_time

        if "timezone" in update_data:
            update_data["timezone"] = timezone_name

        for field, value in update_data.items():
            setattr(
                post,
                field,
                value,
            )

        if data.social_account_ids is not None:
            _attach_platforms(
                db,
                post,
                data.social_account_ids,
            )

        post.updated_at = datetime.now(
            dt_timezone.utc
        )

        db.commit()
        db.refresh(post)

        return post

    finally:
        db.close()


def cancel_post(
    user_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:
        post = db.query(Post).filter(
            Post.id == post_id,
            Post.user_id == user_id,
        ).first()

        if not post:
            raise PostNotFoundException(post_id)

        post.status = Status.CANCELLED

        db.commit()
        db.refresh(post)

        return post

    finally:
        db.close()


def delete_post(
    user_id: int,
    post_id: int,
):
    db = SessionLocal()

    try:
        post = db.query(Post).filter(
            Post.id == post_id,
            Post.user_id == user_id,
        ).first()

        if not post:
            raise PostNotFoundException(post_id)

        db.delete(post)

        db.commit()

        return {
            "message": f"Post {post_id} deleted"
        }

    finally:
        db.close()


def get_calendar(user_id: int):
    db = SessionLocal()

    try:
        return db.query(Post).filter(
            Post.user_id == user_id,
            Post.status.in_([
                Status.SCHEDULED,
                Status.PUBLISHED,
                Status.FAILED,
                Status.CANCELLED,
            ]),
        ).order_by(
            Post.scheduled_time.asc()
        ).all()

    finally:
        db.close()


def get_queue(user_id: int):
    db = SessionLocal()

    try:
        return db.query(Post).filter(
            Post.user_id == user_id,
            Post.status == Status.SCHEDULED,
            Post.scheduled_time.isnot(None),
        ).order_by(
            Post.scheduled_time.asc()
        ).all()

    finally:
        db.close()