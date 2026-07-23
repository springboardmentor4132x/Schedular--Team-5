import secrets
from datetime import datetime, timedelta, timezone
import os
from urllib.parse import urlencode
import asyncio

import httpx


PLATFORM_SCOPES = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "business_management",
]


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


GRAPH_BASE_URL = f"https://graph.facebook.com/{GRAPH_API_VERSION}"


def get_login_url(state: str) -> str:
    params = {
        "client_id": FACEBOOK_CLIENT_ID,
        "redirect_uri": INSTAGRAM_REDIRECT_URI,
        "scope": ",".join(PLATFORM_SCOPES),
        "state": state,
        "response_type": "code",
    }

    return f"{FACEBOOK_OAUTH_DIALOG_URL}?{urlencode(params)}"


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


async def get_instagram_business_account(user_access_token: str):
    async with httpx.AsyncClient() as client:

        pages_resp = await client.get(
            f"{GRAPH_BASE_URL}/me/accounts",
            params={
                "fields": "id,name,access_token,instagram_business_account{id,username},connected_instagram_account{id,username}",
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
                    "fields": "id,name,instagram_business_account,connected_instagram_account",
                    "access_token": page_token,
                },
            )

            page_lookup.raise_for_status()

            page_info = page_lookup.json()

            ig_data = (
                page_info.get("instagram_business_account")
                or page_info.get("connected_instagram_account")
                or page.get("instagram_business_account")
                or page.get("connected_instagram_account")
            )

            if ig_data:
                return {
                    "page_id": page["id"],
                    "page_name": page["name"],
                    "page_access_token": page_token,
                    "instagram_account_id": ig_data["id"],
                    "instagram_username": ig_data.get("username"),
                }

        raise ValueError(
            "Instagram account not returned by Graph API."
        )


def connect(account_name: str):
    return {
        "platform": "instagram",
        "account_name": account_name,
        "account_id": secrets.token_hex(8),
        "access_token": secrets.token_hex(20),
        "refresh_token": secrets.token_hex(20),
        "token_expiry": datetime.now(timezone.utc) + timedelta(hours=1),
        "profile_picture": f"https://placehold.co/150x150?text={account_name}",
        "permissions": PLATFORM_SCOPES,
        "status": "connected",
    }


def sync(account_id: str):
    return {
        "account_id": account_id,
        "followers_count": secrets.randbelow(50000),
        "following_count": secrets.randbelow(1000),
        "posts_count": secrets.randbelow(500),
        "synced": True,
        "synced_at": datetime.now(timezone.utc),
    }


async def publish_post(
    access_token: str,
    ig_user_id: str,
    content: str | None,
    media_url: str | None,
    media_type,
):
    """
    Publishes an image, video, or reel to an Instagram Business account.
    Waits for Instagram to finish processing the media container
    before publishing it.
    """

    print(">>> INSTAGRAM PUBLISH DEBUG", flush=True)
    print(f">>> INSTAGRAM USER ID: {ig_user_id}", flush=True)
    print(
        f">>> ACCESS TOKEN EXISTS: {bool(access_token)}",
        flush=True
    )
    print(
        f">>> ACCESS TOKEN LENGTH: {len(access_token) if access_token else 0}",
        flush=True
    )
    print(f">>> CONTENT: {content}", flush=True)
    print(f">>> MEDIA URL: {media_url}", flush=True)
    print(f">>> MEDIA TYPE: {media_type}", flush=True)

    if not media_url:
        raise ValueError(
            "Instagram requires a media_url. Text-only posts are not supported."
        )

    media_type_value = (
        media_type.value
        if hasattr(media_type, "value")
        else str(media_type)
    )

    async with httpx.AsyncClient(timeout=60.0) as client:

        container_params = {
            "caption": content or "",
            "access_token": access_token,
        }

        if media_type_value in ("video", "reel"):

            if media_type_value == "reel":
                container_params["media_type"] = "REELS"
            else:
                container_params["media_type"] = "VIDEO"

            container_params["video_url"] = media_url

        else:

            container_params["image_url"] = media_url

        print(
            ">>> INSTAGRAM CREATE MEDIA CONTAINER",
            flush=True
        )

        print(
            f">>> INSTAGRAM USER ID: {ig_user_id}",
            flush=True
        )

        print(
            f">>> MEDIA TYPE: {media_type_value}",
            flush=True
        )

        print(
            f">>> MEDIA URL: {media_url}",
            flush=True
        )

        create_resp = await client.post(
            f"{GRAPH_BASE_URL}/{ig_user_id}/media",
            params=container_params,
        )

        print(
            ">>> INSTAGRAM CREATE CONTAINER STATUS:",
            flush=True
        )

        print(
            create_resp.status_code,
            flush=True
        )

        print(
            ">>> INSTAGRAM CREATE CONTAINER RESPONSE:",
            flush=True
        )

        print(
            create_resp.text,
            flush=True
        )

        create_resp.raise_for_status()

        creation_id = create_resp.json().get("id")

        if not creation_id:
            raise ValueError(
                "Instagram did not return a media container ID."
            )

        print(
            f">>> INSTAGRAM CREATION ID: {creation_id}",
            flush=True
        )

        max_attempts = 10
        wait_seconds = 3

        container_status = None

        for attempt in range(1, max_attempts + 1):

            print(
                f">>> CHECKING INSTAGRAM MEDIA CONTAINER STATUS "
                f"(attempt {attempt}/{max_attempts})",
                flush=True
            )

            status_resp = await client.get(
                f"{GRAPH_BASE_URL}/{creation_id}",
                params={
                    "fields": "id,status,status_code",
                    "access_token": access_token,
                },
            )

            print(
                ">>> INSTAGRAM CONTAINER STATUS HTTP:",
                flush=True
            )

            print(
                status_resp.status_code,
                flush=True
            )

            print(
                ">>> INSTAGRAM CONTAINER STATUS RESPONSE:",
                flush=True
            )

            print(
                status_resp.text,
                flush=True
            )

            status_resp.raise_for_status()

            container_status = status_resp.json()

            status_code = container_status.get("status_code")

            if status_code == "FINISHED":
                print(
                    ">>> INSTAGRAM MEDIA CONTAINER IS READY",
                    flush=True
                )
                break

            if status_code in (
                "ERROR",
                "EXPIRED",
            ):
                raise ValueError(
                    f"Instagram media container processing failed: "
                    f"{container_status}"
                )

            if attempt < max_attempts:
                print(
                    f">>> MEDIA STILL PROCESSING. "
                    f"WAITING {wait_seconds} SECONDS...",
                    flush=True
                )

                await asyncio.sleep(wait_seconds)

        else:
            raise ValueError(
                "Instagram media container did not become ready "
                f"within {max_attempts * wait_seconds} seconds. "
                f"Final status: {container_status}"
            )

        print(
            ">>> INSTAGRAM PUBLISHING MEDIA CONTAINER",
            flush=True
        )

        publish_resp = await client.post(
            f"{GRAPH_BASE_URL}/{ig_user_id}/media_publish",
            params={
                "creation_id": creation_id,
                "access_token": access_token,
            },
        )

        print(
            ">>> INSTAGRAM PUBLISH STATUS:",
            flush=True
        )

        print(
            publish_resp.status_code,
            flush=True
        )

        print(
            ">>> INSTAGRAM PUBLISH RESPONSE:",
            flush=True
        )

        print(
            publish_resp.text,
            flush=True
        )

        publish_resp.raise_for_status()

        published_id = publish_resp.json().get("id")

        if not published_id:
            raise ValueError(
                "Instagram did not return a published media ID."
            )

        print(
            f">>> INSTAGRAM POST PUBLISHED SUCCESSFULLY: "
            f"{published_id}",
            flush=True
        )

        return published_id