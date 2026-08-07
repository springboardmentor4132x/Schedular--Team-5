import asyncio
import json
from datetime import datetime, timezone, timedelta

import httpx
from celery_app import celery_app

from api.core.config import settings
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

        print(
            f">>> SCHEDULER CHECK: UTC now={now.isoformat()}",
            flush=True,
        )

        scheduled_posts = (
            db.query(Post)
            .filter(
                Post.status == Status.SCHEDULED,
                Post.scheduled_time.isnot(None),
            )
            .all()
        )

        print(
            f">>> SCHEDULED POSTS IN DATABASE: "
            f"{len(scheduled_posts)}",
            flush=True,
        )

        posts = []

        for post in scheduled_posts:
            scheduled_time = post.scheduled_time

            if scheduled_time.tzinfo is None:
                scheduled_time = scheduled_time.replace(
                    tzinfo=timezone.utc
                )
            else:
                scheduled_time = scheduled_time.astimezone(
                    timezone.utc
                )

            print(
                f">>> CHECKING POST: "
                f"id={post.id}, "
                f"scheduled_time={scheduled_time.isoformat()}, "
                f"now={now.isoformat()}",
                flush=True,
            )

            if scheduled_time <= now:
                posts.append(post)

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
        else:
            print(
                ">>> NO POSTS READY FOR PUBLISHING",
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
            .filter(Post.id == post_id)
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

            platform = (
                social_account.platform.value
                if hasattr(
                    social_account.platform,
                    "value",
                )
                else social_account.platform
            )

            try:
                print(
                    f">>> PUBLISHING POST: "
                    f"post_id={post.id}, "
                    f"platform={platform}",
                    flush=True,
                )

                # =====================================================
                # FACEBOOK
                # =====================================================

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

                # =====================================================
                # INSTAGRAM
                # =====================================================

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

                # =====================================================
                # YOUTUBE
                # =====================================================

                elif platform == "youtube":

                    if not post.media_url:
                        raise ValueError(
                            "YouTube publishing requires a video media_url."
                        )

                    if not social_account.refresh_token:
                        raise ValueError(
                            "YouTube refresh token is missing. "
                            "Please reconnect the YouTube account."
                        )

                    print(
                        f">>> YOUTUBE PUBLISH STARTED: "
                        f"post_id={post.id}, "
                        f"account_id={social_account.account_id}",
                        flush=True,
                    )

                    # -------------------------------------------------
                    # Refresh YouTube access token if it is expired
                    # or will expire within the next 5 minutes.
                    # -------------------------------------------------

                    token_expiry = social_account.token_expiry
                    now = datetime.now(timezone.utc)

                    if (
                        token_expiry is None
                        or token_expiry.tzinfo is None
                        or now
                        >= token_expiry.astimezone(timezone.utc)
                        - timedelta(minutes=5)
                    ):

                        print(
                            ">>> REFRESHING YOUTUBE ACCESS TOKEN",
                            flush=True,
                        )

                        token_response = httpx.post(
                            "https://oauth2.googleapis.com/token",
                            data={
                                "client_id": settings.YOUTUBE_CLIENT_ID,
                                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                                "refresh_token": social_account.refresh_token,
                                "grant_type": "refresh_token",
                            },
                            timeout=30.0,
                        )

                        token_response.raise_for_status()

                        token_json = token_response.json()

                        new_access_token = token_json.get(
                            "access_token"
                        )

                        expires_in = token_json.get(
                            "expires_in"
                        )

                        if not new_access_token:
                            raise ValueError(
                                "YouTube token refresh did not "
                                "return an access token."
                            )

                        social_account.access_token = (
                            new_access_token
                        )

                        if expires_in is not None:
                            social_account.token_expiry = (
                                datetime.now(timezone.utc)
                                + timedelta(
                                    seconds=int(expires_in)
                                )
                            )

                        db.commit()

                        print(
                            ">>> YOUTUBE ACCESS TOKEN REFRESHED",
                            flush=True,
                        )

                    # -------------------------------------------------
                    # Prepare YouTube upload request
                    # -------------------------------------------------

                    youtube_url = (
                        "https://www.googleapis.com/upload/"
                        "youtube/v3/videos"
                        "?uploadType=multipart"
                        "&part=snippet,status"
                    )

                    headers = {
                        "Authorization": (
                            f"Bearer "
                            f"{social_account.access_token}"
                        )
                    }

                    content = post.content or ""

                    title = (
                        content[:50] + "..."
                        if len(content) > 50
                        else content
                    )

                    if not title.strip():
                        title = "SocialPilot Video"

                    metadata = {
                        "snippet": {
                            "title": title,
                            "description": content,
                            "categoryId": "22",
                        },
                        "status": {
                            "privacyStatus": "public",
                        },
                    }

                    print(
                        f">>> YOUTUBE UPLOAD STARTED: "
                        f"post_id={post.id}, "
                        f"media_url={post.media_url}",
                        flush=True,
                    )

                    # -------------------------------------------------
                    # Upload video
                    # -------------------------------------------------

                    with open(
                        post.media_url,
                        "rb",
                    ) as video_file:

                        files = {
                            "metadata": (
                                None,
                                json.dumps(metadata),
                                "application/json",
                            ),
                            "file": (
                                "video.mp4",
                                video_file,
                                "video/mp4",
                            ),
                        }

                        response = httpx.post(
                            youtube_url,
                            headers=headers,
                            files=files,
                            timeout=120.0,
                        )

                    if response.status_code >= 400:
                        print(
                            f">>> YOUTUBE API ERROR: "
                            f"status={response.status_code}, "
                            f"response={response.text}",
                            flush=True,
                        )

                    response.raise_for_status()

                    youtube_data = response.json()

                    platform_post_id = youtube_data.get("id")

                    if not platform_post_id:
                        raise ValueError(
                            "YouTube upload succeeded but "
                            "no video ID was returned."
                        )

                    print(
                        f">>> YOUTUBE PUBLISH SUCCESS: "
                        f"post_id={post.id}, "
                        f"youtube_video_id={platform_post_id}",
                        flush=True,
                    )

                # =====================================================
                # UNSUPPORTED PLATFORM
                # =====================================================

                else:
                    raise ValueError(
                        f"Unsupported social platform: {platform}"
                    )

                # =====================================================
                # MARK PLATFORM PUBLISH SUCCESS
                # =====================================================

                psa.publish_status = PublishStatus.PUBLISHED
                psa.platform_post_id = str(platform_post_id)
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

        # =============================================================
        # FINAL POST STATUS
        # =============================================================

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