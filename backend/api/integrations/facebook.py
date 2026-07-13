import secrets
from datetime import datetime, timedelta, timezone
import os
import httpx

PLATFORM_SCOPES = ["pages_manage_posts", "pages_show_list"]


def connect(account_name: str):
    """
    Simulates the Facebook OAuth connection flow.
    Real Facebook Graph API integration comes in a later milestone.
    """
    return {
        "platform": "facebook",
        "account_name": account_name,
        "account_id": secrets.token_hex(8),
        "access_token": secrets.token_hex(20),
        "refresh_token": secrets.token_hex(20),
        "token_expiry": datetime.now(timezone.utc) + timedelta(hours=1),
        "profile_picture": f"https://placehold.co/150x150?text={account_name}",
        "permissions": PLATFORM_SCOPES,
        "status": "connected"
    }


def sync(account_id: str):
    """
    Simulates pulling updated page data from Facebook.
    Real API call comes in a later milestone.
    """
    return {
        "account_id": account_id,
        "followers_count": secrets.randbelow(50000),
        "page_likes": secrets.randbelow(20000),
        "posts_count": secrets.randbelow(500),
        "synced": True,
        "synced_at": datetime.now(timezone.utc)
    }


FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")
FACEBOOK_REDIRECT_URI = "http://localhost:8000/social-accounts/facebook/callback"
FACEBOOK_OAUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth"
FACEBOOK_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"


def get_login_url(state: str) -> str:
    """
    Builds the URL that sends the user to Facebook's real login/consent screen.
    The state parameter carries the user's identity through the redirect.
    """
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
    """
    Takes the authorization code Facebook sends back and exchanges it
    for a real access token.
    """
    params = {
        "client_id": FACEBOOK_CLIENT_ID,
        "client_secret": FACEBOOK_CLIENT_SECRET,
        "redirect_uri": FACEBOOK_REDIRECT_URI,
        "code": code,
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(FACEBOOK_TOKEN_URL, params=params)
        response.raise_for_status()
        return response.json()