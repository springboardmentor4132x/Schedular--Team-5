
from api.core.config import settings
from api.exceptions import integrations
from api.models.social_account import SocialAccount
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
import httpx

async def get_valid_youtube_token(
    db: Session,
    account: SocialAccount
) -> str:

    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

    if account.token_expiry and datetime.now(timezone.utc) >= account.token_expiry - timedelta(minutes=5):
        if not account.refresh_token:
            raise integrations.MISSING_ACCESS_TOKEN_EXCEPTION

        refresh_data = {
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "refresh_token": account.refresh_token,
            "grant_type": "refresh_token"
        }

        async with httpx.AsyncClient() as client:
            res = await client.post(GOOGLE_TOKEN_URL, data=refresh_data)
            if res.status_code != 200:
                account.is_connected = False
                db.commit()
                raise integrations.REFRESH_ACCESS_TOKEN_FAILED
            
            token_json = res.json()
            account.access_token = token_json["access_token"]
            account.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=token_json["expires_in"])
            db.commit()

    return account.access_token
