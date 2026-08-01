import secrets
from datetime import datetime, timedelta, timezone
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

PLATFORM_SCOPES = [
    "pages_manage_posts",
    "pages_show_list",
    "pages_read_engagement",
]

FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")

FACEBOOK_REDIRECT_URI = (
    "http://localhost:8000/social-accounts/facebook/callback"
)

FACEBOOK_OAUTH_URL = (
    "https://www.facebook.com/v19.0/dialog/oauth"
)

FACEBOOK_TOKEN_URL = (
    "https://graph.facebook.com/v19.0/oauth/access_token"
)

FACEBOOK_GRAPH_URL = (
    "https://graph.facebook.com/v19.0"
)


def connect(account_name: str):
    return {
        "platform": "facebook",
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
        "page_likes": secrets.randbelow(20000),
        "posts_count": secrets.randbelow(500),
        "synced": True,
        "synced_at": datetime.now(timezone.utc),
    }


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


async def exchange_code_for_token(code: str) -> dict:
    params = {
        "client_id": FACEBOOK_CLIENT_ID,
        "client_secret": FACEBOOK_CLIENT_SECRET,
        "redirect_uri": FACEBOOK_REDIRECT_URI,
        "code": code,
    }

    async with httpx.AsyncClient() as client:
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
                f"Facebook token exchange failed. "
                f"HTTP {response.status_code}: {response.text}"
            )

        return response.json()


async def get_user_pages(user_access_token: str) -> list:
    url = f"{FACEBOOK_GRAPH_URL}/me/accounts"

    params = {
        "access_token": user_access_token,
        "fields": "id,name,access_token",
    }

    async with httpx.AsyncClient() as client:
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
                f"Facebook Pages API Error "
                f"(HTTP {response.status_code}): "
                f"{response.text}"
            )

        data = response.json()

        return data.get("data", [])


async def publish_post(
    access_token: str,
    page_id: str,
    content: str | None,
    media_url: str | None,
    media_type,
):
    if not access_token:
        raise Exception(
            "Facebook publishing failed: access_token is empty."
        )

    if not page_id:
        raise Exception(
            "Facebook publishing failed: page_id is empty."
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
        f">>> ACCESS TOKEN EXISTS: {bool(access_token)}",
        flush=True,
    )

    print(
        f">>> ACCESS TOKEN LENGTH: {len(access_token)}",
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

    if media_url and media_type.value == "image":
        endpoint = (
            f"{FACEBOOK_GRAPH_URL}/"
            f"{page_id}/photos"
        )

        payload = {
            "url": media_url,
            "caption": content or "",
            "access_token": access_token,
        }

    elif media_url and media_type.value in ("video", "reel"):
        endpoint = (
            f"{FACEBOOK_GRAPH_URL}/"
            f"{page_id}/videos"
        )

        payload = {
            "file_url": media_url,
            "description": content or "",
            "access_token": access_token,
        }

    else:
        endpoint = (
            f"{FACEBOOK_GRAPH_URL}/"
            f"{page_id}/feed"
        )

        payload = {
            "message": content or "",
            "access_token": access_token,
        }

    print(
        ">>> FACEBOOK API REQUEST",
        flush=True,
    )

    print(
        f">>> ENDPOINT: {endpoint}",
        flush=True,
    )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
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
            f">>> ERROR TYPE: {type(e).__name__}",
            flush=True,
        )

        print(
            f">>> ERROR MESSAGE: {str(e)}",
            flush=True,
        )

        raise Exception(
            f"Facebook network error: {str(e)}"
        ) from e

    print(
        f">>> FACEBOOK API STATUS: {response.status_code}",
        flush=True,
    )

    print(
        f">>> FACEBOOK API RESPONSE: {response.text}",
        flush=True,
    )

    if response.status_code != 200:
        try:
            error_data = response.json()
        except Exception:
            error_data = {
                "raw_response": response.text
            }

        print(
            ">>> FACEBOOK API REJECTION DETAILS",
            flush=True,
        )

        print(
            f">>> HTTP STATUS: {response.status_code}",
            flush=True,
        )

        print(
            f">>> ERROR DATA: {error_data}",
            flush=True,
        )

        if isinstance(error_data, dict):
            facebook_error = error_data.get("error", {})

            if isinstance(facebook_error, dict):
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
            f"Facebook API rejected the post. "
            f"HTTP {response.status_code}. "
            f"Response: {response.text}"
        )

    try:
        result = response.json()
    except Exception as e:
        raise Exception(
            f"Facebook returned an invalid JSON response: "
            f"{response.text}"
        ) from e

    print(
        f">>> FACEBOOK SUCCESS RESPONSE: {result}",
        flush=True,
    )

    platform_post_id = (
        result.get("post_id")
        or result.get("id")
    )

    if not platform_post_id:
        raise Exception(
            f"Facebook API returned HTTP 200 but no post ID. "
            f"Response: {result}"
        )

    print(
        f">>> FACEBOOK POST PUBLISHED SUCCESSFULLY: "
        f"{platform_post_id}",
        flush=True,
    )

    return platform_post_id