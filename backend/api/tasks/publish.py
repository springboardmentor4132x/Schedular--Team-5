import asyncio
from datetime import datetime, timezone

from celery_app import celery_app

from api.database.session import SessionLocal
from api.models.post import Post
from api.roles.post import Status
from api.roles.post_social_account import PublishStatus

from api.integrations.facebook import (
    publish_post as publish_to_facebook,
)

from api.integrations.instagram import (
    publish_post as publish_to_instagram,
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

        task_ids = []

        for post in posts:
            post.status = Status.PUBLISHING

            task = publish_post_task.delay(post.id)

            task_ids.append(task.id)

            print(
                f">>> SCHEDULED POST FOUND: "
                f"post_id={post.id}, "
                f"scheduled_time={post.scheduled_time}, "
                f"task_id={task.id}",
                flush=True,
            )

        db.commit()

        if posts:
            print(
                f">>> {len(posts)} POST(S) SENT FOR PUBLISHING",
                flush=True,
            )

        return {
            "checked_at": now.isoformat(),
            "posts_found": len(posts),
            "task_ids": task_ids,
        }

    except Exception:
        db.rollback()
        raise

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
        f">>> PUBLISH TASK STARTED: post_id={post_id}",
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
                f">>> POST NOT FOUND: post_id={post_id}",
                flush=True,
            )

            return {
                "post_id": post_id,
                "status": "not_found",
            }

        if post.status not in (
            Status.SCHEDULED,
            Status.PUBLISHING,
        ):
            print(
                f">>> POST SKIPPED: "
                f"post_id={post_id}, "
                f"status={post.status.value}",
                flush=True,
            )

            return {
                "post_id": post_id,
                "status": post.status.value,
                "message": "Post is not ready for publishing",
            }

        if not post.post_social_accounts:
            post.status = Status.FAILED
            post.published_time = datetime.now(timezone.utc)

            db.commit()

            print(
                f">>> POST FAILED: "
                f"post_id={post_id}, "
                f"reason=no social accounts linked",
                flush=True,
            )

            return {
                "post_id": post_id,
                "status": "failed",
                "error": "No social accounts linked",
            }

        any_failed = False
        any_published = False

        for psa in post.post_social_accounts:

            social_account = psa.social_account

            if psa.publish_status == PublishStatus.PUBLISHED:
                any_published = True
                continue

            try:
                platform = (
                    social_account.platform.value
                    if hasattr(
                        social_account.platform,
                        "value",
                    )
                    else social_account.platform
                )

                print(
                    f">>> PUBLISHING POST: "
                    f"post_id={post.id}, "
                    f"platform={platform}",
                    flush=True,
                )

                if platform == "facebook":

                    platform_post_id = asyncio.run(
                        publish_to_facebook(
                            access_token=social_account.access_token,
                            page_id=social_account.account_id,
                            content=post.content,
                            media_url=post.media_url,
                            media_type=post.media_type,
                        )
                    )

                elif platform == "instagram":

                    platform_post_id = asyncio.run(
                        publish_to_instagram(
                            access_token=social_account.access_token,
                            ig_user_id=social_account.account_id,
                            content=post.content,
                            media_url=post.media_url,
                            media_type=post.media_type,
                        )
                    )

                else:
                    raise ValueError(
                        f"Unsupported social platform: {platform}"
                    )

                psa.publish_status = PublishStatus.PUBLISHED
                psa.platform_post_id = platform_post_id
                psa.published_time = datetime.now(timezone.utc)
                psa.error_message = None

                any_published = True

                print(
                    f">>> PUBLISH SUCCESS: "
                    f"post_id={post.id}, "
                    f"platform={platform}, "
                    f"platform_post_id={platform_post_id}",
                    flush=True,
                )

            except Exception as exc:

                any_failed = True

                psa.publish_status = PublishStatus.FAILED
                psa.error_message = str(exc)

                print(
                    f">>> PUBLISH FAILED: "
                    f"post_id={post.id}, "
                    f"platform={platform}, "
                    f"error={exc}",
                    flush=True,
                )

        if any_failed:
            post.status = Status.FAILED

        elif any_published:
            post.status = Status.PUBLISHED

        else:
            post.status = Status.FAILED

        post.published_time = datetime.now(timezone.utc)

        db.commit()

        print(
            f">>> PUBLISH TASK FINISHED: "
            f"post_id={post.id}, "
            f"final_status={post.status.value}",
            flush=True,
        )

        return {
            "post_id": post.id,
            "status": post.status.value,
            "any_failed": any_failed,
            "any_published": any_published,
        }

    except Exception as exc:

        db.rollback()

        print(
            f">>> PUBLISH TASK ERROR: "
            f"post_id={post_id}, "
            f"error={exc}",
            flush=True,
        )

        raise self.retry(exc=exc)

    finally:
        db.close()