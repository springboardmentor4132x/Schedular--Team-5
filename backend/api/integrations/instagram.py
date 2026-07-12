import secrets
from datetime import datetime, timedelta, timezone

PLATFORM_SCOPES = ["instagram_basic", "instagram_content_publish", "pages_show_list"]


def connect(account_name: str):
    """
    Simulates the Instagram OAuth connection flow.
    Real Instagram Graph API integration comes in a later milestone.
    """
    return {
        "platform": "instagram",
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
    Simulates pulling updated profile data from Instagram.
    Real API call comes in a later milestone.
    """
    return {
        "account_id": account_id,
        "followers_count": secrets.randbelow(50000),
        "following_count": secrets.randbelow(1000),
        "posts_count": secrets.randbelow(500),
        "synced": True,
        "synced_at": datetime.now(timezone.utc)
    }