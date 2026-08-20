import asyncio
import json
import os
import re
import tempfile
import time
from datetime import datetime, timezone, timedelta
from urllib.parse import quote

import httpx
from celery_app import celery_app

from api.roles.notification import NotificationType
from api.services.notification import (
    create_post_activity_notifications,
)

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


# ============================================================
# LINKEDIN CONFIGURATION
# ============================================================

LINKEDIN_VERSION = "202607"
LINKEDIN_API_BASE = "https://api.linkedin.com/rest"


# ============================================================
# MEDIA HELPERS
# ============================================================

def _normalize_media_type(media_type):
    if media_type is None:
        return None

    if hasattr(media_type, "value"):
        media_type = media_type.value

    return str(media_type).lower().strip()


def _clean_media_url(value):
    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    value = value.strip("\"'")

    url_match = re.search(
        r"https?://[^\s\]\)\"'<>]+",
        value,
        re.IGNORECASE,
    )

    if url_match:
        cleaned = url_match.group(0).strip()

        while cleaned.endswith(
            ("]", ")", "\"", "'")
        ):
            cleaned = cleaned[:-1].rstrip()

        return cleaned

    if value.startswith("<") and value.endswith(">"):
        value = value[1:-1].strip()

    return value


def _normalize_media_urls(media_url):
    if media_url is None:
        return []

    if isinstance(media_url, (list, tuple)):
        result = []

        for item in media_url:
            if isinstance(item, (list, tuple)):
                result.extend(
                    _normalize_media_urls(item)
                )
                continue

            cleaned = _clean_media_url(item)

            if cleaned:
                result.append(cleaned)

        return result

    if isinstance(media_url, str):
        value = media_url.strip()

        if not value:
            return []

        parsed = None

        try:
            parsed = json.loads(value)
        except (json.JSONDecodeError, TypeError):
            parsed = None

        if isinstance(parsed, list):
            result = []

            for item in parsed:
                cleaned = _clean_media_url(item)

                if cleaned:
                    result.append(cleaned)

            return result

        if isinstance(parsed, str):
            cleaned = _clean_media_url(parsed)

            return [cleaned] if cleaned else []

        if value.startswith("[") and value.endswith("]"):
            try:
                parsed = json.loads(
                    value.replace("'", '"')
                )

                if isinstance(parsed, list):
                    result = []

                    for item in parsed:
                        cleaned = _clean_media_url(item)

                        if cleaned:
                            result.append(cleaned)

                    return result

            except Exception:
                pass

        cleaned = _clean_media_url(value)

        return [cleaned] if cleaned else []

    cleaned = _clean_media_url(media_url)

    return [cleaned] if cleaned else []


def _get_first_media_url(media_url):
    urls = _normalize_media_urls(media_url)

    if not urls:
        return None

    return urls[0]


def _is_remote_url(value):
    if not value:
        return False

    value = _clean_media_url(value)

    if not value:
        return False

    return (
        value.startswith("http://")
        or value.startswith("https://")
    )


def _download_remote_media(media_url, prefix):
    media_url = _clean_media_url(media_url)

    if not media_url:
        raise ValueError(
            "Remote media URL is empty."
        )

    extension = ".mp4"

    lowered_url = media_url.lower()

    if ".jpg" in lowered_url or ".jpeg" in lowered_url:
        extension = ".jpg"
    elif ".png" in lowered_url:
        extension = ".png"
    elif ".gif" in lowered_url:
        extension = ".gif"
    elif ".webp" in lowered_url:
        extension = ".webp"
    elif ".webm" in lowered_url:
        extension = ".webm"
    elif ".mov" in lowered_url:
        extension = ".mov"
    elif ".mkv" in lowered_url:
        extension = ".mkv"

    file_descriptor, local_path = tempfile.mkstemp(
        prefix=prefix,
        suffix=extension,
    )

    os.close(file_descriptor)

    print(
        f">>> DOWNLOADING REMOTE MEDIA: {media_url}",
        flush=True,
    )

    try:
        with httpx.stream(
            "GET",
            media_url,
            timeout=180.0,
            follow_redirects=True,
        ) as response:

            print(
                f">>> REMOTE MEDIA DOWNLOAD STATUS: "
                f"{response.status_code}",
                flush=True,
            )

            response.raise_for_status()

            total_size = 0

            with open(
                local_path,
                "wb",
            ) as output_file:

                for chunk in response.iter_bytes(
                    chunk_size=1024 * 1024
                ):
                    if chunk:
                        output_file.write(chunk)
                        total_size += len(chunk)

        print(
            f">>> REMOTE MEDIA DOWNLOADED SUCCESSFULLY: "
            f"{total_size} bytes",
            flush=True,
        )

        return local_path

    except Exception:
        try:
            os.remove(local_path)
        except OSError:
            pass

        raise


# ============================================================
# LINKEDIN HELPERS
# ============================================================

def _linkedin_headers(
    access_token,
    include_json=True,
):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Linkedin-Version": LINKEDIN_VERSION,
        "X-Restli-Protocol-Version": "2.0.0",
    }

    if include_json:
        headers["Content-Type"] = "application/json"

    return headers


def _linkedin_author_urn(account_id):
    account_id = str(account_id).strip()

    if account_id.startswith("urn:li:"):
        return account_id

    if account_id.startswith("person:"):
        return f"urn:li:{account_id}"

    if account_id.startswith("organization:"):
        return f"urn:li:{account_id}"

    if account_id.startswith("company:"):
        return (
            f"urn:li:organization:"
            f"{account_id.split(':', 1)[1]}"
        )

    return f"urn:li:person:{account_id}"


def _linkedin_create_post(
    access_token,
    author_urn,
    commentary,
    media_urn=None,
    media_type=None,
):
    payload = {
        "author": author_urn,
        "commentary": commentary or "",
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }

    normalized_media_type = _normalize_media_type(
        media_type
    )

    if media_urn:
        media_content = {
            "id": media_urn,
        }

        if normalized_media_type == "video":
            media_content["title"] = (
                commentary[:200]
                if commentary
                else "SocialPilot Video"
            )

        elif normalized_media_type == "image":
            media_content["altText"] = (
                commentary
                if commentary
                else "SocialPilot media"
            )

        payload["content"] = {
            "media": media_content,
        }

    print(
        f">>> LINKEDIN CREATE POST: "
        f"author={author_urn}, "
        f"media_type={normalized_media_type}, "
        f"media_urn={media_urn}",
        flush=True,
    )

    print(
        f">>> LINKEDIN CREATE POST PAYLOAD: "
        f"{json.dumps(payload, ensure_ascii=False)}",
        flush=True,
    )

    response = httpx.post(
        f"{LINKEDIN_API_BASE}/posts",
        headers=_linkedin_headers(access_token),
        json=payload,
        timeout=60.0,
    )

    print(
        f">>> LINKEDIN CREATE POST STATUS: "
        f"{response.status_code}",
        flush=True,
    )

    if response.status_code >= 400:
        print(
            f">>> LINKEDIN CREATE POST ERROR: "
            f"{response.text}",
            flush=True,
        )

    response.raise_for_status()

    post_id = response.headers.get(
        "x-restli-id"
    )

    if not post_id:
        try:
            response_json = response.json()
            post_id = response_json.get("id")
        except Exception:
            post_id = None

    if not post_id:
        raise ValueError(
            "LinkedIn post was created but no post ID "
            "was returned."
        )

    print(
        f">>> LINKEDIN POST PUBLISHED SUCCESSFULLY: "
        f"{post_id}",
        flush=True,
    )

    return post_id


def _linkedin_create_multi_image_post(
    access_token,
    author_urn,
    commentary,
    image_urns,
):
    if len(image_urns) < 2:
        raise ValueError(
            "LinkedIn MultiImage post requires at least "
            "2 images."
        )

    if len(image_urns) > 20:
        raise ValueError(
            "LinkedIn MultiImage post supports a maximum "
            "of 20 images."
        )

    images = []

    for image_urn in image_urns:
        images.append(
            {
                "id": image_urn,
                "altText": (
                    commentary
                    if commentary
                    else "SocialPilot media"
                ),
            }
        )

    payload = {
        "author": author_urn,
        "commentary": commentary or "",
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
        "content": {
            "multiImage": {
                "images": images,
            }
        },
    }

    print(
        f">>> LINKEDIN MULTIIMAGE POST STARTED: "
        f"{len(image_urns)} images",
        flush=True,
    )

    print(
        f">>> LINKEDIN MULTIIMAGE PAYLOAD: "
        f"{json.dumps(payload, ensure_ascii=False)}",
        flush=True,
    )

    response = httpx.post(
        f"{LINKEDIN_API_BASE}/posts",
        headers=_linkedin_headers(access_token),
        json=payload,
        timeout=60.0,
    )

    print(
        f">>> LINKEDIN MULTIIMAGE POST STATUS: "
        f"{response.status_code}",
        flush=True,
    )

    if response.status_code >= 400:
        print(
            f">>> LINKEDIN MULTIIMAGE POST ERROR: "
            f"{response.text}",
            flush=True,
        )

    response.raise_for_status()

    post_id = response.headers.get(
        "x-restli-id"
    )

    if not post_id:
        try:
            response_json = response.json()
            post_id = response_json.get("id")
        except Exception:
            post_id = None

    if not post_id:
        raise ValueError(
            "LinkedIn MultiImage post was created but "
            "no post ID was returned."
        )

    print(
        f">>> LINKEDIN MULTIIMAGE POST PUBLISHED "
        f"SUCCESSFULLY: {post_id}",
        flush=True,
    )

    return post_id


def _linkedin_upload_image(
    access_token,
    author_urn,
    local_path,
):
    print(
        f">>> LINKEDIN IMAGE UPLOAD STARTED: "
        f"{local_path}",
        flush=True,
    )

    initialize_payload = {
        "initializeUploadRequest": {
            "owner": author_urn,
        }
    }

    response = httpx.post(
        f"{LINKEDIN_API_BASE}/images?action=initializeUpload",
        headers=_linkedin_headers(access_token),
        json=initialize_payload,
        timeout=60.0,
    )

    print(
        f">>> LINKEDIN IMAGE INITIALIZE STATUS: "
        f"{response.status_code}",
        flush=True,
    )

    if response.status_code >= 400:
        print(
            f">>> LINKEDIN IMAGE INITIALIZE ERROR: "
            f"{response.text}",
            flush=True,
        )

    response.raise_for_status()

    data = response.json()

    value = data.get("value", {})

    upload_url = value.get("uploadUrl")
    image_urn = value.get("image")

    if not upload_url or not image_urn:
        raise ValueError(
            "LinkedIn image initialization did not return "
            "uploadUrl and image URN."
        )

    print(
        f">>> LINKEDIN IMAGE URN: {image_urn}",
        flush=True,
    )

    with open(
        local_path,
        "rb",
    ) as image_file:
        image_data = image_file.read()

    extension = os.path.splitext(
        local_path
    )[1].lower()

    content_type = "image/jpeg"

    if extension == ".png":
        content_type = "image/png"
    elif extension == ".gif":
        content_type = "image/gif"
    elif extension == ".webp":
        content_type = "image/webp"

    upload_response = httpx.put(
        upload_url,
        headers={
            "Content-Type": content_type,
        },
        content=image_data,
        timeout=120.0,
    )

    print(
        f">>> LINKEDIN IMAGE UPLOAD STATUS: "
        f"{upload_response.status_code}",
        flush=True,
    )

    upload_response.raise_for_status()

    for attempt in range(1, 13):

        try:
            status_response = httpx.get(
                f"{LINKEDIN_API_BASE}/images/"
                f"{quote(image_urn, safe='')}",
                headers=_linkedin_headers(
                    access_token,
                    include_json=False,
                ),
                timeout=30.0,
            )

            if status_response.status_code == 200:
                status_json = status_response.json()

                image_status = status_json.get(
                    "status"
                )

                print(
                    f">>> LINKEDIN IMAGE STATUS "
                    f"attempt {attempt}/12: "
                    f"{image_status}",
                    flush=True,
                )

                if image_status == "AVAILABLE":
                    return image_urn

                if image_status == "PROCESSING_FAILED":
                    raise ValueError(
                        "LinkedIn image processing failed."
                    )

            else:
                print(
                    f">>> LINKEDIN IMAGE STATUS CHECK: "
                    f"{status_response.status_code}",
                    flush=True,
                )

        except httpx.HTTPError as exc:
            print(
                f">>> LINKEDIN IMAGE STATUS CHECK ERROR: "
                f"{exc}",
                flush=True,
            )

        if attempt < 12:
            time.sleep(2)

    raise TimeoutError(
        "LinkedIn image processing did not finish "
        "within the allowed time."
    )


def _linkedin_upload_video(
    access_token,
    author_urn,
    local_path,
):
    file_size = os.path.getsize(local_path)

    print(
        f">>> LINKEDIN VIDEO UPLOAD STARTED: "
        f"path={local_path}, size={file_size}",
        flush=True,
    )

    initialize_payload = {
        "initializeUploadRequest": {
            "owner": author_urn,
            "fileSizeBytes": file_size,
            "uploadCaptions": False,
            "uploadThumbnail": False,
        }
    }

    response = httpx.post(
        f"{LINKEDIN_API_BASE}/videos?action=initializeUpload",
        headers=_linkedin_headers(access_token),
        json=initialize_payload,
        timeout=60.0,
    )

    print(
        f">>> LINKEDIN VIDEO INITIALIZE STATUS: "
        f"{response.status_code}",
        flush=True,
    )

    if response.status_code >= 400:
        print(
            f">>> LINKEDIN VIDEO INITIALIZE ERROR: "
            f"{response.text}",
            flush=True,
        )

    response.raise_for_status()

    data = response.json()

    value = data.get("value", {})

    video_urn = value.get("video")

    upload_instructions = value.get(
        "uploadInstructions",
        [],
    )

    upload_token = value.get(
        "uploadToken",
        "",
    )

    if not video_urn:
        raise ValueError(
            "LinkedIn video initialization did not return "
            "a video URN."
        )

    if not upload_instructions:
        raise ValueError(
            "LinkedIn video initialization did not return "
            "upload instructions."
        )

    print(
        f">>> LINKEDIN VIDEO URN: {video_urn}",
        flush=True,
    )

    uploaded_part_ids = []

    with open(
        local_path,
        "rb",
    ) as video_file:

        for index, instruction in enumerate(
            upload_instructions,
            start=1,
        ):
            first_byte = instruction.get(
                "firstByte"
            )

            last_byte = instruction.get(
                "lastByte"
            )

            upload_url = instruction.get(
                "uploadUrl"
            )

            if not upload_url:
                raise ValueError(
                    "LinkedIn video upload instruction "
                    "does not contain uploadUrl."
                )

            if first_byte is None:
                first_byte = 0

            if last_byte is None:
                last_byte = file_size - 1

            chunk_size = (
                int(last_byte)
                - int(first_byte)
                + 1
            )

            video_file.seek(
                int(first_byte)
            )

            chunk = video_file.read(
                chunk_size
            )

            if not chunk:
                raise ValueError(
                    "LinkedIn video upload returned "
                    "an empty chunk."
                )

            print(
                f">>> LINKEDIN VIDEO UPLOADING PART "
                f"{index}/{len(upload_instructions)}: "
                f"bytes {first_byte}-{last_byte}",
                flush=True,
            )

            upload_response = httpx.put(
                upload_url,
                headers={
                    "Content-Type":
                        "application/octet-stream",
                },
                content=chunk,
                timeout=180.0,
            )

            print(
                f">>> LINKEDIN VIDEO PART "
                f"{index} STATUS: "
                f"{upload_response.status_code}",
                flush=True,
            )

            upload_response.raise_for_status()

            etag = upload_response.headers.get(
                "etag"
            )

            if not etag:
                raise ValueError(
                    f"LinkedIn video part {index} upload "
                    f"did not return an ETag."
                )

            etag = etag.strip('"')

            uploaded_part_ids.append(etag)

    finalize_payload = {
        "finalizeUploadRequest": {
            "video": video_urn,
            "uploadToken": upload_token,
            "uploadedPartIds": uploaded_part_ids,
        }
    }

    finalize_response = httpx.post(
        f"{LINKEDIN_API_BASE}/videos"
        f"?action=finalizeUpload",
        headers=_linkedin_headers(access_token),
        json=finalize_payload,
        timeout=60.0,
    )

    print(
        f">>> LINKEDIN VIDEO FINALIZE STATUS: "
        f"{finalize_response.status_code}",
        flush=True,
    )

    if finalize_response.status_code >= 400:
        print(
            f">>> LINKEDIN VIDEO FINALIZE ERROR: "
            f"{finalize_response.text}",
            flush=True,
        )

    finalize_response.raise_for_status()

    video_id_encoded = quote(
        video_urn,
        safe="",
    )

    for attempt in range(1, 61):

        status_response = httpx.get(
            f"{LINKEDIN_API_BASE}/videos/"
            f"{video_id_encoded}",
            headers=_linkedin_headers(
                access_token,
                include_json=False,
            ),
            timeout=30.0,
        )

        print(
            f">>> LINKEDIN VIDEO STATUS "
            f"attempt {attempt}/60: "
            f"HTTP {status_response.status_code}",
            flush=True,
        )

        if status_response.status_code >= 400:
            print(
                f">>> LINKEDIN VIDEO STATUS ERROR: "
                f"{status_response.text}",
                flush=True,
            )

            status_response.raise_for_status()

        status_json = status_response.json()

        video_status = status_json.get(
            "status"
        )

        print(
            f">>> LINKEDIN VIDEO PROCESSING STATUS: "
            f"{video_status}",
            flush=True,
        )

        if video_status == "AVAILABLE":
            print(
                ">>> LINKEDIN VIDEO IS READY",
                flush=True,
            )

            return video_urn

        if video_status == "PROCESSING_FAILED":
            reason = status_json.get(
                "processingFailureReason",
                "Unknown processing failure",
            )

            raise ValueError(
                f"LinkedIn video processing failed: "
                f"{reason}"
            )

        time.sleep(5)

    raise TimeoutError(
        "LinkedIn video processing did not finish "
        "within the allowed time."
    )


def _publish_to_linkedin(
    social_account,
    content,
    media_url,
    media_type,
):
    access_token = social_account.access_token

    if not access_token:
        raise ValueError(
            "LinkedIn access token is missing. "
            "Please reconnect the LinkedIn account."
        )

    if not social_account.account_id:
        raise ValueError(
            "LinkedIn account ID is missing."
        )

    author_urn = _linkedin_author_urn(
        social_account.account_id
    )

    normalized_media_type = _normalize_media_type(
        media_type
    )

    media_urls = _normalize_media_urls(
        media_url
    )

    print(
        ">>> LINKEDIN PUBLISH DEBUG",
        flush=True,
    )

    print(
        f">>> LINKEDIN AUTHOR: {author_urn}",
        flush=True,
    )

    print(
        f">>> LINKEDIN MEDIA TYPE: "
        f"{normalized_media_type}",
        flush=True,
    )

    print(
        f">>> LINKEDIN NORMALIZED MEDIA COUNT: "
        f"{len(media_urls)}",
        flush=True,
    )

    for index, url in enumerate(
        media_urls,
        start=1,
    ):
        print(
            f">>> LINKEDIN CLEAN MEDIA {index}: {url}",
            flush=True,
        )

        print(
            f">>> LINKEDIN MEDIA {index} IS REMOTE: "
            f"{_is_remote_url(url)}",
            flush=True,
        )

    if (
        not media_urls
        or normalized_media_type in (
            None,
            "text",
        )
    ):
        return _linkedin_create_post(
            access_token=access_token,
            author_urn=author_urn,
            commentary=content,
        )

    if normalized_media_type == "carousel":

        if len(media_urls) < 2:
            raise ValueError(
                "LinkedIn carousel requires at least "
                "2 images."
            )

        if len(media_urls) > 20:
            raise ValueError(
                "LinkedIn carousel supports a maximum "
                "of 20 images."
            )

        local_paths = []
        image_urns = []

        try:
            print(
                f">>> LINKEDIN MULTIIMAGE UPLOAD STARTED: "
                f"{len(media_urls)} images",
                flush=True,
            )

            for index, current_media_url in enumerate(
                media_urls,
                start=1,
            ):
                print(
                    f">>> LINKEDIN MULTIIMAGE IMAGE "
                    f"{index}/{len(media_urls)}",
                    flush=True,
                )

                if _is_remote_url(
                    current_media_url
                ):
                    local_path = (
                        _download_remote_media(
                            current_media_url,
                            prefix=(
                                "socialpilot_linkedin_"
                            ),
                        )
                    )

                    local_paths.append(
                        local_path
                    )

                else:
                    local_path = current_media_url

                    if not os.path.exists(
                        local_path
                    ):
                        raise FileNotFoundError(
                            f"LinkedIn media file does "
                            f"not exist: {local_path}"
                        )

                print(
                    f">>> LINKEDIN LOCAL IMAGE: "
                    f"{local_path}",
                    flush=True,
                )

                image_urn = _linkedin_upload_image(
                    access_token=access_token,
                    author_urn=author_urn,
                    local_path=local_path,
                )

                image_urns.append(
                    image_urn
                )

                print(
                    f">>> LINKEDIN IMAGE "
                    f"{index} UPLOADED: "
                    f"{image_urn}",
                    flush=True,
                )

            return _linkedin_create_multi_image_post(
                access_token=access_token,
                author_urn=author_urn,
                commentary=content,
                image_urns=image_urns,
            )

        finally:
            for local_path in local_paths:

                if os.path.exists(local_path):
                    try:
                        os.remove(local_path)

                        print(
                            f">>> LINKEDIN TEMPORARY "
                            f"IMAGE DELETED: "
                            f"{local_path}",
                            flush=True,
                        )

                    except OSError as exc:
                        print(
                            f">>> LINKEDIN TEMPORARY "
                            f"IMAGE DELETE FAILED: "
                            f"{exc}",
                            flush=True,
                        )

    if len(media_urls) > 1:
        raise ValueError(
            f"LinkedIn media type "
            f"'{normalized_media_type}' received "
            f"{len(media_urls)} media files. "
            f"Only carousel supports multiple images."
        )

    single_media_url = media_urls[0]

    local_path = None

    try:
        if _is_remote_url(
            single_media_url
        ):
            local_path = _download_remote_media(
                single_media_url,
                prefix="socialpilot_linkedin_",
            )
        else:
            local_path = single_media_url

        if not os.path.exists(local_path):
            raise FileNotFoundError(
                f"LinkedIn media file does not exist: "
                f"{local_path}"
            )

        if normalized_media_type == "image":

            media_urn = _linkedin_upload_image(
                access_token=access_token,
                author_urn=author_urn,
                local_path=local_path,
            )

            return _linkedin_create_post(
                access_token=access_token,
                author_urn=author_urn,
                commentary=content,
                media_urn=media_urn,
                media_type="image",
            )

        if normalized_media_type in (
            "video",
            "reel",
        ):

            media_urn = _linkedin_upload_video(
                access_token=access_token,
                author_urn=author_urn,
                local_path=local_path,
            )

            return _linkedin_create_post(
                access_token=access_token,
                author_urn=author_urn,
                commentary=content,
                media_urn=media_urn,
                media_type="video",
            )

        raise ValueError(
            f"LinkedIn does not currently support "
            f"media type '{normalized_media_type}' "
            f"through this publisher."
        )

    finally:
        if (
            local_path
            and _is_remote_url(single_media_url)
            and os.path.exists(local_path)
        ):
            try:
                os.remove(local_path)

                print(
                    f">>> LINKEDIN TEMPORARY "
                    f"MEDIA DELETED: {local_path}",
                    flush=True,
                )

            except OSError as exc:
                print(
                    f">>> LINKEDIN TEMPORARY "
                    f"MEDIA DELETE FAILED: {exc}",
                    flush=True,
                )


# ============================================================
# NOTIFICATION - PUBLISH RESULT
# ============================================================

def _create_publish_result_notification(
    post,
    successful_platforms,
    failed_platforms,
):
    """
    Create the final publishing-result notification.

    Notification recipients are resolved by
    create_post_activity_notifications().

    For a Business User's post:
        Business User
        +
        Assigned Marketing Team

    both receive the SAME notification.

    The notification content is identical for both users,
    but each user gets a separate Notification database row.
    """

    try:
        successful_platforms = list(
            dict.fromkeys(
                successful_platforms
            )
        )

        failed_platforms = list(
            dict.fromkeys(
                failed_platforms
            )
        )

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> CREATING PUBLISH RESULT NOTIFICATIONS",
            flush=True,
        )

        print(
            f">>> POST ID: {post.id}",
            flush=True,
        )

        print(
            f">>> POST OWNER ID: {post.user_id}",
            flush=True,
        )

        print(
            f">>> SUCCESSFUL PLATFORMS: "
            f"{successful_platforms}",
            flush=True,
        )

        print(
            f">>> FAILED PLATFORMS: "
            f"{failed_platforms}",
            flush=True,
        )

        # =====================================================
        # ALL PLATFORMS SUCCESSFUL
        # =====================================================

        if successful_platforms and not failed_platforms:

            platform_text = ", ".join(
                successful_platforms
            )

            title = "Post Published"

            description = (
                f"Your post was published successfully "
                f"on {platform_text}."
            )

            notification_type = (
                NotificationType.SUCCESS
            )

        # =====================================================
        # ALL PLATFORMS FAILED
        # =====================================================

        elif failed_platforms and not successful_platforms:

            failed_text = ", ".join(
                failed_platforms
            )

            title = "Post Publishing Failed"

            description = (
                f"Your post failed to publish on "
                f"{failed_text}."
            )

            notification_type = (
                NotificationType.ERROR
            )

        # =====================================================
        # PARTIALLY PUBLISHED
        # =====================================================

        elif successful_platforms and failed_platforms:

            success_text = ", ".join(
                successful_platforms
            )

            failed_text = ", ".join(
                failed_platforms
            )

            title = "Post Partially Published"

            description = (
                f"Published on {success_text}; "
                f"failed on {failed_text}."
            )

            notification_type = (
                NotificationType.WARNING
            )

        # =====================================================
        # NOTHING PUBLISHED
        # =====================================================

        else:

            title = "Post Publishing Failed"

            description = (
                "Your post failed to publish on all "
                "selected platforms."
            )

            notification_type = (
                NotificationType.ERROR
            )

        description = description[:120]

        # =====================================================
        # IMPORTANT
        # =====================================================
        #
        # DO NOT use create_notification() here.
        #
        # create_post_activity_notifications() automatically
        # finds:
        #
        #     Business User
        #          +
        #     Assigned Marketing Team
        #
        # and creates the same notification for both.
        #
        # =====================================================

        notifications = (
            create_post_activity_notifications(
                post_owner_id=post.user_id,
                title=title[:40],
                description=description,
                notification_type=notification_type,
                related_post_id=post.id,
                related_campaign_id=post.campaign_id,
            )
        )

        print(
            f">>> PUBLISH RESULT NOTIFICATIONS CREATED: "
            f"{len(notifications)}",
            flush=True,
        )

        for notification in notifications:

            print(
                f">>> NOTIFICATION ID: "
                f"{notification.id}",
                flush=True,
            )

            print(
                f">>> NOTIFICATION USER ID: "
                f"{notification.user_id}",
                flush=True,
            )

        print(
            "=================================================",
            flush=True,
        )

        return notifications

    except Exception as exc:

        print(
            "=================================================",
            flush=True,
        )

        print(
            ">>> PUBLISH RESULT NOTIFICATIONS FAILED",
            flush=True,
        )

        print(
            f">>> POST ID: {post.id}",
            flush=True,
        )

        print(
            f">>> ERROR: {exc}",
            flush=True,
        )

        print(
            ">>> PUBLISHING RESULT WILL NOT BE RETRIED "
            "BECAUSE OF NOTIFICATION FAILURE",
            flush=True,
        )

        print(
            "=================================================",
            flush=True,
        )

        return []


# ============================================================
# SCHEDULED POST CHECKER
# ============================================================

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

        if posts:

            print(
                f">>> {len(posts)} POST(S) "
                f"SENT FOR PUBLISHING",
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


# ============================================================
# MODULE 7 - POST PUBLISHED NOTIFICATION
# ============================================================

def _create_publish_notification(
    post,
):
    """
    Create a Post Published notification.

    Notification failures must never break the
    already-successful publishing operation.

    Publishing has already been committed to the database
    before this function is called.
    """

    try:

        create_post_activity_notifications(
            post=post,
            title="Post Published",
            description=(
                f"Post {post.id} "
                "has been successfully published."
            ),
            notification_type=(
                NotificationType.SUCCESS
            ),
            related_post_id=post.id,
            related_campaign_id=post.campaign_id,
        )

        print(
            f">>> PUBLISHED NOTIFICATION CREATED: "
            f"post_id={post.id}",
            flush=True,
        )

    except Exception as notification_error:

        print(
            ">>> PUBLISHED NOTIFICATION FAILED",
            flush=True,
        )

        print(
            f">>> POST ID: {post.id}",
            flush=True,
        )

        print(
            f">>> NOTIFICATION ERROR: "
            f"{notification_error}",
            flush=True,
        )

        # IMPORTANT:
        #
        # Publishing has already succeeded.
        # Notification failure must NOT cause Celery
        # to retry the publishing task.


# ============================================================
# MAIN PUBLISH TASK
# ============================================================

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

            print(
                f">>> POST NOT FOUND: "
                f"post_id={post_id}",
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
                "message": (
                    "Post is not ready for publishing"
                ),
            }

        if not post.post_social_accounts:

            post.status = Status.FAILED

            post.published_time = (
                datetime.now(timezone.utc)
            )

            db.commit()

            print(
                f">>> POST FAILED: "
                f"post_id={post_id}, "
                f"reason=no social accounts linked",
                flush=True,
            )

            _create_publish_result_notification(
                post=post,
                successful_platforms=[],
                failed_platforms=[
                    "selected platforms"
                ],
            )

            return {
                "post_id": post_id,
                "status": "failed",
                "error": (
                    "No social accounts linked"
                ),
            }

        any_failed = False
        any_published = False

        successful_platforms = []
        failed_platforms = []
        failure_reasons = {}

        # ====================================================
        # PUBLISH TO EACH CONNECTED PLATFORM
        # ====================================================

        for psa in post.post_social_accounts:

            social_account = (
                psa.social_account
            )

            # ----------------------------------------------
            # Already published platform
            # ----------------------------------------------

            if psa.publish_status == (
                PublishStatus.PUBLISHED
            ):

                any_published = True

                existing_platform = (
                    social_account.platform.value
                    if hasattr(
                        social_account.platform,
                        "value",
                    )
                    else social_account.platform
                )

                existing_platform = str(
                    existing_platform
                ).lower().strip()

                successful_platforms.append(
                    existing_platform
                )

                print(
                    f">>> PLATFORM ALREADY PUBLISHED: "
                    f"post_id={post.id}, "
                    f"platform={existing_platform}",
                    flush=True,
                )

                continue

            platform = (
                social_account.platform.value
                if hasattr(
                    social_account.platform,
                    "value",
                )
                else social_account.platform
            )

            platform = str(
                platform
            ).lower().strip()

            try:

                print(
                    f">>> PUBLISHING POST: "
                    f"post_id={post.id}, "
                    f"platform={platform}",
                    flush=True,
                )

                # ==================================================
                # FACEBOOK
                # ==================================================

                if platform == "facebook":

                    platform_post_id = asyncio.run(
                        publish_to_facebook(
                            access_token=(
                                social_account.access_token
                            ),
                            page_id=(
                                social_account.account_id
                            ),
                            content=post.content,
                            media_url=post.media_url,
                            media_type=post.media_type,
                        )
                    )

                # ==================================================
                # INSTAGRAM
                # ==================================================

                elif platform == "instagram":

                    platform_post_id = asyncio.run(
                        publish_to_instagram(
                            access_token=(
                                social_account.access_token
                            ),
                            ig_user_id=(
                                social_account.account_id
                            ),
                            content=post.content,
                            media_url=post.media_url,
                            media_type=post.media_type,
                        )
                    )

                # ==================================================
                # YOUTUBE
                # ==================================================

                elif platform == "youtube":

                    normalized_media_type = (
                        _normalize_media_type(
                            post.media_type
                        )
                    )

                    if normalized_media_type != "video":

                        raise ValueError(
                            "YouTube publishing currently "
                            "requires media_type='video'."
                        )

                    youtube_media_url = (
                        _get_first_media_url(
                            post.media_url
                        )
                    )

                    if not youtube_media_url:

                        raise ValueError(
                            "YouTube publishing requires "
                            "a video media_url."
                        )

                    if not social_account.refresh_token:

                        raise ValueError(
                            "YouTube refresh token is "
                            "missing. Please reconnect "
                            "the YouTube account."
                        )

                    print(
                        f">>> YOUTUBE PUBLISH STARTED: "
                        f"post_id={post.id}, "
                        f"account_id="
                        f"{social_account.account_id}",
                        flush=True,
                    )

                    # ------------------------------------------
                    # Refresh YouTube access token
                    # ------------------------------------------

                    token_expiry = (
                        social_account.token_expiry
                    )

                    now = datetime.now(
                        timezone.utc
                    )

                    refresh_required = False

                    if token_expiry is None:

                        refresh_required = True

                    elif token_expiry.tzinfo is None:

                        token_expiry = (
                            token_expiry.replace(
                                tzinfo=timezone.utc
                            )
                        )

                        refresh_required = (
                            now >= (
                                token_expiry
                                - timedelta(minutes=5)
                            )
                        )

                    else:

                        refresh_required = (
                            now >= (
                                token_expiry.astimezone(
                                    timezone.utc
                                )
                                - timedelta(minutes=5)
                            )
                        )

                    if refresh_required:

                        print(
                            ">>> REFRESHING YOUTUBE "
                            "ACCESS TOKEN",
                            flush=True,
                        )

                        token_response = httpx.post(
                            "https://oauth2.googleapis.com/token",
                            data={
                                "client_id": (
                                    settings.YOUTUBE_CLIENT_ID
                                ),
                                "client_secret": (
                                    settings.YOUTUBE_CLIENT_SECRET
                                ),
                                "refresh_token": (
                                    social_account.refresh_token
                                ),
                                "grant_type": (
                                    "refresh_token"
                                ),
                            },
                            timeout=30.0,
                        )

                        print(
                            f">>> YOUTUBE TOKEN REFRESH "
                            f"STATUS: "
                            f"{token_response.status_code}",
                            flush=True,
                        )

                        if token_response.status_code >= 400:

                            print(
                                f">>> YOUTUBE TOKEN REFRESH "
                                f"ERROR: "
                                f"{token_response.text}",
                                flush=True,
                            )

                        token_response.raise_for_status()

                        token_json = (
                            token_response.json()
                        )

                        new_access_token = (
                            token_json.get(
                                "access_token"
                            )
                        )

                        expires_in = (
                            token_json.get(
                                "expires_in"
                            )
                        )

                        if not new_access_token:

                            raise ValueError(
                                "YouTube token refresh did "
                                "not return an access token."
                            )

                        social_account.access_token = (
                            new_access_token
                        )

                        if expires_in is not None:

                            social_account.token_expiry = (
                                datetime.now(
                                    timezone.utc
                                )
                                + timedelta(
                                    seconds=int(
                                        expires_in
                                    )
                                )
                            )

                        db.commit()

                        print(
                            ">>> YOUTUBE ACCESS TOKEN "
                            "REFRESHED",
                            flush=True,
                        )

                    # ------------------------------------------
                    # Download remote video
                    # ------------------------------------------

                    youtube_local_path = None

                    try:

                        if _is_remote_url(
                            youtube_media_url
                        ):

                            youtube_local_path = (
                                _download_remote_media(
                                    youtube_media_url,
                                    prefix=(
                                        "socialpilot_youtube_"
                                    ),
                                )
                            )

                        else:

                            youtube_local_path = (
                                youtube_media_url
                            )

                        if not youtube_local_path:

                            raise ValueError(
                                "YouTube media URL is empty."
                            )

                        if not os.path.exists(
                            youtube_local_path
                        ):

                            raise FileNotFoundError(
                                f"YouTube video file does "
                                f"not exist: "
                                f"{youtube_local_path}"
                            )

                        print(
                            f">>> YOUTUBE LOCAL VIDEO PATH: "
                            f"{youtube_local_path}",
                            flush=True,
                        )

                        # --------------------------------------
                        # YouTube upload endpoint
                        # --------------------------------------

                        youtube_url = (
                            "https://www.googleapis.com/"
                            "upload/youtube/v3/videos"
                            "?uploadType=multipart"
                            "&part=snippet,status"
                        )

                        headers = {
                            "Authorization": (
                                "Bearer "
                                f"{social_account.access_token}"
                            )
                        }

                        content = (
                            post.content or ""
                        )

                        title = (
                            content[:50] + "..."
                            if len(content) > 50
                            else content
                        )

                        if not title.strip():

                            title = (
                                "SocialPilot Video"
                            )

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
                            f"post_id={post.id}",
                            flush=True,
                        )

                        with open(
                            youtube_local_path,
                            "rb",
                        ) as video_file:

                            files = {
                                "metadata": (
                                    None,
                                    json.dumps(
                                        metadata
                                    ),
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
                                timeout=300.0,
                            )

                        print(
                            f">>> YOUTUBE API STATUS: "
                            f"{response.status_code}",
                            flush=True,
                        )

                        if response.status_code >= 400:

                            print(
                                f">>> YOUTUBE API ERROR: "
                                f"{response.text}",
                                flush=True,
                            )

                        response.raise_for_status()

                        youtube_data = (
                            response.json()
                        )

                        platform_post_id = (
                            youtube_data.get(
                                "id"
                            )
                        )

                        if not platform_post_id:

                            raise ValueError(
                                "YouTube upload succeeded "
                                "but no video ID was returned."
                            )

                        print(
                            f">>> YOUTUBE PUBLISH SUCCESS: "
                            f"post_id={post.id}, "
                            f"youtube_video_id="
                            f"{platform_post_id}",
                            flush=True,
                        )

                    finally:

                        if (
                            youtube_local_path
                            and _is_remote_url(
                                youtube_media_url
                            )
                            and os.path.exists(
                                youtube_local_path
                            )
                        ):

                            try:

                                os.remove(
                                    youtube_local_path
                                )

                                print(
                                    f">>> YOUTUBE TEMPORARY "
                                    f"MEDIA DELETED: "
                                    f"{youtube_local_path}",
                                    flush=True,
                                )

                            except OSError as exc:

                                print(
                                    f">>> YOUTUBE TEMPORARY "
                                    f"MEDIA DELETE FAILED: "
                                    f"{exc}",
                                    flush=True,
                                )

                # ==================================================
                # LINKEDIN
                # ==================================================

                elif platform == "linkedin":

                    platform_post_id = (
                        _publish_to_linkedin(
                            social_account=(
                                social_account
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

                # ==================================================
                # UNSUPPORTED PLATFORM
                # ==================================================

                else:

                    raise ValueError(
                        f"Unsupported social platform: "
                        f"{platform}"
                    )

                # ==================================================
                # PLATFORM SUCCESS
                # ==================================================

                psa.publish_status = (
                    PublishStatus.PUBLISHED
                )

                psa.platform_post_id = str(
                    platform_post_id
                )

                psa.published_time = (
                    datetime.now(
                        timezone.utc
                    )
                )

                psa.error_message = None

                any_published = True

                successful_platforms.append(
                    platform
                )

                print(
                    f">>> PUBLISH SUCCESS: "
                    f"post_id={post.id}, "
                    f"platform={platform}, "
                    f"platform_post_id="
                    f"{platform_post_id}",
                    flush=True,
                )

                db.commit()

            except Exception as exc:

                # ==================================================
                # PLATFORM FAILURE
                # ==================================================

                any_failed = True

                psa.publish_status = (
                    PublishStatus.FAILED
                )

                psa.error_message = str(
                    exc
                )

                failed_platforms.append(
                    platform
                )

                failure_reasons[platform] = (
                    str(exc)
                )

                print(
                    f">>> PUBLISH FAILED: "
                    f"post_id={post.id}, "
                    f"platform={platform}, "
                    f"error={exc}",
                    flush=True,
                )

                db.commit()

                # IMPORTANT:
                # Continue to the next platform.
                # One platform failure must NOT prevent
                # other selected platforms from publishing.

                continue

        # ========================================================
        # FINAL POST STATUS
        # ========================================================

        if any_published and any_failed:

            # Partial success:
            # At least one platform published successfully.
            post.status = Status.PUBLISHED

        elif any_published:

            # All attempted platforms succeeded.
            post.status = Status.PUBLISHED

        elif any_failed:

            # Nothing succeeded.
            post.status = Status.FAILED

        else:

            # No platform succeeded and nothing was published.
            post.status = Status.FAILED

        post.published_time = (
            datetime.now(
                timezone.utc
            )
        )

        # ========================================================
        # FINAL DATABASE COMMIT
        # ========================================================

        db.commit()

        # ========================================================
        # MODULE 7 - POST PUBLISHED NOTIFICATION
        #
        # IMPORTANT:
        # The database transaction is already committed before
        # notification creation.
        #
        # Therefore notification failure cannot roll back or
        # retry an already-successful Facebook/Instagram post.
        # ========================================================

        if post.status == Status.PUBLISHED:

            _create_publish_notification(
                post
            )

        # ========================================================
        # FINAL LOGGING
        # ========================================================

        print(
            f">>> PUBLISH TASK FINISHED: "
            f"post_id={post.id}, "
            f"final_status={post.status.value}, "
            f"any_failed={any_failed}, "
            f"any_published={any_published}",
            flush=True,
        )

        print(
            f">>> SUCCESSFUL PLATFORMS: "
            f"{successful_platforms}",
            flush=True,
        )

        print(
            f">>> FAILED PLATFORMS: "
            f"{failed_platforms}",
            flush=True,
        )

        if failure_reasons:

            print(
                f">>> FAILURE REASONS: "
                f"{failure_reasons}",
                flush=True,
            )

        # ========================================================
        # EXISTING FINAL PUBLISH RESULT NOTIFICATION
        #
        # This existing functionality is preserved.
        # It also safely catches its own notification errors.
        # ========================================================

        _create_publish_result_notification(
            post=post,
            successful_platforms=(
                successful_platforms
            ),
            failed_platforms=(
                failed_platforms
            ),
        )

        return {
            "post_id": post.id,
            "status": post.status.value,
            "any_failed": any_failed,
            "any_published": any_published,
            "successful_platforms": (
                successful_platforms
            ),
            "failed_platforms": (
                failed_platforms
            ),
            "failure_reasons": (
                failure_reasons
            ),
        }

    except Exception as exc:

        # ========================================================
        # CELERY RETRY
        # ========================================================

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
