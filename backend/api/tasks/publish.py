import asyncio
from datetime import datetime, timezone

from celery_app import celery_app

from api.database.session import SessionLocal
from api.models.post import Post
from api.roles.post import Status
from api.roles.post_social_account import PublishStatus
from api.roles.social_account import Platform

from api.integrations.facebook import (
    publish_post as publish_to_facebook
)

from api.integrations.instagram import (
    publish_post as publish_to_instagram
)


@celery_app.task
def check_scheduled_posts():
    db = SessionLocal()

    try:
        now = datetime.now(timezone.utc)

        posts = (
            db.query(Post)
            .filter(
                Post.status == Status.SCHEDULED,
                Post.scheduled_time.isnot(None),
                Post.scheduled_time <= now,
            )
            .all()
        )

        print(
            f">>> SCHEDULER CHECK: "
            f"{len(posts)} post(s) ready",
            flush=True,
        )

        task_ids = []

        for post in posts:
            task = publish_post_task.delay(
                post.id
            )

            task_ids.append(
                task.id
            )

            print(
                f">>> PUBLISH TASK QUEUED: "
                f"post_id={post.id}, "
                f"task_id={task.id}",
                flush=True,
            )

        return {
            "checked_at": now.isoformat(),
            "posts_found": len(posts),
            "task_ids": task_ids,
        }

    finally:
        db.close()


@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def publish_post_task(
    self,
    post_id: int,
):
    print(
        f">>> TASK STARTED: post_id={post_id}",
        flush=True,
    )

    db = SessionLocal()

    try:
        post = (
            db.query(Post)
            .filter(
                Post.id == post_id
            )
            .first()
        )

        if post is None:
            print(
                f">>> POST NOT FOUND: "
                f"post_id={post_id}",
                flush=True,
            )

            return {
                "error": (
                    f"Post {post_id} not found"
                )
            }

        if post.status != Status.SCHEDULED:
            print(
                f">>> POST SKIPPED: "
                f"post_id={post_id}, "
                f"status={post.status}",
                flush=True,
            )

            return {
                "post_id": post_id,
                "status": (
                    post.status.value
                ),
                "message": (
                    "Post is not scheduled"
                ),
            }

        if not post.post_social_accounts:
            post.status = Status.FAILED

            post.published_time = (
                datetime.now(timezone.utc)
            )

            db.commit()

            return {
                "post_id": post_id,
                "status": "failed",
                "error": (
                    "No social accounts linked"
                ),
            }

        any_failed = False

        for psa in post.post_social_accounts:
            social_account = (
                psa.social_account
            )

            if (
                psa.publish_status
                == PublishStatus.PUBLISHED
            ):
                continue

            try:
                print(
                    f">>> PUBLISHING: "
                    f"post_id={post.id}, "
                    f"platform="
                    f"{social_account.platform}",
                    flush=True,
                )

                if (
                    social_account.platform
                    == Platform.FACEBOOK
                ):
                    platform_post_id = (
                        asyncio.run(
                            publish_to_facebook(
                                access_token=(
                                    social_account
                                    .access_token
                                ),
                                page_id=(
                                    social_account
                                    .account_id
                                ),
                                content=(
                                    post.content
                                ),
                                media_url=(
                                    post.media_url
                                ),
                                media_type=(
                                    post.media_type
                                ),
                            )
                        )
                    )

                elif (
                    social_account.platform
                    == Platform.INSTAGRAM
                ):
                    platform_post_id = (
                        asyncio.run(
                            publish_to_instagram(
                                access_token=(
                                    social_account
                                    .access_token
                                ),
                                ig_user_id=(
                                    social_account
                                    .account_id
                                ),
                                content=(
                                    post.content
                                ),
                                media_url=(
                                    post.media_url
                                ),
                                media_type=(
                                    post.media_type
                                ),
                            )
                        )
                    )

                else:
                    raise ValueError(
                        "Unsupported social platform"
                    )

                psa.publish_status = (
                    PublishStatus.PUBLISHED
                )

                psa.platform_post_id = (
                    platform_post_id
                )

                psa.published_time = (
                    datetime.now(timezone.utc)
                )

                psa.error_message = None

                print(
                    f">>> PUBLISH SUCCESS: "
                    f"post_id={post.id}",
                    flush=True,
                )

            except Exception as exc:
                any_failed = True

                psa.publish_status = (
                    PublishStatus.FAILED
                )

                psa.error_message = str(
                    exc
                )

                print(
                    f">>> PUBLISH FAILED: "
                    f"post_id={post.id}, "
                    f"error={exc}",
                    flush=True,
                )

        if any_failed:
            post.status = Status.FAILED
        else:
            post.status = Status.PUBLISHED

        post.published_time = (
            datetime.now(timezone.utc)
        )

        db.commit()

        print(
            f">>> TASK FINISHED: "
            f"post_id={post.id}, "
            f"status={post.status.value}",
            flush=True,
        )

        return {
            "post_id": post.id,
            "status": (
                post.status.value
            ),
            "any_failed": any_failed,
        }

    except Exception as exc:
        db.rollback()

        print(
            f">>> TASK ERROR: "
            f"post_id={post_id}, "
            f"error={exc}",
            flush=True,
        )

        raise self.retry(
            exc=exc
        )

    finally:
        db.close()