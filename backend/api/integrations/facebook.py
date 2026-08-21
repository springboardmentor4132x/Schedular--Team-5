import json
import os
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv

load_dotenv()


# =========================================================
# FACEBOOK CONFIGURATION
# =========================================================

PLATFORM_SCOPES = [
    "pages_show_list",
    "pages_manage_posts",
    "pages_read_engagement",
]

FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")

FACEBOOK_REDIRECT_URI = (
    "http://localhost:8000/social-accounts/facebook/callback"
)

# Use the current Graph API version instead of v19.0.
FACEBOOK_GRAPH_VERSION = "v25.0"

FACEBOOK_OAUTH_URL = (
    f"https://www.facebook.com/{FACEBOOK_GRAPH_VERSION}/dialog/oauth"
)

FACEBOOK_TOKEN_URL = (
    f"https://graph.facebook.com/{FACEBOOK_GRAPH_VERSION}/oauth/access_token"
)

FACEBOOK_GRAPH_URL = (
    f"https://graph.facebook.com/{FACEBOOK_GRAPH_VERSION}"
)


# =========================================================
# DEVELOPMENT MEDIA STORAGE
# =========================================================

UPLOAD_DIR = os.path.abspath("uploads")

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True,
)


# =========================================================
# EXISTING HELPER FUNCTIONS
# =========================================================

def connect(account_name: str):
    return {
        "platform": "facebook",
        "account_name": account_name,
        "account_id": secrets.token_hex(8),
        "access_token": secrets.token_hex(20),
        "refresh_token": secrets.token_hex(20),
        "token_expiry": (
            datetime.now(timezone.utc)
            + timedelta(hours=1)
        ),
        "profile_picture": (
            f"https://placehold.co/150x150?text={account_name}"
        ),
        "permissions": PLATFORM_SCOPES,
        "status": "connected",
    }


def sync(account_id: str):
    return {
        "account_id": account_id,
        "followers_count": secrets.randbelow(50000),
        "page_likes": secrets.randbelow(20000),
        "posts_count": secrets.randbelow(500),
        "synced": True,
        "synced_at": datetime.now(timezone.utc),
    }


# =========================================================
# FACEBOOK LOGIN
# =========================================================

def get_login_url(state: str) -> str:

    scopes = ",".join(PLATFORM_SCOPES)

    return (
        f"{FACEBOOK_OAUTH_URL}"
        f"?client_id={FACEBOOK_CLIENT_ID}"
        f"&redirect_uri={FACEBOOK_REDIRECT_URI}"
        f"&scope={scopes}"
        f"&response_type=code"
        f"&state={state}"
    )


# =========================================================
# FACEBOOK TOKEN EXCHANGE
# =========================================================

async def exchange_code_for_token(
    code: str,
) -> dict:

    params = {
        "client_id": FACEBOOK_CLIENT_ID,
        "client_secret": FACEBOOK_CLIENT_SECRET,
        "redirect_uri": FACEBOOK_REDIRECT_URI,
        "code": code,
    }

    async with httpx.AsyncClient(
        timeout=30.0,
    ) as client:

        response = await client.get(
            FACEBOOK_TOKEN_URL,
            params=params,
        )

    print(
        ">>> FACEBOOK TOKEN EXCHANGE STATUS:",
        response.status_code,
        flush=True,
    )

    print(
        ">>> FACEBOOK TOKEN EXCHANGE RESPONSE:",
        response.text,
        flush=True,
    )

    if response.status_code != 200:

        raise Exception(
            "Facebook token exchange failed. "
            f"HTTP {response.status_code}: "
            f"{response.text}"
        )

    return response.json()


# =========================================================
# FACEBOOK USER DEBUG
# =========================================================

async def get_current_facebook_user(
    user_access_token: str,
) -> dict:

    url = f"{FACEBOOK_GRAPH_URL}/me"

    params = {
        "access_token": user_access_token,
        "fields": "id,name",
    }

    async with httpx.AsyncClient(
        timeout=30.0,
    ) as client:

        response = await client.get(
            url,
            params=params,
        )

    print(
        ">>> FACEBOOK /ME STATUS:",
        response.status_code,
        flush=True,
    )

    print(
        ">>> FACEBOOK /ME RESPONSE:",
        response.text,
        flush=True,
    )

    if response.status_code != 200:

        raise Exception(
            "Facebook /me API failed. "
            f"HTTP {response.status_code}: "
            f"{response.text}"
        )

    return response.json()


# =========================================================
# FACEBOOK TOKEN PERMISSIONS DEBUG
# =========================================================

async def get_token_permissions(
    user_access_token: str,
) -> dict:

    url = f"{FACEBOOK_GRAPH_URL}/me/permissions"

    params = {
        "access_token": user_access_token,
    }

    async with httpx.AsyncClient(
        timeout=30.0,
    ) as client:

        response = await client.get(
            url,
            params=params,
        )

    print(
        ">>> FACEBOOK PERMISSIONS STATUS:",
        response.status_code,
        flush=True,
    )

    print(
        ">>> FACEBOOK PERMISSIONS RESPONSE:",
        response.text,
        flush=True,
    )

    if response.status_code != 200:

        raise Exception(
            "Facebook permissions API failed. "
            f"HTTP {response.status_code}: "
            f"{response.text}"
        )

    return response.json()


# =========================================================
# FACEBOOK PAGE LOOKUP
# =========================================================

async def get_user_pages(
    user_access_token: str,
) -> list:

    # -----------------------------------------------------
    # STEP 1 - Verify which Facebook user issued the token
    # -----------------------------------------------------

    try:

        facebook_user = (
            await get_current_facebook_user(
                user_access_token
            )
        )

        print(
            ">>> FACEBOOK AUTHENTICATED USER:",
            facebook_user,
            flush=True,
        )

    except Exception as exc:

        print(
            ">>> WARNING: COULD NOT VERIFY FACEBOOK USER:",
            str(exc),
            flush=True,
        )

    # -----------------------------------------------------
    # STEP 2 - Check permissions granted to the token
    # -----------------------------------------------------

    try:

        permissions = (
            await get_token_permissions(
                user_access_token
            )
        )

        print(
            ">>> FACEBOOK TOKEN PERMISSIONS:",
            permissions,
            flush=True,
        )

    except Exception as exc:

        print(
            ">>> WARNING: COULD NOT READ FACEBOOK "
            "TOKEN PERMISSIONS:",
            str(exc),
            flush=True,
        )

    # -----------------------------------------------------
    # STEP 3 - Retrieve Facebook Pages
    # -----------------------------------------------------

    url = f"{FACEBOOK_GRAPH_URL}/me/accounts"

    params = {
        "access_token": user_access_token,
        "fields": (
            "id,"
            "name,"
            "access_token,"
            "tasks"
        ),
    }

    print(
        ">>> FACEBOOK PAGES REQUEST URL:",
        url,
        flush=True,
    )

    print(
        ">>> FACEBOOK PAGES REQUEST FIELDS:",
        params["fields"],
        flush=True,
    )

    async with httpx.AsyncClient(
        timeout=30.0,
    ) as client:

        response = await client.get(
            url,
            params=params,
        )

    print(
        ">>> FACEBOOK PAGES API STATUS:",
        response.status_code,
        flush=True,
    )

    print(
        ">>> FACEBOOK PAGES API RESPONSE:",
        response.text,
        flush=True,
    )

    if response.status_code != 200:

        raise Exception(
            "Facebook Pages API Error "
            f"(HTTP {response.status_code}): "
            f"{response.text}"
        )

    data = response.json()

    pages = data.get(
        "data",
        [],
    )

    print(
        ">>> FACEBOOK PAGES FOUND:",
        len(pages),
        flush=True,
    )

    if pages:

        for page in pages:

            print(
                ">>> FACEBOOK PAGE:",
                {
                    "id": page.get("id"),
                    "name": page.get("name"),
                    "tasks": page.get("tasks"),
                    "has_page_access_token": bool(
                        page.get("access_token")
                    ),
                },
                flush=True,
            )

    else:

        print(
            ">>> FACEBOOK PAGES RESULT IS EMPTY.",
            flush=True,
        )

        print(
            ">>> IMPORTANT: OAuth succeeded, but "
            "Meta did not return any Page for this "
            "Facebook user/token.",
            flush=True,
        )

    return pages


# =========================================================
# MEDIA URL PARSER
# =========================================================

def _parse_media_urls(
    media_url,
) -> list[str]:

    if media_url is None:
        return []

    if isinstance(media_url, list):
        urls = media_url

    elif isinstance(media_url, tuple):
        urls = list(media_url)

    elif isinstance(media_url, str):

        media_url = media_url.strip()

        if not media_url:
            return []

        if media_url.startswith("["):

            try:

                parsed = json.loads(
                    media_url
                )

            except json.JSONDecodeError as exc:

                raise ValueError(
                    "media_url contains invalid JSON."
                ) from exc

            if not isinstance(
                parsed,
                list,
            ):

                raise ValueError(
                    "media_url JSON must contain an array."
                )

            urls = parsed

        else:

            urls = [media_url]

    else:

        raise ValueError(
            "Unsupported media_url format."
        )

    cleaned_urls = []

    for url in urls:

        if not isinstance(
            url,
            str,
        ):

            raise ValueError(
                "Every media URL must be a string."
            )

        url = url.strip()

        if not url:
            continue

        cleaned_urls.append(url)

    return cleaned_urls


# =========================================================
# LOCAL MEDIA HELPER
# =========================================================

def get_local_media_path(
    media_url: str,
) -> str | None:

    if not media_url:
        return None

    parsed = urlparse(
        media_url
    )

    path = parsed.path

    uploads_marker = "/uploads/"

    if uploads_marker not in path:
        return None

    filename = path.split(
        uploads_marker,
        1,
    )[1]

    filename = os.path.basename(
        filename
    )

    if not filename:
        return None

    local_path = os.path.abspath(
        os.path.join(
            UPLOAD_DIR,
            filename,
        )
    )

    upload_root = os.path.abspath(
        UPLOAD_DIR
    )

    if not local_path.startswith(
        upload_root + os.sep
    ):

        return None

    if not os.path.isfile(
        local_path
    ):

        return None

    return local_path


# =========================================================
# REMOTE MEDIA DOWNLOAD
# =========================================================

def _get_remote_media_extension(
    media_url: str,
) -> str:

    parsed = urlparse(
        media_url
    )

    path = parsed.path

    extension = os.path.splitext(
        path
    )[1].lower()

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
        ".mp4",
        ".mov",
        ".webm",
        ".avi",
    }

    if extension in allowed_extensions:
        return extension

    return ".bin"


async def _download_remote_media(
    media_url: str,
) -> str:

    if not media_url:

        raise ValueError(
            "Remote media URL is empty."
        )

    print(
        ">>> DOWNLOADING REMOTE MEDIA",
        flush=True,
    )

    print(
        f">>> REMOTE MEDIA URL: {media_url}",
        flush=True,
    )

    extension = (
        _get_remote_media_extension(
            media_url
        )
    )

    filename = (
        f"facebook_{secrets.token_hex(16)}"
        f"{extension}"
    )

    local_path = os.path.abspath(
        os.path.join(
            UPLOAD_DIR,
            filename,
        )
    )

    print(
        f">>> REMOTE MEDIA LOCAL PATH: "
        f"{local_path}",
        flush=True,
    )

    try:

        async with httpx.AsyncClient(
            timeout=120.0,
            follow_redirects=True,
        ) as client:

            response = await client.get(
                media_url
            )

    except httpx.RequestError as exc:

        raise Exception(
            "Failed to download remote media: "
            f"{media_url}. "
            f"Error: {exc}"
        ) from exc

    print(
        ">>> REMOTE MEDIA DOWNLOAD STATUS:",
        response.status_code,
        flush=True,
    )

    if response.status_code != 200:

        raise Exception(
            "Failed to download remote media. "
            f"HTTP {response.status_code}: "
            f"{media_url}"
        )

    content = response.content

    if not content:

        raise Exception(
            "Remote media download returned "
            f"empty content: {media_url}"
        )

    try:

        with open(
            local_path,
            "wb",
        ) as media_file:

            media_file.write(
                content
            )

    except OSError as exc:

        raise Exception(
            "Failed to save downloaded media "
            f"to {local_path}: {exc}"
        ) from exc

    print(
        ">>> REMOTE MEDIA DOWNLOADED SUCCESSFULLY",
        flush=True,
    )

    print(
        f">>> DOWNLOADED MEDIA SIZE: "
        f"{len(content)} bytes",
        flush=True,
    )

    return local_path


async def _resolve_media_to_local_path(
    media_url: str,
) -> tuple[str, bool]:

    local_path = get_local_media_path(
        media_url
    )

    if local_path:

        print(
            ">>> MEDIA FOUND LOCALLY",
            flush=True,
        )

        print(
            f">>> LOCAL MEDIA PATH: "
            f"{local_path}",
            flush=True,
        )

        return local_path, False

    print(
        ">>> MEDIA IS REMOTE - DOWNLOADING",
        flush=True,
    )

    downloaded_path = (
        await _download_remote_media(
            media_url
        )
    )

    return downloaded_path, True


def _cleanup_temporary_media(
    local_path: str,
    should_delete: bool,
):

    if not should_delete:
        return

    if not local_path:
        return

    try:

        if os.path.isfile(
            local_path
        ):

            os.remove(
                local_path
            )

            print(
                ">>> TEMPORARY MEDIA DELETED:",
                local_path,
                flush=True,
            )

    except OSError as exc:

        print(
            ">>> WARNING: COULD NOT DELETE "
            f"TEMPORARY MEDIA: {local_path}. "
            f"ERROR: {exc}",
            flush=True,
        )


# =========================================================
# FACEBOOK CAROUSEL
# =========================================================

async def _publish_carousel(
    access_token: str,
    page_id: str,
    content: str | None,
    media_urls: list[str],
):

    if len(media_urls) < 2:

        raise ValueError(
            "Facebook carousel requires at least "
            "2 media URLs."
        )

    if len(media_urls) > 10:

        raise ValueError(
            "Facebook carousel supports a maximum "
            "of 10 media items in this implementation."
        )

    print(
        ">>> FACEBOOK CAROUSEL PUBLISH STARTED",
        flush=True,
    )

    print(
        f">>> CAROUSEL ITEM COUNT: "
        f"{len(media_urls)}",
        flush=True,
    )

    uploaded_photo_ids = []

    temporary_files = []

    async with httpx.AsyncClient(
        timeout=120.0
    ) as client:

        try:

            for index, media_url in enumerate(
                media_urls,
                start=1,
            ):

                print(
                    f">>> FACEBOOK CAROUSEL IMAGE "
                    f"{index}/{len(media_urls)}",
                    flush=True,
                )

                (
                    local_media_path,
                    should_delete,
                ) = await _resolve_media_to_local_path(
                    media_url
                )

                if should_delete:

                    temporary_files.append(
                        local_media_path
                    )

                endpoint = (
                    f"{FACEBOOK_GRAPH_URL}/"
                    f"{page_id}/photos"
                )

                payload = {
                    "published": "false",
                    "access_token": access_token,
                }

                try:

                    with open(
                        local_media_path,
                        "rb",
                    ) as image_file:

                        files = {
                            "source": (
                                os.path.basename(
                                    local_media_path
                                ),
                                image_file,
                                _get_image_content_type(
                                    local_media_path
                                ),
                            )
                        }

                        response = await client.post(
                            endpoint,
                            data=payload,
                            files=files,
                        )

                except OSError as exc:

                    raise Exception(
                        "Facebook carousel image "
                        "could not be read: "
                        f"{media_url}. "
                        f"Error: {exc}"
                    ) from exc

                print(
                    ">>> FACEBOOK CAROUSEL IMAGE "
                    "UPLOAD STATUS:",
                    response.status_code,
                    flush=True,
                )

                print(
                    ">>> FACEBOOK CAROUSEL IMAGE "
                    "UPLOAD RESPONSE:",
                    response.text,
                    flush=True,
                )

                if response.status_code != 200:

                    _raise_facebook_api_error(
                        response,
                        "carousel image upload",
                    )

                result = response.json()

                photo_id = (
                    result.get("id")
                    or result.get("post_id")
                )

                if not photo_id:

                    raise Exception(
                        "Facebook did not return a photo ID "
                        "for carousel image upload. "
                        f"Response: {result}"
                    )

                uploaded_photo_ids.append(
                    str(photo_id)
                )

            endpoint = (
                f"{FACEBOOK_GRAPH_URL}/"
                f"{page_id}/feed"
            )

            payload = {
                "message": content or "",
                "access_token": access_token,
            }

            for index, photo_id in enumerate(
                uploaded_photo_ids
            ):

                payload[
                    f"attached_media[{index}]"
                ] = json.dumps(
                    {
                        "media_fbid": photo_id
                    }
                )

            response = await client.post(
                endpoint,
                data=payload,
            )

            print(
                ">>> FACEBOOK CAROUSEL FEED STATUS:",
                response.status_code,
                flush=True,
            )

            print(
                ">>> FACEBOOK CAROUSEL FEED RESPONSE:",
                response.text,
                flush=True,
            )

            if response.status_code != 200:

                _raise_facebook_api_error(
                    response,
                    "carousel feed post",
                )

            result = response.json()

            platform_post_id = (
                result.get("post_id")
                or result.get("id")
            )

            if not platform_post_id:

                raise Exception(
                    "Facebook carousel was accepted "
                    "but no post ID was returned."
                )

            print(
                ">>> FACEBOOK CAROUSEL PUBLISHED "
                f"SUCCESSFULLY: {platform_post_id}",
                flush=True,
            )

            return platform_post_id

        finally:

            for temporary_file in temporary_files:

                _cleanup_temporary_media(
                    temporary_file,
                    True,
                )


# =========================================================
# FACEBOOK PUBLISHING
# =========================================================

async def publish_post(
    access_token: str,
    page_id: str,
    content: str | None,
    media_url: str | None,
    media_type,
):

    if not access_token:

        raise Exception(
            "Facebook publishing failed: "
            "access_token is empty."
        )

    if not page_id:

        raise Exception(
            "Facebook publishing failed: "
            "page_id is empty."
        )

    print(
        ">>> FACEBOOK PUBLISH DEBUG",
        flush=True,
    )

    print(
        f">>> PAGE ID: {page_id}",
        flush=True,
    )

    print(
        f">>> ACCESS TOKEN EXISTS: "
        f"{bool(access_token)}",
        flush=True,
    )

    print(
        f">>> ACCESS TOKEN LENGTH: "
        f"{len(access_token)}",
        flush=True,
    )

    print(
        f">>> CONTENT: {content}",
        flush=True,
    )

    print(
        f">>> MEDIA URL: {media_url}",
        flush=True,
    )

    print(
        f">>> MEDIA TYPE: {media_type}",
        flush=True,
    )

    media_type_value = (
        media_type.value
        if hasattr(
            media_type,
            "value",
        )
        else str(
            media_type
        ).lower()
    )

    media_type_value = (
        media_type_value.lower()
    )

    if not media_url:

        endpoint = (
            f"{FACEBOOK_GRAPH_URL}/"
            f"{page_id}/feed"
        )

        payload = {
            "message": content or "",
            "access_token": access_token,
        }

        print(
            ">>> FACEBOOK POST TYPE: TEXT",
            flush=True,
        )

        return await _send_facebook_request(
            endpoint=endpoint,
            payload=payload,
            files=None,
        )

    media_urls = _parse_media_urls(
        media_url
    )

    if not media_urls:

        raise ValueError(
            "Facebook publishing requires "
            "at least one media URL."
        )

    print(
        f">>> NORMALIZED FACEBOOK MEDIA URL COUNT: "
        f"{len(media_urls)}",
        flush=True,
    )

    if media_type_value == "carousel":

        print(
            ">>> FACEBOOK POST TYPE: CAROUSEL",
            flush=True,
        )

        return await _publish_carousel(
            access_token=access_token,
            page_id=page_id,
            content=content,
            media_urls=media_urls,
        )

    if media_type_value == "image":

        if len(media_urls) != 1:

            raise ValueError(
                "Facebook image publishing requires "
                "exactly one media URL."
            )

        endpoint = (
            f"{FACEBOOK_GRAPH_URL}/"
            f"{page_id}/photos"
        )

        (
            local_media_path,
            should_delete,
        ) = await _resolve_media_to_local_path(
            media_urls[0]
        )

        try:

            print(
                ">>> FACEBOOK POST TYPE: IMAGE",
                flush=True,
            )

            print(
                f">>> LOCAL IMAGE PATH: "
                f"{local_media_path}",
                flush=True,
            )

            image_size = os.path.getsize(
                local_media_path
            )

            print(
                f">>> IMAGE SIZE: "
                f"{image_size} bytes",
                flush=True,
            )

            if image_size <= 0:

                raise Exception(
                    "Facebook image publishing failed: "
                    "image file is empty."
                )

            content_type = (
                _get_image_content_type(
                    local_media_path
                )
            )

            payload = {
                "caption": content or "",
                "access_token": access_token,
            }

            try:

                with open(
                    local_media_path,
                    "rb",
                ) as image_file:

                    files = {
                        "source": (
                            os.path.basename(
                                local_media_path
                            ),
                            image_file,
                            content_type,
                        )
                    }

                    response = (
                        await _send_facebook_request_response(
                            endpoint=endpoint,
                            payload=payload,
                            files=files,
                        )
                    )

            except OSError as exc:

                raise Exception(
                    "Facebook image publishing failed: "
                    f"unable to read local image: {exc}"
                ) from exc

            if response.status_code != 200:

                _raise_facebook_api_error(
                    response,
                    "image upload",
                )

            result = response.json()

            platform_post_id = (
                result.get("post_id")
                or result.get("id")
            )

            if not platform_post_id:

                raise Exception(
                    "Facebook image upload returned "
                    "HTTP 200 but no post ID. "
                    f"Response: {result}"
                )

            print(
                ">>> FACEBOOK IMAGE PUBLISHED "
                f"SUCCESSFULLY: {platform_post_id}",
                flush=True,
            )

            return platform_post_id

        finally:

            _cleanup_temporary_media(
                local_media_path,
                should_delete,
            )

    if media_type_value in (
        "video",
        "reel",
    ):

        if len(media_urls) != 1:

            raise ValueError(
                "Facebook video/reel publishing "
                "requires exactly one media URL."
            )

        endpoint = (
            f"{FACEBOOK_GRAPH_URL}/"
            f"{page_id}/videos"
        )

        (
            local_media_path,
            should_delete,
        ) = await _resolve_media_to_local_path(
            media_urls[0]
        )

        try:

            print(
                ">>> FACEBOOK POST TYPE: VIDEO",
                flush=True,
            )

            payload = {
                "description": content or "",
                "access_token": access_token,
            }

            try:

                with open(
                    local_media_path,
                    "rb",
                ) as video_file:

                    files = {
                        "source": (
                            os.path.basename(
                                local_media_path
                            ),
                            video_file,
                            _get_video_content_type(
                                local_media_path
                            ),
                        )
                    }

                    return await _send_facebook_request(
                        endpoint=endpoint,
                        payload=payload,
                        files=files,
                    )

            except OSError as exc:

                raise Exception(
                    "Facebook video publishing failed: "
                    f"unable to read local video: {exc}"
                ) from exc

        finally:

            _cleanup_temporary_media(
                local_media_path,
                should_delete,
            )

    endpoint = (
        f"{FACEBOOK_GRAPH_URL}/"
        f"{page_id}/feed"
    )

    payload = {
        "message": content or "",
        "access_token": access_token,
    }

    print(
        ">>> FACEBOOK POST TYPE: FALLBACK/TEXT",
        flush=True,
    )

    return await _send_facebook_request(
        endpoint=endpoint,
        payload=payload,
        files=None,
    )


# =========================================================
# CONTENT-TYPE HELPERS
# =========================================================

def _get_image_content_type(
    file_path: str,
) -> str:

    extension = (
        os.path.splitext(
            file_path
        )[1].lower()
    )

    mapping = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }

    return mapping.get(
        extension,
        "application/octet-stream",
    )


def _get_video_content_type(
    file_path: str,
) -> str:

    extension = (
        os.path.splitext(
            file_path
        )[1].lower()
    )

    mapping = {
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
        ".webm": "video/webm",
        ".avi": "video/x-msvideo",
    }

    return mapping.get(
        extension,
        "application/octet-stream",
    )


# =========================================================
# FACEBOOK API ERROR HANDLER
# =========================================================

def _raise_facebook_api_error(
    response: httpx.Response,
    operation: str,
):

    try:

        error_data = response.json()

    except Exception:

        error_data = {
            "raw_response": response.text
        }

    print(
        f">>> FACEBOOK {operation.upper()} ERROR",
        flush=True,
    )

    print(
        f">>> HTTP STATUS: "
        f"{response.status_code}",
        flush=True,
    )

    print(
        f">>> ERROR DATA: "
        f"{error_data}",
        flush=True,
    )

    if isinstance(
        error_data,
        dict,
    ):

        facebook_error = (
            error_data.get(
                "error",
                {},
            )
        )

        if isinstance(
            facebook_error,
            dict,
        ):

            print(
                f">>> FACEBOOK ERROR TYPE: "
                f"{facebook_error.get('type')}",
                flush=True,
            )

            print(
                f">>> FACEBOOK ERROR MESSAGE: "
                f"{facebook_error.get('message')}",
                flush=True,
            )

            print(
                f">>> FACEBOOK ERROR CODE: "
                f"{facebook_error.get('code')}",
                flush=True,
            )

            print(
                f">>> FACEBOOK ERROR SUBCODE: "
                f"{facebook_error.get('error_subcode')}",
                flush=True,
            )

    raise Exception(
        f"Facebook {operation} failed. "
        f"HTTP {response.status_code}. "
        f"Response: {response.text}"
    )


# =========================================================
# COMMON FACEBOOK REQUEST - RETURNS RAW RESPONSE
# =========================================================

async def _send_facebook_request_response(
    endpoint: str,
    payload: dict,
    files=None,
):

    print(
        ">>> FACEBOOK API REQUEST",
        flush=True,
    )

    print(
        f">>> ENDPOINT: {endpoint}",
        flush=True,
    )

    print(
        f">>> FACEBOOK PAYLOAD KEYS: "
        f"{list(payload.keys())}",
        flush=True,
    )

    if files:

        print(
            ">>> FACEBOOK REQUEST CONTAINS "
            "MULTIPART FILE",
            flush=True,
        )

    try:

        async with httpx.AsyncClient(
            timeout=120.0,
        ) as client:

            if files:

                response = await client.post(
                    endpoint,
                    data=payload,
                    files=files,
                )

            else:

                response = await client.post(
                    endpoint,
                    data=payload,
                )

    except httpx.RequestError as e:

        print(
            ">>> FACEBOOK NETWORK ERROR",
            flush=True,
        )

        print(
            f">>> ERROR TYPE: "
            f"{type(e).__name__}",
            flush=True,
        )

        print(
            f">>> ERROR MESSAGE: "
            f"{str(e)}",
            flush=True,
        )

        raise Exception(
            f"Facebook network error: {str(e)}"
        ) from e

    print(
        f">>> FACEBOOK API STATUS: "
        f"{response.status_code}",
        flush=True,
    )

    print(
        f">>> FACEBOOK API RESPONSE: "
        f"{response.text}",
        flush=True,
    )

    return response


# =========================================================
# COMMON FACEBOOK REQUEST HANDLER
# =========================================================

async def _send_facebook_request(
    endpoint: str,
    payload: dict,
    files=None,
):

    response = (
        await _send_facebook_request_response(
            endpoint=endpoint,
            payload=payload,
            files=files,
        )
    )

    if response.status_code != 200:

        _raise_facebook_api_error(
            response,
            "API request",
        )

    try:

        result = response.json()

    except Exception as e:

        raise Exception(
            "Facebook returned an invalid JSON "
            f"response: {response.text}"
        ) from e

    print(
        f">>> FACEBOOK SUCCESS RESPONSE: "
        f"{result}",
        flush=True,
    )

    platform_post_id = (
        result.get("post_id")
        or result.get("id")
    )

    if not platform_post_id:

        raise Exception(
            "Facebook API returned HTTP 200 "
            "but no post ID. "
            f"Response: {result}"
        )

    print(
        ">>> FACEBOOK POST PUBLISHED "
        f"SUCCESSFULLY: {platform_post_id}",
        flush=True,
    )

    return platform_post_id