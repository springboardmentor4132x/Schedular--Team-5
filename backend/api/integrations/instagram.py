import asyncio
import json
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode
import os

import httpx


# ============================================================
# INSTAGRAM / FACEBOOK OAUTH SCOPES
# ============================================================

PLATFORM_SCOPES = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "business_management",
]


# ============================================================
# ENVIRONMENT CONFIGURATION
# ============================================================

FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")

INSTAGRAM_REDIRECT_URI = os.getenv(
    "INSTAGRAM_REDIRECT_URI",
    "http://localhost:8000/social-accounts/instagram/callback",
)

GRAPH_API_VERSION = "v19.0"

FACEBOOK_OAUTH_DIALOG_URL = (
    f"https://www.facebook.com/{GRAPH_API_VERSION}/dialog/oauth"
)

FACEBOOK_TOKEN_URL = (
    f"https://graph.facebook.com/{GRAPH_API_VERSION}/oauth/access_token"
)

GRAPH_BASE_URL = (
    f"https://graph.facebook.com/{GRAPH_API_VERSION}"
)


# ============================================================
# OAUTH LOGIN URL
# ============================================================

def get_login_url(state: str) -> str:
    params = {
        "client_id": FACEBOOK_CLIENT_ID,
        "redirect_uri": INSTAGRAM_REDIRECT_URI,
        "scope": ",".join(PLATFORM_SCOPES),
        "state": state,
        "response_type": "code",
    }

    return (
        f"{FACEBOOK_OAUTH_DIALOG_URL}"
        f"?{urlencode(params)}"
    )


# ============================================================
# EXCHANGE FACEBOOK OAUTH CODE FOR TOKEN
# ============================================================

async def exchange_code_for_token(code: str) -> dict:
    async with httpx.AsyncClient() as client:

        short_lived = await client.get(
            FACEBOOK_TOKEN_URL,
            params={
                "client_id": FACEBOOK_CLIENT_ID,
                "client_secret": FACEBOOK_CLIENT_SECRET,
                "redirect_uri": INSTAGRAM_REDIRECT_URI,
                "code": code,
            },
        )

        short_lived.raise_for_status()

        short_token = short_lived.json()["access_token"]

        long_lived = await client.get(
            FACEBOOK_TOKEN_URL,
            params={
                "grant_type": "fb_exchange_token",
                "client_id": FACEBOOK_CLIENT_ID,
                "client_secret": FACEBOOK_CLIENT_SECRET,
                "fb_exchange_token": short_token,
            },
        )

        long_lived.raise_for_status()

        return long_lived.json()


# ============================================================
# GET INSTAGRAM BUSINESS ACCOUNT
# ============================================================

async def get_instagram_business_account(
    user_access_token: str,
):
    async with httpx.AsyncClient() as client:

        pages_resp = await client.get(
            f"{GRAPH_BASE_URL}/me/accounts",
            params={
                "fields": (
                    "id,name,access_token,"
                    "instagram_business_account{id,username},"
                    "connected_instagram_account{id,username}"
                ),
                "access_token": user_access_token,
            },
        )

        pages_resp.raise_for_status()

        response = pages_resp.json()

        pages = response.get("data", [])

        if not pages:
            raise ValueError(
                "No Facebook Pages returned by Graph API."
            )

        for page in pages:

            page_token = page["access_token"]

            page_lookup = await client.get(
                f"{GRAPH_BASE_URL}/{page['id']}",
                params={
                    "fields": (
                        "id,name,"
                        "instagram_business_account,"
                        "connected_instagram_account"
                    ),
                    "access_token": page_token,
                },
            )

            page_lookup.raise_for_status()

            page_info = page_lookup.json()

            ig_data = (
                page_info.get(
                    "instagram_business_account"
                )
                or page_info.get(
                    "connected_instagram_account"
                )
                or page.get(
                    "instagram_business_account"
                )
                or page.get(
                    "connected_instagram_account"
                )
            )

            if ig_data:
                return {
                    "page_id": page["id"],
                    "page_name": page["name"],
                    "page_access_token": page_token,
                    "instagram_account_id": ig_data["id"],
                    "instagram_username": ig_data.get(
                        "username"
                    ),
                }

        raise ValueError(
            "Instagram account not returned by Graph API."
        )


# ============================================================
# MOCK CONNECT
# ============================================================

def connect(account_name: str):
    return {
        "platform": "instagram",
        "account_name": account_name,
        "account_id": secrets.token_hex(8),
        "access_token": secrets.token_hex(20),
        "refresh_token": secrets.token_hex(20),
        "token_expiry": (
            datetime.now(timezone.utc)
            + timedelta(hours=1)
        ),
        "profile_picture": (
            f"https://placehold.co/150x150"
            f"?text={account_name}"
        ),
        "permissions": PLATFORM_SCOPES,
        "status": "connected",
    }


# ============================================================
# MOCK SYNC
# ============================================================

def sync(account_id: str):
    return {
        "account_id": account_id,
        "followers_count": secrets.randbelow(50000),
        "following_count": secrets.randbelow(1000),
        "posts_count": secrets.randbelow(500),
        "synced": True,
        "synced_at": datetime.now(timezone.utc),
    }


# ============================================================
# MEDIA URL HELPERS
# ============================================================

def _parse_media_urls(media_url) -> list[str]:
    """
    Convert the media_url value into a list of URLs.

    Supported inputs:

        "https://example.com/image.jpg"

    or:

        '["https://example.com/1.jpg",
          "https://example.com/2.jpg"]'

    or:

        ["https://example.com/1.jpg",
         "https://example.com/2.jpg"]

    This allows carousel support without immediately
    changing the Post model.
    """

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

        # JSON array
        if media_url.startswith("["):

            try:
                parsed = json.loads(media_url)

            except json.JSONDecodeError as exc:
                raise ValueError(
                    "media_url contains invalid JSON."
                ) from exc

            if not isinstance(parsed, list):
                raise ValueError(
                    "Carousel media_url must contain a JSON array."
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

        if not isinstance(url, str):
            raise ValueError(
                "Every media URL must be a string."
            )

        url = url.strip()

        if not url:
            continue

        cleaned_urls.append(url)

    return cleaned_urls


# ============================================================
# INSTAGRAM API ERROR HELPER
# ============================================================

def _raise_instagram_api_error(
    response: httpx.Response,
    operation: str,
):
    if response.status_code < 400:
        return

    try:
        error_data = response.json()

    except Exception:
        error_data = {
            "raw_response": response.text
        }

    print(
        f">>> INSTAGRAM {operation} ERROR",
        flush=True,
    )

    print(
        f">>> HTTP STATUS: {response.status_code}",
        flush=True,
    )

    print(
        f">>> RESPONSE: {error_data}",
        flush=True,
    )

    raise Exception(
        f"Instagram {operation} failed. "
        f"HTTP {response.status_code}. "
        f"Response: {response.text}"
    )


# ============================================================
# CREATE INSTAGRAM MEDIA CONTAINER
# ============================================================

async def _create_media_container(
    client: httpx.AsyncClient,
    ig_user_id: str,
    access_token: str,
    *,
    image_url: str | None = None,
    video_url: str | None = None,
    media_type: str | None = None,
    caption: str | None = None,
    children: list[str] | None = None,
):
    params = {
        "access_token": access_token,
    }

    if caption is not None:
        params["caption"] = caption

    if media_type:
        params["media_type"] = media_type

    if image_url:
        params["image_url"] = image_url

    if video_url:
        params["video_url"] = video_url

    if children:
        params["children"] = ",".join(children)

    print(
        ">>> INSTAGRAM CREATE MEDIA CONTAINER",
        flush=True,
    )

    print(
        f">>> IG USER ID: {ig_user_id}",
        flush=True,
    )

    print(
        f">>> MEDIA TYPE: {media_type}",
        flush=True,
    )

    print(
        f">>> IMAGE URL: {image_url}",
        flush=True,
    )

    print(
        f">>> VIDEO URL: {video_url}",
        flush=True,
    )

    print(
        f">>> CHILDREN: {children}",
        flush=True,
    )

    response = await client.post(
        f"{GRAPH_BASE_URL}/{ig_user_id}/media",
        params=params,
    )

    print(
        ">>> INSTAGRAM CREATE CONTAINER STATUS:",
        response.status_code,
        flush=True,
    )

    print(
        ">>> INSTAGRAM CREATE CONTAINER RESPONSE:",
        response.text,
        flush=True,
    )

    _raise_instagram_api_error(
        response,
        "media container creation",
    )

    data = response.json()

    creation_id = data.get("id")

    if not creation_id:
        raise ValueError(
            "Instagram did not return a media container ID."
        )

    print(
        f">>> INSTAGRAM CREATION ID: {creation_id}",
        flush=True,
    )

    return creation_id


# ============================================================
# WAIT FOR MEDIA CONTAINER
# ============================================================

async def _wait_for_media_container(
    client: httpx.AsyncClient,
    creation_id: str,
    access_token: str,
    max_attempts: int = 60,
    wait_seconds: int = 5,
):
    container_status = None

    for attempt in range(
        1,
        max_attempts + 1,
    ):

        elapsed_seconds = (
            (attempt - 1)
            * wait_seconds
        )

        print(
            ">>> CHECKING INSTAGRAM MEDIA "
            "CONTAINER STATUS "
            f"(attempt {attempt}/{max_attempts})",
            flush=True,
        )

        print(
            ">>> INSTAGRAM MEDIA PROCESSING "
            f"TIME: {elapsed_seconds} seconds",
            flush=True,
        )

        response = await client.get(
            f"{GRAPH_BASE_URL}/{creation_id}",
            params={
                "fields": "id,status,status_code",
                "access_token": access_token,
            },
        )

        print(
            ">>> INSTAGRAM CONTAINER STATUS HTTP:",
            response.status_code,
            flush=True,
        )

        print(
            ">>> INSTAGRAM CONTAINER STATUS RESPONSE:",
            response.text,
            flush=True,
        )

        _raise_instagram_api_error(
            response,
            "container status check",
        )

        container_status = response.json()

        status_code = container_status.get(
            "status_code"
        )

        if status_code == "FINISHED":

            print(
                ">>> INSTAGRAM MEDIA CONTAINER IS READY",
                flush=True,
            )

            return

        if status_code in (
            "ERROR",
            "EXPIRED",
        ):

            raise ValueError(
                "Instagram media container "
                "processing failed: "
                f"{container_status}"
            )

        if attempt < max_attempts:

            print(
                ">>> MEDIA STILL PROCESSING. "
                f"WAITING {wait_seconds} SECONDS...",
                flush=True,
            )

            await asyncio.sleep(
                wait_seconds
            )

    raise ValueError(
        "Instagram media container did not "
        "become ready within "
        f"{max_attempts * wait_seconds} seconds. "
        f"Final status: {container_status}"
    )


# ============================================================
# PUBLISH INSTAGRAM MEDIA CONTAINER
# ============================================================

async def _publish_media_container(
    client: httpx.AsyncClient,
    ig_user_id: str,
    access_token: str,
    creation_id: str,
):
    print(
        ">>> INSTAGRAM PUBLISHING MEDIA CONTAINER",
        flush=True,
    )

    response = await client.post(
        f"{GRAPH_BASE_URL}/{ig_user_id}/media_publish",
        params={
            "creation_id": creation_id,
            "access_token": access_token,
        },
    )

    print(
        ">>> INSTAGRAM PUBLISH STATUS:",
        response.status_code,
        flush=True,
    )

    print(
        ">>> INSTAGRAM PUBLISH RESPONSE:",
        response.text,
        flush=True,
    )

    _raise_instagram_api_error(
        response,
        "media publishing",
    )

    published_id = response.json().get("id")

    if not published_id:
        raise ValueError(
            "Instagram did not return "
            "a published media ID."
        )

    print(
        ">>> INSTAGRAM POST PUBLISHED "
        f"SUCCESSFULLY: {published_id}",
        flush=True,
    )

    return published_id


# ============================================================
# PUBLISH INSTAGRAM CAROUSEL
# ============================================================

async def _publish_carousel(
    client: httpx.AsyncClient,
    ig_user_id: str,
    access_token: str,
    content: str | None,
    media_urls: list[str],
):
    if len(media_urls) < 2:
        raise ValueError(
            "Instagram carousel requires at least "
            "2 media URLs."
        )

    if len(media_urls) > 10:
        raise ValueError(
            "Instagram carousel supports a maximum "
            "of 10 media items."
        )

    print(
        ">>> INSTAGRAM CAROUSEL PUBLISH STARTED",
        flush=True,
    )

    print(
        f">>> CAROUSEL ITEM COUNT: {len(media_urls)}",
        flush=True,
    )

    children = []

    # --------------------------------------------------------
    # CREATE CHILD CONTAINERS
    # --------------------------------------------------------

    for index, media_url in enumerate(
        media_urls,
        start=1,
    ):

        print(
            f">>> CREATING CAROUSEL CHILD "
            f"{index}/{len(media_urls)}",
            flush=True,
        )

        child_creation_id = (
            await _create_media_container(
                client=client,
                ig_user_id=ig_user_id,
                access_token=access_token,
                image_url=media_url,
                media_type="",
                caption=None,
            )
        )

        children.append(
            child_creation_id
        )

    # --------------------------------------------------------
    # WAIT FOR CHILD CONTAINERS
    # --------------------------------------------------------

    for index, child_id in enumerate(
        children,
        start=1,
    ):

        print(
            f">>> WAITING FOR CAROUSEL CHILD "
            f"{index}/{len(children)}",
            flush=True,
        )

        await _wait_for_media_container(
            client=client,
            creation_id=child_id,
            access_token=access_token,
        )

    # --------------------------------------------------------
    # CREATE CAROUSEL CONTAINER
    # --------------------------------------------------------

    carousel_creation_id = (
        await _create_media_container(
            client=client,
            ig_user_id=ig_user_id,
            access_token=access_token,
            media_type="CAROUSEL",
            caption=content or "",
            children=children,
        )
    )

    await _wait_for_media_container(
        client=client,
        creation_id=carousel_creation_id,
        access_token=access_token,
    )

    # --------------------------------------------------------
    # PUBLISH CAROUSEL
    # --------------------------------------------------------

    return await _publish_media_container(
        client=client,
        ig_user_id=ig_user_id,
        access_token=access_token,
        creation_id=carousel_creation_id,
    )


# ============================================================
# PUBLISH INSTAGRAM REEL
# ============================================================

async def _publish_reel(
    client: httpx.AsyncClient,
    ig_user_id: str,
    access_token: str,
    content: str | None,
    media_url: str,
):
    print(
        ">>> INSTAGRAM REEL PUBLISH STARTED",
        flush=True,
    )

    creation_id = await _create_media_container(
        client=client,
        ig_user_id=ig_user_id,
        access_token=access_token,
        media_type="REELS",
        video_url=media_url,
        caption=content or "",
    )

    await _wait_for_media_container(
        client=client,
        creation_id=creation_id,
        access_token=access_token,
        max_attempts=60,
        wait_seconds=5,
    )

    return await _publish_media_container(
        client=client,
        ig_user_id=ig_user_id,
        access_token=access_token,
        creation_id=creation_id,
    )


# ============================================================
# PUBLISH INSTAGRAM IMAGE
# ============================================================

async def _publish_image(
    client: httpx.AsyncClient,
    ig_user_id: str,
    access_token: str,
    content: str | None,
    media_url: str,
):
    print(
        ">>> INSTAGRAM IMAGE PUBLISH STARTED",
        flush=True,
    )

    creation_id = await _create_media_container(
        client=client,
        ig_user_id=ig_user_id,
        access_token=access_token,
        image_url=media_url,
        caption=content or "",
    )

    await _wait_for_media_container(
        client=client,
        creation_id=creation_id,
        access_token=access_token,
        max_attempts=60,
        wait_seconds=5,
    )

    return await _publish_media_container(
        client=client,
        ig_user_id=ig_user_id,
        access_token=access_token,
        creation_id=creation_id,
    )


# ============================================================
# PUBLISH INSTAGRAM VIDEO
# ============================================================

async def _publish_video(
    client: httpx.AsyncClient,
    ig_user_id: str,
    access_token: str,
    content: str | None,
    media_url: str,
):
    print(
        ">>> INSTAGRAM VIDEO PUBLISH STARTED",
        flush=True,
    )

    creation_id = await _create_media_container(
        client=client,
        ig_user_id=ig_user_id,
        access_token=access_token,
        media_type="REELS",
        video_url=media_url,
        caption=content or "",
    )

    await _wait_for_media_container(
        client=client,
        creation_id=creation_id,
        access_token=access_token,
        max_attempts=60,
        wait_seconds=5,
    )

    return await _publish_media_container(
        client=client,
        ig_user_id=ig_user_id,
        access_token=access_token,
        creation_id=creation_id,
    )


# ============================================================
# PUBLISH INSTAGRAM STORY
# ============================================================

async def _publish_story(
    client: httpx.AsyncClient,
    ig_user_id: str,
    access_token: str,
    media_url: str,
    media_type,
):
    """
    Story publishing is intentionally isolated here.

    Instagram Stories require media containers configured
    specifically for STORIES. The media must be supplied as
    a publicly reachable URL.

    Supported media:
        - image
        - video
    """

    media_type_value = (
        media_type.value
        if hasattr(media_type, "value")
        else str(media_type).lower()
    )

    print(
        ">>> INSTAGRAM STORY PUBLISH STARTED",
        flush=True,
    )

    if media_type_value == "image":

        creation_id = await _create_media_container(
            client=client,
            ig_user_id=ig_user_id,
            access_token=access_token,
            image_url=media_url,
            media_type="STORIES",
        )

    elif media_type_value in (
        "video",
        "reel",
    ):

        creation_id = await _create_media_container(
            client=client,
            ig_user_id=ig_user_id,
            access_token=access_token,
            video_url=media_url,
            media_type="STORIES",
        )

    else:
        raise ValueError(
            "Instagram Story supports only "
            "image or video media."
        )

    await _wait_for_media_container(
        client=client,
        creation_id=creation_id,
        access_token=access_token,
        max_attempts=60,
        wait_seconds=5,
    )

    return await _publish_media_container(
        client=client,
        ig_user_id=ig_user_id,
        access_token=access_token,
        creation_id=creation_id,
    )


# ============================================================
# MAIN INSTAGRAM PUBLISH FUNCTION
# ============================================================

async def publish_post(
    access_token: str,
    ig_user_id: str,
    content: str | None,
    media_url: str | None,
    media_type,
):
    """
    Publish content to Instagram.

    Supported:

        image
        video
        reel
        carousel
        story

    Instagram does NOT support text-only feed posts.
    """

    print(
        ">>> INSTAGRAM PUBLISH DEBUG",
        flush=True,
    )

    print(
        f">>> INSTAGRAM USER ID: {ig_user_id}",
        flush=True,
    )

    print(
        f">>> ACCESS TOKEN EXISTS: "
        f"{bool(access_token)}",
        flush=True,
    )

    print(
        f">>> ACCESS TOKEN LENGTH: "
        f"{len(access_token) if access_token else 0}",
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

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if not access_token:
        raise ValueError(
            "Instagram publishing failed: "
            "access_token is empty."
        )

    if not ig_user_id:
        raise ValueError(
            "Instagram publishing failed: "
            "ig_user_id is empty."
        )

    if not media_url:
        raise ValueError(
            "Instagram requires media_url. "
            "Text-only posts are not supported."
        )

    media_type_value = (
        media_type.value
        if hasattr(media_type, "value")
        else str(media_type).lower()
    )

    media_type_value = media_type_value.lower()

    media_urls = _parse_media_urls(
        media_url
    )

    if not media_urls:
        raise ValueError(
            "Instagram publishing requires "
            "at least one media URL."
        )

    print(
        f">>> NORMALIZED MEDIA TYPE: "
        f"{media_type_value}",
        flush=True,
    )

    print(
        f">>> NORMALIZED MEDIA URL COUNT: "
        f"{len(media_urls)}",
        flush=True,
    )

    # --------------------------------------------------------
    # HTTP CLIENT
    # --------------------------------------------------------

    async with httpx.AsyncClient(
        timeout=120.0
    ) as client:

        # ----------------------------------------------------
        # CAROUSEL
        # ----------------------------------------------------

        if media_type_value == "carousel":

            return await _publish_carousel(
                client=client,
                ig_user_id=ig_user_id,
                access_token=access_token,
                content=content,
                media_urls=media_urls,
            )

        # ----------------------------------------------------
        # STORY
        # ----------------------------------------------------

        if media_type_value == "story":

            if len(media_urls) != 1:
                raise ValueError(
                    "Instagram Story requires exactly "
                    "one media URL."
                )

            return await _publish_story(
                client=client,
                ig_user_id=ig_user_id,
                access_token=access_token,
                media_url=media_urls[0],
                media_type=media_type,
            )

        # ----------------------------------------------------
        # REEL
        # ----------------------------------------------------

        if media_type_value == "reel":

            if len(media_urls) != 1:
                raise ValueError(
                    "Instagram Reel requires exactly "
                    "one video URL."
                )

            return await _publish_reel(
                client=client,
                ig_user_id=ig_user_id,
                access_token=access_token,
                content=content,
                media_url=media_urls[0],
            )

        # ----------------------------------------------------
        # VIDEO
        # ----------------------------------------------------

        if media_type_value == "video":

            if len(media_urls) != 1:
                raise ValueError(
                    "Instagram video publishing requires "
                    "exactly one video URL."
                )

            return await _publish_video(
                client=client,
                ig_user_id=ig_user_id,
                access_token=access_token,
                content=content,
                media_url=media_urls[0],
            )

        # ----------------------------------------------------
        # IMAGE
        # ----------------------------------------------------

        if media_type_value == "image":

            if len(media_urls) != 1:
                raise ValueError(
                    "Instagram image publishing requires "
                    "exactly one image URL."
                )

            return await _publish_image(
                client=client,
                ig_user_id=ig_user_id,
                access_token=access_token,
                content=content,
                media_url=media_urls[0],
            )

        # ----------------------------------------------------
        # UNSUPPORTED
        # ----------------------------------------------------

        raise ValueError(
            "Unsupported Instagram media type: "
            f"{media_type_value}"
        )