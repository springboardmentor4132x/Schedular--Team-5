import json
import os
from datetime import datetime, timezone
from tempfile import NamedTemporaryFile

import httpx

from api.core.celery_setup import celery_app
from api.database.session import SessionLocal

from api.models.schedule import Schedule
from api.models.social_account import SocialAccount
from api.models.post import Post

from api.roles.post import (
    MediaType,
    Status as PostStatus,
)

from api.roles.schedule import (
    Status as ScheduleStatus,
)


# ============================================================
# LINKEDIN CONFIGURATION
# ============================================================

LINKEDIN_VERSION = "202607"

LINKEDIN_POSTS_URL = (
    "https://api.linkedin.com/rest/posts"
)

LINKEDIN_IMAGES_URL = (
    "https://api.linkedin.com/rest/images"
)


# ============================================================
# LINKEDIN HEADERS
# ============================================================

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


# ============================================================
# PARSE CAROUSEL URLS
# ============================================================

def _parse_carousel_urls(
    media_urls,
) -> list[str]:

    if media_urls is None:
        return []

    # Already a Python list
    if isinstance(media_urls, list):

        urls = media_urls

    # JSON string
    elif isinstance(media_urls, str):

        media_urls = media_urls.strip()

        if not media_urls:
            return []

        try:
            parsed = json.loads(
                media_urls
            )

        except json.JSONDecodeError as exc:

            raise ValueError(
                "LinkedIn carousel media_urls "
                "contains invalid JSON."
            ) from exc

        if not isinstance(
            parsed,
            list,
        ):

            raise ValueError(
                "LinkedIn carousel media_urls "
                "must contain a JSON array."
            )

        urls = parsed

    else:

        raise ValueError(
            "Unsupported LinkedIn carousel "
            "media_urls format."
        )

    cleaned = []

    for url in urls:

        if not isinstance(
            url,
            str,
        ):

            raise ValueError(
                "Every LinkedIn carousel "
                "media URL must be a string."
            )

        url = url.strip()

        if not url:
            continue

        if not (
            url.startswith("http://")
            or url.startswith("https://")
        ):

            raise ValueError(
                "LinkedIn carousel media URLs "
                "must be HTTP/HTTPS URLs."
            )

        cleaned.append(url)

    return cleaned


# ============================================================
# DOWNLOAD LINKEDIN MEDIA
# ============================================================

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
            "LinkedIn media URL must be HTTP/HTTPS."
        )

    print(
        ">>> LINKEDIN MEDIA DOWNLOAD STARTED",
        flush=True,
    )

    print(
        f">>> MEDIA URL: {media_url}",
        flush=True,
    )

    with NamedTemporaryFile(
        suffix=suffix,
        delete=False,
    ) as temporary_file:

        temporary_path = (
            temporary_file.name
        )

        with httpx.stream(
            "GET",
            media_url,
            timeout=180.0,
            follow_redirects=True,
        ) as response:

            print(
                ">>> LINKEDIN MEDIA DOWNLOAD STATUS:",
                response.status_code,
                flush=True,
            )

            response.raise_for_status()

            total_bytes = 0

            for chunk in response.iter_bytes(
                chunk_size=4 * 1024 * 1024
            ):

                if chunk:

                    temporary_file.write(
                        chunk
                    )

                    total_bytes += len(
                        chunk
                    )

        temporary_file.flush()

    if total_bytes <= 0:

        try:
            os.remove(
                temporary_path
            )
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

    return temporary_path


# ============================================================
# LINKEDIN IMAGE UPLOAD
# ============================================================

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
        f"{LINKEDIN_IMAGES_URL}"
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
            ">>> LINKEDIN IMAGE INIT ERROR:",
            init_response.text,
            flush=True,
        )

    init_response.raise_for_status()

    init_data = (
        init_response.json()
        .get("value")
    )

    if not init_data:

        raise ValueError(
            "LinkedIn image initialization "
            "returned no value."
        )

    upload_url = (
        init_data.get("uploadUrl")
    )

    image_urn = (
        init_data.get("image")
    )

    if not upload_url:

        raise ValueError(
            "LinkedIn did not return "
            "an image upload URL."
        )

    if not image_urn:

        raise ValueError(
            "LinkedIn did not return "
            "an image URN."
        )

    with open(
        media_path,
        "rb",
    ) as image_file:

        image_bytes = (
            image_file.read()
        )

    if not image_bytes:

        raise ValueError(
            "LinkedIn image file is empty."
        )

    upload_response = httpx.put(
        upload_url,
        content=image_bytes,
        headers={
            "Content-Type":
                "application/octet-stream",
        },
        timeout=120.0,
    )

    if upload_response.status_code >= 400:

        print(
            ">>> LINKEDIN IMAGE UPLOAD ERROR:",
            upload_response.text,
            flush=True,
        )

    upload_response.raise_for_status()

    print(
        ">>> LINKEDIN IMAGE UPLOAD SUCCESS:",
        image_urn,
        flush=True,
    )

    return image_urn


# ============================================================
# LINKEDIN CAROUSEL / MULTI-IMAGE UPLOAD
# ============================================================

def _linkedin_upload_carousel_images(
    *,
    access_token: str,
    author_urn: str,
    media_urls: list[str],
) -> list[str]:

    if len(media_urls) < 2:

        raise ValueError(
            "LinkedIn MultiImage requires "
            "at least 2 images."
        )

    # LinkedIn supports up to 20 images.
    # Your frontend currently allows 10,
    # so this backend accepts 2-10.
    if len(media_urls) > 10:

        raise ValueError(
            "LinkedIn MultiImage supports "
            "a maximum of 10 images in this application."
        )

    image_urns = []

    for index, media_url in enumerate(
        media_urls,
        start=1,
    ):

        print(
            f">>> LINKEDIN MULTIIMAGE "
            f"{index}/{len(media_urls)}",
            flush=True,
        )

        temporary_path = None

        try:

            temporary_path = (
                _download_linkedin_media(
                    media_url,
                    suffix=".jpg",
                )
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

            if temporary_path:

                try:
                    os.remove(
                        temporary_path
                    )
                except OSError:
                    pass

    if len(image_urns) != len(
        media_urls
    ):

        raise ValueError(
            "Not all LinkedIn carousel "
            "images were uploaded successfully."
        )

    return image_urns


# ============================================================
# LINKEDIN VIDEO UPLOAD
# ============================================================

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

    print(
        f">>> LINKEDIN VIDEO INITIALIZE: "
        f"{file_size} bytes",
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
            ">>> LINKEDIN VIDEO INIT ERROR:",
            init_response.text,
            flush=True,
        )

    init_response.raise_for_status()

    init_data = (
        init_response.json()
        .get("value")
    )

    if not init_data:

        raise ValueError(
            "LinkedIn video initialization "
            "returned no value."
        )

    video_urn = init_data.get(
        "video"
    )

    upload_token = init_data.get(
        "uploadToken"
    )

    instructions = init_data.get(
        "uploadInstructions",
        [],
    )

    if not video_urn:

        raise ValueError(
            "LinkedIn did not return "
            "a video URN."
        )

    if not upload_token:

        raise ValueError(
            "LinkedIn did not return "
            "a video upload token."
        )

    if not instructions:

        raise ValueError(
            "LinkedIn did not return "
            "video upload instructions."
        )

    uploaded_part_ids = []

    with open(
        media_path,
        "rb",
    ) as video_file:

        for index, instruction in enumerate(
            instructions
        ):

            upload_url = (
                instruction.get(
                    "uploadUrl"
                )
            )

            first_byte = instruction.get(
                "firstByte"
            )

            last_byte = instruction.get(
                "lastByte"
            )

            if not upload_url:

                raise ValueError(
                    "LinkedIn video upload "
                    "instruction has no upload URL."
                )

            if (
                first_byte is None
                or last_byte is None
            ):

                raise ValueError(
                    "LinkedIn video upload "
                    "instruction has invalid byte range."
                )

            length = (
                last_byte
                - first_byte
                + 1
            )

            video_file.seek(
                first_byte
            )

            chunk = (
                video_file.read(
                    length
                )
            )

            upload_response = httpx.put(
                upload_url,
                content=chunk,
                headers={
                    "Content-Type":
                        "application/octet-stream",
                },
                timeout=180.0,
            )

            if upload_response.status_code >= 400:

                print(
                    ">>> LINKEDIN VIDEO PART ERROR:",
                    upload_response.text,
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
                    f"LinkedIn did not return "
                    f"an ETag for video part "
                    f"{index + 1}."
                )

            uploaded_part_ids.append(
                etag.strip('"')
            )

    finalize_response = httpx.post(
        "https://api.linkedin.com/rest/videos"
        "?action=finalizeUpload",
        headers=headers,
        json={
            "finalizeUploadRequest": {
                "video": video_urn,
                "uploadToken": upload_token,
                "uploadedPartIds":
                    uploaded_part_ids,
            }
        },
        timeout=60.0,
    )

    if finalize_response.status_code >= 400:

        print(
            ">>> LINKEDIN VIDEO FINALIZE ERROR:",
            finalize_response.text,
            flush=True,
        )

    finalize_response.raise_for_status()

    print(
        ">>> LINKEDIN VIDEO UPLOAD FINALIZED:",
        video_urn,
        flush=True,
    )

    return video_urn


# ============================================================
# CREATE LINKEDIN POST
# ============================================================

def _create_linkedin_post(
    *,
    access_token: str,
    author_urn: str,
    content: str,
    post_content: dict | None = None,
) -> str:

    headers = _linkedin_headers(
        access_token
    )

    payload = {
        "author": author_urn,
        "commentary": content,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution":
                "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }

    if post_content is not None:

        payload["content"] = (
            post_content
        )

    print(
        ">>> LINKEDIN POST PAYLOAD:",
        flush=True,
    )

    print(
        json.dumps(
            payload,
            indent=2,
        ),
        flush=True,
    )

    response = httpx.post(
        LINKEDIN_POSTS_URL,
        json=payload,
        headers=headers,
        timeout=120.0,
    )

    if response.status_code >= 400:

        print(
            ">>> LINKEDIN POST API ERROR:",
            flush=True,
        )

        print(
            response.text,
            flush=True,
        )

    response.raise_for_status()

    platform_post_id = (
        response.headers.get(
            "x-restli-id"
        )
        or response.headers.get(
            "X-RestLi-Id"
        )
    )

    if not platform_post_id:

        try:

            response_data = (
                response.json()
            )

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

    print(
        ">>> LINKEDIN POST PUBLISHED:",
        platform_post_id,
        flush=True,
    )

    return platform_post_id


# ============================================================
# LINKEDIN PUBLISH
# ============================================================

def publish_to_linkedin_sync(
    *,
    access_token: str,
    post,
    social_account,
):

    print(
        ">>> LINKEDIN PUBLISH STARTED",
        flush=True,
    )

    print(
        f">>> POST ID: {post.id}",
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

    content = (
        post.content or ""
    )

    media_type_value = (
        post.media_type.value
        if hasattr(
            post.media_type,
            "value",
        )
        else str(
            post.media_type
        ).lower()
    )

    # ========================================================
    # TEXT
    # ========================================================

    if media_type_value == "text":

        print(
            ">>> LINKEDIN POST TYPE: TEXT",
            flush=True,
        )

        return _create_linkedin_post(
            access_token=access_token,
            author_urn=author_urn,
            content=content,
        )

    # ========================================================
    # IMAGE
    # ========================================================

    if media_type_value == "image":

        if not post.media_url:

            raise ValueError(
                "LinkedIn image media URL is missing."
            )

        temporary_path = None

        try:

            print(
                ">>> LINKEDIN POST TYPE: IMAGE",
                flush=True,
            )

            temporary_path = (
                _download_linkedin_media(
                    post.media_url,
                    suffix=".jpg",
                )
            )

            image_urn = (
                _linkedin_upload_image(
                    access_token=access_token,
                    author_urn=author_urn,
                    media_path=temporary_path,
                )
            )

            return _create_linkedin_post(
                access_token=access_token,
                author_urn=author_urn,
                content=content,
                post_content={
                    "media": {
                        "id": image_urn,
                    }
                },
            )

        finally:

            if temporary_path:

                try:
                    os.remove(
                        temporary_path
                    )
                except OSError:
                    pass

    # ========================================================
    # VIDEO
    # ========================================================

    if media_type_value == "video":

        if not post.media_url:

            raise ValueError(
                "LinkedIn video media URL is missing."
            )

        temporary_path = None

        try:

            print(
                ">>> LINKEDIN POST TYPE: VIDEO",
                flush=True,
            )

            temporary_path = (
                _download_linkedin_media(
                    post.media_url,
                    suffix=".mp4",
                )
            )

            video_urn = (
                _linkedin_upload_video(
                    access_token=access_token,
                    author_urn=author_urn,
                    media_path=temporary_path,
                )
            )

            return _create_linkedin_post(
                access_token=access_token,
                author_urn=author_urn,
                content=content,
                post_content={
                    "media": {
                        "id": video_urn,
                        "title": (
                            content[:100]
                            if content
                            else "LinkedIn Video"
                        ),
                    }
                },
            )

        finally:

            if temporary_path:

                try:
                    os.remove(
                        temporary_path
                    )
                except OSError:
                    pass

    # ========================================================
    # CAROUSEL / MULTI-IMAGE
    # ========================================================

    if media_type_value == "carousel":

        print(
            ">>> LINKEDIN POST TYPE: MULTIIMAGE",
            flush=True,
        )

        # ----------------------------------------------------
        # Prefer the dedicated media_urls field.
        # ----------------------------------------------------

        media_urls = getattr(
            post,
            "media_urls",
            None,
        )

        # ----------------------------------------------------
        # Backward compatibility:
        # current frontend stores the JSON array
        # inside media_url.
        # ----------------------------------------------------

        if not media_urls:

            media_urls = (
                post.media_url
                if post.media_url
                else None
            )

        media_urls = _parse_carousel_urls(
            media_urls
        )

        if len(media_urls) < 2:

            raise ValueError(
                "LinkedIn MultiImage requires "
                "at least 2 images."
            )

        if len(media_urls) > 10:

            raise ValueError(
                "LinkedIn MultiImage supports "
                "a maximum of 10 images in this application."
            )

        image_urns = (
            _linkedin_upload_carousel_images(
                access_token=access_token,
                author_urn=author_urn,
                media_urls=media_urls,
            )
        )

        images = []

        for index, image_urn in enumerate(
            image_urns,
            start=1,
        ):

            images.append(
                {
                    "id": image_urn,
                    "altText": (
                        f"Carousel image {index}"
                    ),
                }
            )

        print(
            ">>> LINKEDIN MULTIIMAGE URNS:",
            image_urns,
            flush=True,
        )

        return _create_linkedin_post(
            access_token=access_token,
            author_urn=author_urn,
            content=content,
            post_content={
                "multiImage": {
                    "images": images,
                }
            },
        )

    # ========================================================
    # UNSUPPORTED
    # ========================================================

    raise ValueError(
        "Unsupported LinkedIn media type: "
        f"{media_type_value}"
    )


# ============================================================
# CELERY TASK
# ============================================================

@celery_app.task(
    bind=True,
)
def publish_to_linkedin(
    self,
    schedule_id: int,
):

    db = SessionLocal()

    schedule = None

    try:

        print(
            "================================================",
            flush=True,
        )

        print(
            ">>> CELERY LINKEDIN TASK STARTED",
            flush=True,
        )

        print(
            f">>> SCHEDULE ID: {schedule_id}",
            flush=True,
        )

        schedule = (
            db.query(Schedule)
            .filter(
                Schedule.id == schedule_id
            )
            .first()
        )

        if not schedule:

            print(
                ">>> SCHEDULE NOT FOUND",
                flush=True,
            )

            return (
                "Task cancelled or not found"
            )

        if (
            schedule.status
            == ScheduleStatus.CANCELLED
        ):

            print(
                ">>> SCHEDULE IS CANCELLED",
                flush=True,
            )

            return (
                "Task cancelled or not found"
            )

        post = (
            db.query(Post)
            .filter(
                Post.id == schedule.post_id
            )
            .first()
        )

        account = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.id
                == schedule.social_account_id
            )
            .first()
        )

        if not post or not account:

            schedule.status = (
                ScheduleStatus.FAILED
            )

            db.commit()

            return (
                "Post or Account not found"
            )

        schedule.status = (
            ScheduleStatus.PUBLISHING
        )

        db.commit()

        print(
            f">>> POST ID: {post.id}",
            flush=True,
        )

        print(
            f">>> MEDIA TYPE: "
            f"{post.media_type}",
            flush=True,
        )

        print(
            f">>> MEDIA URL: "
            f"{post.media_url}",
            flush=True,
        )

        print(
            f">>> MEDIA URLS: "
            f"{getattr(post, 'media_urls', None)}",
            flush=True,
        )

        linkedin_post_id = (
            publish_to_linkedin_sync(
                access_token=(
                    account.access_token
                ),
                post=post,
                social_account=account,
            )
        )

        schedule.status = (
            ScheduleStatus.PUBLISHED
        )

        schedule.executed_time = (
            datetime.now(
                timezone.utc
            )
        )

        post.status = (
            PostStatus.PUBLISHED
        )

        db.commit()

        print(
            ">>> LINKEDIN CELERY TASK SUCCESS",
            flush=True,
        )

        print(
            f">>> LINKEDIN POST ID: "
            f"{linkedin_post_id}",
            flush=True,
        )

        return (
            "Successfully published to LinkedIn: "
            f"{linkedin_post_id}"
        )

    except Exception as exc:

        print(
            ">>> LINKEDIN CELERY TASK FAILED",
            flush=True,
        )

        print(
            f">>> ERROR: {exc}",
            flush=True,
        )

        if schedule:

            schedule.status = (
                ScheduleStatus.FAILED
            )

            db.commit()

        raise

    finally:

        db.close()