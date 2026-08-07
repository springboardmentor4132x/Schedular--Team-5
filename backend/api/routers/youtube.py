
from api.core.config import settings
from api.dependencies.database import get_db
from api.exceptions import integrations
from api.models.social_account import SocialAccount
from api.roles.social_account import Platform
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Annotated, Dict
import httpx

router = APIRouter(
    prefix="/youtube",
    tags=["YouTube Integration Routes"]
)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
YOUTUBE_CHANNEL_URL = "https://www.googleapis.com/youtube/v3/channels"

@router.get("/")
def get_youtube_accounts(
    db: Annotated[Session, Depends(get_db)],
    user_id: int = 1
):
    stmt = select(SocialAccount).where(
        SocialAccount.user_id == user_id,
        SocialAccount.platform == Platform.YOUTUBE
    )
    return db.execute(stmt).scalars().all()

@router.get("/login")
async def youtube_login(
    user_id: int = 1
):
    params: Dict = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/yt-analytics.readonly",
        "access_type": "offline", 
        "prompt": "consent", 
        "state": str(user_id)
    }
    url = httpx.URL(GOOGLE_AUTH_URL, params=params)
    return RedirectResponse(url=str(url))

@router.get("/callback")
async def youtube_callback(
    code: str,
    state: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    user_id = int(state)
    
    token_data: Dict = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "client_secret": settings.YOUTUBE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.YOUTUBE_REDIRECT_URI
    }
    
    async with httpx.AsyncClient() as client:
        token_res = await client.post(GOOGLE_TOKEN_URL, data=token_data)
        if token_res.status_code != 200:
            raise integrations.RETRIEVING_API_TOKEN_FAILED_EXCEPTION
            
        token_json = token_res.json()
        access_token = token_json.get("access_token")
        refresh_token = token_json.get("refresh_token")
        expires_in = token_json.get("expires_in")
        
        params: Dict = {
            "part": "snippet",
            "mine": "true"
        }

        headers: Dict = {
            "Authorization": f"Bearer {access_token}"
        }

        profile_res = await client.get(YOUTUBE_CHANNEL_URL, params=params, headers=headers)
        
        if profile_res.status_code != 200:
            raise integrations.RETRIEVE_CHANNEL_INFO_FAILED_EXCEPTION
            
        profile_data = profile_res.json()

        if not profile_data.get("items"):
            raise integrations.YOUTUBE_CHANNEL_NOT_FOUND_EXCEPTION
            
        channel = profile_data["items"][0]
        account_id = channel["id"]
        account_name = channel["snippet"]["title"]
        profile_picture = channel["snippet"]["thumbnails"]["default"]["url"]

    expiry_date = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    
    stmt = select(SocialAccount).where(
        SocialAccount.user_id == user_id, 
        SocialAccount.platform == Platform.YOUTUBE,
        SocialAccount.account_id == account_id
    )
    existing_account = db.execute(stmt).scalar_one_or_none()

    if existing_account:
        existing_account.access_token = access_token
        if refresh_token: 
            existing_account.refresh_token = refresh_token
        existing_account.token_expiry = expiry_date
        existing_account.account_name = account_name
        existing_account.profile_picture = profile_picture
        existing_account.is_connected = True

    else:
        new_account = SocialAccount(
            user_id=user_id,
            platform=Platform.YOUTUBE,
            account_name=account_name,
            account_id=account_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_expiry=expiry_date,
            profile_picture=profile_picture,
            is_connected=True,
            permissions=["youtube.readonly"]
        )
        db.add(new_account)
        
    db.commit()
    return {"message": "YouTube account connected successfully"}

@router.delete("/{account_id}")
def disconnect_youtube(
    db: Annotated[Session, Depends(get_db)],
    account_id: str,
    user_id: int = 1
) -> Dict:
    stmt = select(SocialAccount).where(
        SocialAccount.user_id == user_id,
        SocialAccount.account_id == account_id,
        SocialAccount.platform == Platform.YOUTUBE
    )
    account = db.execute(stmt).scalar_one_or_none()
    
    if not account:
        raise integrations.YOUTUBE_CHANNEL_NOT_FOUND_EXCEPTION
        
    db.delete(account)
    db.commit()
    return {
        "message": "YouTube account disconnected successfully"
    }
