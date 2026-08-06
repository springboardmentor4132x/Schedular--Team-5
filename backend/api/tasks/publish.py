import asyncio
import json
import os
from datetime import datetime, timezone, timedelta
from tempfile import NamedTemporaryFile

import httpx
from celery_app import celery_app

from api.database.session import SessionLocal
from api.models.post import Post
from api.roles.post import Status
from api.roles.post_social_account import PublishStatus
from api.roles.post import MediaType

from api.integrations.facebook import (
    publish_post as publish_to_facebook,
)

from api.integrations.instagram import (
    publish_post as publish_to_instagram,
)


def publish_to_youtube_sync(
    *,
    access_token: str,
    refresh_token: str | None,
    token_expiry: datetime | None,
    post,
    social_account,
):
    print(
        f">>> YOUTUBE PUBLISH STARTED: "
        f"post_id={post.id}, "
        f"account_id={social_account.account_id}",
        flush=True,
    )

    from api.core.config import settings

    current_access_token = access_token
    current_token_expiry = token_expiry

    if (
        current_token_expiry
        and datetime.now(timezone.utc)
        >= current_token_expiry - timedelta(minutes=5)
    ):
        print(
            ">>> REFRESHING YOUTUBE ACCESS TOKEN",
            flush=True,
        )

        if not refresh_token:
            raise ValueError(
                "YouTube refresh token is missing."
            )

        token_response = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
            timeout=30.0,
        )

        token_response.raise_for_status()

        token_data = token_response.json()

        current_access_token = token_data.get(
            "access_token"
        )

        if not current_access_token:
            raise ValueError(
                "YouTube token refresh did not return "
                "an access token."
            )

        expires_in = token_data.get(
            "expires_in",
            3600,
        )

        current_token_expiry = (
            datetime.now(timezone.utc)
            + timedelta(seconds=int(expires_in))
        )

        print(
            ">>> YOUTUBE ACCESS TOKEN REFRESHED",
            flush=True,
        )

    media_url = post.media_url

    if not media_url:
        raise ValueError(
            "YouTube video media URL is missing."
        )

    if not (
        media_url.startswith("http://")
        or media_url.startswith("https://")
    ):
        raise ValueError(
            "YouTube media_url must be HTTP/HTTPS. "
            f"Received: {media_url}"
        )

    print(
        f">>> YOUTUBE VIDEO DOWNLOAD STARTED: "
        f"post_id={post.id}, "
        f"media_url={media_url}",
        flush=True,
    )

    with NamedTemporaryFile(
        suffix=".mp4",
        delete=False,
    ) as temporary_file:

        temporary_file_path = temporary_file.name

        with httpx.stream(
            "GET",
            media_url,
            timeout=120.0,
            follow_redirects=True,
        ) as download_response:

            download_response.raise_for_status()

            total_bytes = 0

            for chunk in download_response.iter_bytes(
                chunk_size=1024 * 1024
            ):
                if chunk:
                    temporary_file.write(chunk)
                    total_bytes += len(chunk)

        temporary_file.flush()

    if total_bytes == 0:
        raise ValueError(
            "Downloaded YouTube video is empty."
        )

    content = post.content or ""

    title = (
        content[:97] + "..."
        if len(content) > 100
        else content
    )

    if not title.strip():
        title = "Scheduled YouTube Video"

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

    youtube_url = (
        "https://www.googleapis.com/upload/"
        "youtube/v3/videos"
        "?uploadType=multipart"
        "&part=snippet,status"
    )

    headers = {
        "Authorization": (
            f"Bearer {current_access_token}"
        ),
    }

    try:
        with open(
            temporary_file_path,
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
                timeout=180.0,
            )

        if response.status_code >= 400:
            print(
                f">>> YOUTUBE API ERROR: "
                f"status={response.status_code}, "
                f"response={response.text}",
                flush=True,
            )

        response.raise_for_status()

        response_data = response.json()

    finally:
        try:
            os.remove(temporary_file_path)
        except OSError:
            pass

    youtube_video_id = response_data.get("id")

    if not youtube_video_id:
        raise ValueError(
            "YouTube upload succeeded but no video ID "
            "was returned."
        )

    print(
        f">>> YOUTUBE UPLOAD SUCCESS: "
        f"post_id={post.id}, "
        f"youtube_video_id={youtube_video_id}",
        flush=True,
    )

    return youtube_video_id


LINKEDIN_VERSION = "202607"


def _linkedin_headers(
    access_token: str,
) -> dict:
    return {
        "Authorization": (
            f"Bearer {access_token}"
        ),
        "LinkedIn-Version": LINKEDIN_VERSION,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
    }


def _parse_linkedin_media_urls(
    media_url,
) -> list[str]:

    if media_url is None:
        return []

    if isinstance(media_url, list):
        urls = media_url

    elif isinstance(media_url, tuple):
        urls = list(media_url)

    elif isinstance(media_url, str):

        value = media_url.strip()

        if not value:
            return []

        if value.startswith("["):

            try:
                parsed = json.loads(value)
            except json.JSONDecodeError as exc:
                raise ValueError(
                    "LinkedIn carousel media_url "
                    "contains invalid JSON."
                ) from exc

            if not isinstance(parsed, list):
                raise ValueError(
                    "LinkedIn carousel media_url must "
                    "contain a JSON array."
                )

            urls = parsed

        else:
            urls = [value]

    else:
        raise ValueError(
            "Unsupported LinkedIn media_url format."
        )

    cleaned_urls = []

    for url in urls:

        if not isinstance(url, str):
            raise ValueError(
                "Every LinkedIn media URL must be a string."
            )

        url = url.strip()

        if not url:
            continue

        if not (
            url.startswith("http://")
            or url.startswith("https://")
        ):
            raise ValueError(
                "LinkedIn media URLs must be HTTP/HTTPS."
            )

        cleaned_urls.append(url)

    return cleaned_urls


def _download_linkedin_media(
    media_url: str,
    *,
    suffix: str,
) -> str:

    if not media_url:
        raise ValueError(
            "LinkedIn media URL is missing."
        )

    if not (
        media_url.startswith("http://")
        or media_url.startswith("https://")
    ):
        raise ValueError(
            "LinkedIn media_url must be HTTP/HTTPS."
        )

    print(
        f">>> LINKEDIN MEDIA DOWNLOAD STARTED: "
        f"media_url={media_url}",
        flush=True,
    )

    with NamedTemporaryFile(
        suffix=suffix,
        delete=False,
    ) as temporary_file:

        temporary_media_path = temporary_file.name

        with httpx.stream(
            "GET",
            media_url,
            timeout=180.0,
            follow_redirects=True,
        ) as response:

            response.raise_for_status()

            content_type = (
                response.headers.get(
                    "content-type",
                    "",
                ).lower()
            )

            print(
                f">>> LINKEDIN MEDIA RESPONSE: "
                f"status={response.status_code}, "
                f"content_type={content_type}",
                flush=True,
            )

            total_bytes = 0

            for chunk in response.iter_bytes(
                chunk_size=4 * 1024 * 1024
            ):

                if chunk:
                    temporary_file.write(chunk)
                    total_bytes += len(chunk)

        temporary_file.flush()

    if total_bytes == 0:

        try:
            os.remove(temporary_media_path)
        except OSError:
            pass

        raise ValueError(
            "Downloaded LinkedIn media is empty."
        )

    print(
        f">>> LINKEDIN MEDIA DOWNLOADED: "
        f"{total_bytes} bytes",
        flush=True,
    )

    return temporary_media_path


def _linkedin_upload_image(
    *,
    access_token: str,
    author_urn: str,
    media_path: str,
) -> str:

    headers = _linkedin_headers(
        access_token
    )

    print(
        ">>> LINKEDIN IMAGE INITIALIZE STARTED",
        flush=True,
    )

    init_response = httpx.post(
        "https://api.linkedin.com/rest/images"
        "?action=initializeUpload",
        headers=headers,
        json={
            "initializeUploadRequest": {
                "owner": author_urn,
            }
        },
        timeout=60.0,
    )

    if init_response.status_code >= 400:

        print(
            f">>> LINKEDIN IMAGE INIT ERROR: "
            f"{init_response.text}",
            flush=True,
        )

    init_response.raise_for_status()

    init_data = init_response.json()["value"]

    upload_url = init_data["uploadUrl"]
    image_urn = init_data["image"]

    with open(
        media_path,
        "rb",
    ) as image_file:

        image_bytes = image_file.read()

    upload_response = httpx.put(
        upload_url,
        content=image_bytes,
        headers={
            "Content-Type": (
                "application/octet-stream"
            ),
        },
        timeout=120.0,
    )

    upload_response.raise_for_status()

    print(
        f">>> LINKEDIN IMAGE UPLOAD SUCCESS: "
        f"image_urn={image_urn}",
        flush=True,
    )

    return image_urn


def _linkedin_upload_carousel_images(
    *,
    access_token: str,
    author_urn: str,
    media_urls: list[str],
) -> list[str]:

    if len(media_urls) < 2:
        raise ValueError(
            "LinkedIn carousel requires at least "
            "2 media URLs."
        )

    if len(media_urls) > 9:
        raise ValueError(
            "LinkedIn carousel supports a maximum "
            "of 9 images in this implementation."
        )

    image_urns = []

    temporary_paths = []

    try:

        for index, media_url in enumerate(
            media_urls,
            start=1,
        ):

            print(
                f">>> LINKEDIN CAROUSEL IMAGE "
                f"{index}/{len(media_urls)}",
                flush=True,
            )

            temporary_path = (
                _download_linkedin_media(
                    media_url,
                    suffix=".jpg",
                )
            )

            temporary_paths.append(
                temporary_path
            )

            image_urn = (
                _linkedin_upload_image(
                    access_token=access_token,
                    author_urn=author_urn,
                    media_path=temporary_path,
                )
            )

            image_urns.append(
                image_urn
            )

    finally:

        for temporary_path in temporary_paths:

            try:
                os.remove(temporary_path)
            except OSError:
                pass

    print(
        f">>> LINKEDIN CAROUSEL IMAGES UPLOADED: "
        f"{len(image_urns)}",
        flush=True,
    )

    return image_urns


def _linkedin_create_post(
    *,
    access_token: str,
    payload: dict,
) -> str:

    headers = _linkedin_headers(
        access_token
    )

    print(
        ">>> LINKEDIN POST CREATION STARTED",
        flush=True,
    )

    print(
        f">>> LINKEDIN POST PAYLOAD: "
        f"{json.dumps(payload)}",
        flush=True,
    )

    response = httpx.post(
        "https://api.linkedin.com/rest/posts",
        json=payload,
        headers=headers,
        timeout=120.0,
    )

    if response.status_code >= 400:

        print(
            f">>> LINKEDIN POST API ERROR: "
            f"status={response.status_code}, "
            f"response={response.text}",
            flush=True,
        )

    response.raise_for_status()

    platform_post_id = (
        response.headers.get("x-restli-id")
        or response.headers.get("X-RestLi-Id")
    )

    if not platform_post_id:

        try:

            response_data = response.json()

            platform_post_id = (
                response_data.get("id")
                or response_data.get("urn")
            )

        except Exception:

            platform_post_id = None

    if not platform_post_id:

        raise ValueError(
            "LinkedIn post was created but "
            "no LinkedIn post ID was returned."
        )

    return platform_post_id


def _linkedin_upload_video(
    *,
    access_token: str,
    author_urn: str,
    media_path: str,
) -> str:

    headers = _linkedin_headers(
        access_token
    )

    file_size = os.path.getsize(
        media_path
    )

    if file_size <= 0:
        raise ValueError(
            "LinkedIn video file is empty."
        )

    max_linkedin_video_size = (
        5 * 1024 * 1024 * 1024
    )

    if file_size > max_linkedin_video_size:
        raise ValueError(
            "LinkedIn video exceeds the "
            "5 GB maximum allowed size."
        )

    print(
        f">>> LINKEDIN VIDEO INITIALIZE STARTED: "
        f"size={file_size} bytes",
        flush=True,
    )

    init_response = httpx.post(
        "https://api.linkedin.com/rest/videos"
        "?action=initializeUpload",
        headers=headers,
        json={
            "initializeUploadRequest": {
                "owner": author_urn,
                "fileSizeBytes": file_size,
                "uploadCaptions": False,
                "uploadThumbnail": False,
            }
        },
        timeout=60.0,
    )

    if init_response.status_code >= 400:

        print(
            f">>> LINKEDIN VIDEO INIT ERROR: "
            f"status={init_response.status_code}, "
            f"response={init_response.text}",
            flush=True,
        )

    init_response.raise_for_status()

    init_data = init_response.json()["value"]

    video_urn = init_data["video"]

    upload_token = init_data.get(
        "uploadToken",
        "",
    )

    upload_instructions = init_data.get(
        "uploadInstructions",
        [],
    )

    if not upload_instructions:
        raise ValueError(
            "LinkedIn did not return video "
            "upload instructions."
        )

    print(
        f">>> LINKEDIN VIDEO INITIALIZED: "
        f"video_urn={video_urn}, "
        f"parts={len(upload_instructions)}",
        flush=True,
    )

    uploaded_part_ids = []

    with open(
        media_path,
        "rb",
    ) as video_file:

        for index, instruction in enumerate(
            upload_instructions
        ):

            first_byte = int(
                instruction["firstByte"]
            )

            last_byte = int(
                instruction["lastByte"]
            )

            upload_url = instruction[
                "uploadUrl"
            ]

            part_size = (
                last_byte
                - first_byte
                + 1
            )

            video_file.seek(
                first_byte
            )

            part_bytes = video_file.read(
                part_size
            )

            if len(part_bytes) != part_size:
                raise ValueError(
                    "LinkedIn video part size "
                    "mismatch: "
                    f"expected={part_size}, "
                    f"received={len(part_bytes)}"
                )

            print(
                f">>> LINKEDIN VIDEO PART UPLOAD: "
                f"part={index + 1}/"
                f"{len(upload_instructions)}, "
                f"bytes={first_byte}-"
                f"{last_byte}",
                flush=True,
            )

            upload_response = httpx.put(
                upload_url,
                content=part_bytes,
                headers={
                    "Content-Type": (
                        "application/octet-stream"
                    ),
                },
                timeout=180.0,
            )

            if upload_response.status_code >= 400:

                print(
                    f">>> LINKEDIN VIDEO PART ERROR: "
                    f"part={index + 1}, "
                    f"status="
                    f"{upload_response.status_code}, "
                    f"response="
                    f"{upload_response.text}",
                    flush=True,
                )

            upload_response.raise_for_status()

            etag = (
                upload_response.headers.get(
                    "etag"
                )
            )

            if not etag:
                raise ValueError(
                    "LinkedIn did not return "
                    f"an ETag for video part "
                    f"{index + 1}."
                )

            uploaded_part_ids.append(
                etag.strip('"')
            )

    print(
        ">>> LINKEDIN VIDEO FINALIZE STARTED",
        flush=True,
    )

    finalize_response = httpx.post(
        "https://api.linkedin.com/rest/videos"
        "?action=finalizeUpload",
        headers=headers,
        json={
            "finalizeUploadRequest": {
                "video": video_urn,
                "uploadToken": upload_token,
                "uploadedPartIds": (
                    uploaded_part_ids
                ),
            }
        },
        timeout=60.0,
    )

    if finalize_response.status_code >= 400:

        print(
            f">>> LINKEDIN VIDEO FINALIZE ERROR: "
            f"status="
            f"{finalize_response.status_code}, "
            f"response="
            f"{finalize_response.text}",
            flush=True,
        )

    finalize_response.raise_for_status()

    print(
        f">>> LINKEDIN VIDEO UPLOAD FINALIZED: "
        f"video_urn={video_urn}",
        flush=True,
    )

    return video_urn


def publish_to_linkedin_sync(
    *,
    access_token: str,
    post,
    social_account,
):

    print(
        f">>> LINKEDIN PUBLISH STARTED: "
        f"post_id={post.id}, "
        f"account_id={social_account.account_id}",
        flush=True,
    )

    if not access_token:
        raise ValueError(
            "LinkedIn access token is missing."
        )

    if not social_account.account_id:
        raise ValueError(
            "LinkedIn account ID is missing."
        )

    author_urn = (
        f"urn:li:person:"
        f"{social_account.account_id}"
    )

    content = post.content or ""

    payload = {
        "author": author_urn,
        "commentary": content,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }

    temporary_media_path = None

    try:

        if not post.media_url:

            print(
                ">>> LINKEDIN TEXT POST",
                flush=True,
            )

        elif post.media_type == MediaType.CAROUSEL:

            print(
                f">>> LINKEDIN CAROUSEL POST: "
                f"post_id={post.id}",
                flush=True,
            )

            media_urls = (
                _parse_linkedin_media_urls(
                    post.media_url
                )
            )

            if len(media_urls) < 2:
                raise ValueError(
                    "LinkedIn carousel requires "
                    "at least 2 image URLs."
                )

            image_urns = (
                _linkedin_upload_carousel_images(
                    access_token=access_token,
                    author_urn=author_urn,
                    media_urls=media_urls,
                )
            )

            payload["content"] = {
                "multiImage": {
                    "images": [
                        {
                            "id": image_urn
                        }
                        for image_urn in image_urns
                    ]
                }
            }

        elif post.media_type == MediaType.IMAGE:

            print(
                f">>> LINKEDIN IMAGE POST: "
                f"post_id={post.id}",
                flush=True,
            )

            temporary_media_path = (
                _download_linkedin_media(
                    post.media_url,
                    suffix=".jpg",
                )
            )

            image_urn = (
                _linkedin_upload_image(
                    access_token=access_token,
                    author_urn=author_urn,
                    media_path=temporary_media_path,
                )
            )

            payload["content"] = {
                "media": {
                    "id": image_urn,
                }
            }

        elif post.media_type == MediaType.VIDEO:

            print(
                f">>> LINKEDIN VIDEO POST: "
                f"post_id={post.id}",
                flush=True,
            )

            temporary_media_path = (
                _download_linkedin_media(
                    post.media_url,
                    suffix=".mp4",
                )
            )

            video_urn = (
                _linkedin_upload_video(
                    access_token=access_token,
                    author_urn=author_urn,
                    media_path=temporary_media_path,
                )
            )

            payload["content"] = {
                "media": {
                    "id": video_urn,
                    "title": (
                        content[:100]
                        if content
                        else "LinkedIn Video"
                    ),
                }
            }

        else:

            raise ValueError(
                "Unsupported LinkedIn media type: "
                f"{post.media_type}"
            )

        platform_post_id = (
            _linkedin_create_post(
                access_token=access_token,
                payload=payload,
            )
        )

        print(
            f">>> LINKEDIN PUBLISH SUCCESS: "
            f"post_id={post.id}, "
            f"linkedin_post_id="
            f"{platform_post_id}",
            flush=True,
        )

        return platform_post_id

    finally:

        if temporary_media_path:

            try:
                os.remove(
                    temporary_media_path
                )
            except OSError:
                pass


@celery_app.task
def check_scheduled_posts():

    db = SessionLocal()

    try:

        now = datetime.now(
            timezone.utc
        )

        print(
            f">>> SCHEDULER CHECK: "
            f"UTC now={now.isoformat()}",
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

            scheduled_time = (
                post.scheduled_time
            )

            if scheduled_time.tzinfo is None:

                scheduled_time = (
                    scheduled_time.replace(
                        tzinfo=timezone.utc
                    )
                )

            else:

                scheduled_time = (
                    scheduled_time.astimezone(
                        timezone.utc
                    )
                )

            print(
                f">>> CHECKING POST: "
                f"id={post.id}, "
                f"scheduled_time="
                f"{scheduled_time.isoformat()}, "
                f"now={now.isoformat()}",
                flush=True,
            )

            if scheduled_time <= now:
                posts.append(post)

        task_ids = []

        for post in posts:

            post.status = Status.PUBLISHING

            task = publish_post_task.delay(
                post.id
            )

            task_ids.append(
                task.id
            )

            print(
                f">>> SCHEDULED POST FOUND: "
                f"post_id={post.id}, "
                f"scheduled_time="
                f"{post.scheduled_time}, "
                f"task_id={task.id}",
                flush=True,
            )

        db.commit()

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
        f">>> PUBLISH TASK STARTED: "
        f"post_id={post_id}",
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

            return {
                "post_id": post_id,
                "status": "not_found",
            }

        if post.status not in (
            Status.SCHEDULED,
            Status.PUBLISHING,
        ):

            return {
                "post_id": post_id,
                "status": post.status.value,
                "message": (
                    "Post is not ready for publishing"
                ),
            }

        if not post.post_social_accounts:

            post.status = Status.FAILED

            post.published_time = (
                datetime.now(
                    timezone.utc
                )
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
        any_published = False

        for psa in post.post_social_accounts:

            social_account = (
                psa.social_account
            )

            if (
                psa.publish_status
                == PublishStatus.PUBLISHED
            ):

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

                if platform == "facebook":

                    platform_post_id = (
                        asyncio.run(
                            publish_to_facebook(
                                access_token=(
                                    social_account.access_token
                                ),
                                page_id=(
                                    social_account.account_id
                                ),
                                content=post.content,
                                media_url=post.media_url,
                                media_type=(
                                    post.media_type
                                ),
                            )
                        )
                    )

                elif platform == "instagram":

                    platform_post_id = (
                        asyncio.run(
                            publish_to_instagram(
                                access_token=(
                                    social_account.access_token
                                ),
                                ig_user_id=(
                                    social_account.account_id
                                ),
                                content=post.content,
                                media_url=post.media_url,
                                media_type=(
                                    post.media_type
                                ),
                            )
                        )
                    )

                elif platform == "youtube":

                    if not post.media_url:
                        raise ValueError(
                            "A video media_url is "
                            "required for YouTube "
                            "publishing."
                        )

                    if not (
                        post.media_url.startswith(
                            "http://"
                        )
                        or post.media_url.startswith(
                            "https://"
                        )
                    ):
                        raise ValueError(
                            "YouTube media_url must "
                            "be an HTTP/HTTPS URL."
                        )

                    platform_post_id = (
                        publish_to_youtube_sync(
                            access_token=(
                                social_account.access_token
                            ),
                            refresh_token=(
                                social_account.refresh_token
                            ),
                            token_expiry=(
                                social_account.token_expiry
                            ),
                            post=post,
                            social_account=(
                                social_account
                            ),
                        )
                    )

                elif platform == "linkedin":

                    print(
                        f">>> LINKEDIN PUBLISH STARTED: "
                        f"post_id={post.id}, "
                        f"account_id="
                        f"{social_account.account_id}",
                        flush=True,
                    )

                    platform_post_id = (
                        publish_to_linkedin_sync(
                            access_token=(
                                social_account.access_token
                            ),
                            post=post,
                            social_account=(
                                social_account
                            ),
                        )
                    )

                else:

                    raise ValueError(
                        f"Unsupported social platform: "
                        f"{platform}"
                    )

                psa.publish_status = (
                    PublishStatus.PUBLISHED
                )

                psa.platform_post_id = (
                    platform_post_id
                )

                psa.published_time = (
                    datetime.now(
                        timezone.utc
                    )
                )

                psa.error_message = None

                any_published = True

                print(
                    f">>> PUBLISH SUCCESS: "
                    f"post_id={post.id}, "
                    f"platform={platform}, "
                    f"platform_post_id="
                    f"{platform_post_id}",
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

        post.published_time = (
            datetime.now(
                timezone.utc
            )
        )

        db.commit()

        print(
            f">>> PUBLISH TASK FINISHED: "
            f"post_id={post.id}, "
            f"final_status="
            f"{post.status.value}",
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

        raise self.retry(
            exc=exc
        )

    finally:

        db.close()