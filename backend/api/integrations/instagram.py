import secrets
from datetime import datetime, timedelta, timezone
import os
from urllib.parse import urlencode

import httpx

# FIXED: these now match the permissions actually approved under
# "API setup with Facebook login" in the Meta dashboard (matches the PDF's
# Instagram permission list, pages 8-9). The old "instagram_business_*"
# scopes belonged to the "API setup with Instagram login" product, which
# is why the OAuth dialog was rejecting/dropping them.
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

# NOTE: this must be added as a Valid OAuth Redirect URI under
# Facebook Login -> Settings in the Meta dashboard, same as the Facebook
# callback. If it's not added there yet, OAuth will fail with a
# "redirect_uri" mismatch error.
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
            raise ValueError("No Facebook Pages returned by Graph API.")

        for page in pages:

            page_token = page["access_token"]

            # Lookup page using PAGE ACCESS TOKEN
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