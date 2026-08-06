from datetime import datetime, timedelta, timezone
from typing import Annotated, Dict

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from api.auth.auth import get_current_user
from api.core.config import settings
from api.dependencies.database import get_db
from api.exceptions import integrations
from api.models.social_account import SocialAccount
from api.roles.social_account import Platform
from api.services.user import get_users


router = APIRouter(
    prefix="/youtube",
    tags=["YouTube API Integration Routes"],
)


GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
YOUTUBE_CHANNEL_URL = "https://www.googleapis.com/youtube/v3/channels"

FRONTEND_ACCOUNTS_URL = "http://localhost:5173/app/accounts"


def _get_user_id(current_user) -> int:
    username = (
        current_user.get("username")
        if isinstance(current_user, dict)
        else getattr(current_user, "username", None)
    )

    if not username:
        raise HTTPException(
            status_code=401,
            detail="Invalid authenticated user.",
        )

    users = get_users()

    for user in users:
        if user.username == username:
            return user.id

    raise HTTPException(
        status_code=404,
        detail="User not found.",
    )


@router.get("/")
def get_youtube_accounts(
    db: Annotated[Session, Depends(get_db)],
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    stmt = (
        select(SocialAccount)
        .where(
            SocialAccount.user_id == user_id,
            SocialAccount.platform == Platform.YOUTUBE,
            SocialAccount.is_connected.is_(True),
        )
        .order_by(SocialAccount.id.asc())
    )

    return db.execute(stmt).scalars().all()


@router.get("/login")
async def youtube_login(
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    params: Dict[str, str] = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
        "response_type": "code",
        "scope": (
            "https://www.googleapis.com/auth/youtube.readonly "
            "https://www.googleapis.com/auth/youtube.upload"
        ),
        "access_type": "offline",
        "prompt": "consent",
        "state": str(user_id),
    }

    url = httpx.URL(
        GOOGLE_AUTH_URL,
        params=params,
    )

    return {
        "url": str(url),
    }


@router.get("/callback")
async def youtube_callback(
    code: str,
    state: str,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        user_id = int(state)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Invalid OAuth state.",
        )

    token_data: Dict[str, str] = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "client_secret": settings.YOUTUBE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            GOOGLE_TOKEN_URL,
            data=token_data,
        )

        if token_res.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail="Failed to retrieve YouTube OAuth token.",
            )

        token_json = token_res.json()

        access_token = token_json.get("access_token")
        refresh_token = token_json.get("refresh_token")
        expires_in = token_json.get("expires_in")

        if not access_token:
            raise HTTPException(
                status_code=400,
                detail="YouTube OAuth did not return an access token.",
            )

        profile_params = {
            "part": "snippet",
            "mine": "true",
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
        }

        profile_res = await client.get(
            YOUTUBE_CHANNEL_URL,
            params=profile_params,
            headers=headers,
        )

        if profile_res.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail="Failed to retrieve YouTube channel information.",
            )

        profile_data = profile_res.json()

        if not profile_data.get("items"):
            raise HTTPException(
                status_code=404,
                detail="No YouTube channel was found for this account.",
            )

        channel = profile_data["items"][0]

        account_id = channel.get("id")

        if not account_id:
            raise HTTPException(
                status_code=422,
                detail="YouTube did not return a channel ID.",
            )

        snippet = channel.get("snippet", {})

        account_name = (
            snippet.get("title")
            or "YouTube Channel"
        )

        thumbnails = snippet.get(
            "thumbnails",
            {},
        )

        default_thumbnail = thumbnails.get(
            "default",
            {},
        )

        profile_picture = default_thumbnail.get(
            "url"
        )

    token_expiry = None

    if expires_in is not None:
        try:
            token_expiry = (
                datetime.now(timezone.utc)
                + timedelta(
                    seconds=int(expires_in)
                )
            )
        except (TypeError, ValueError):
            token_expiry = None

    stmt = (
        select(SocialAccount)
        .where(
            SocialAccount.user_id == user_id,
            SocialAccount.platform == Platform.YOUTUBE,
            SocialAccount.account_id == str(account_id),
        )
    )

    existing_account = (
        db.execute(stmt)
        .scalar_one_or_none()
    )

    if existing_account:
        existing_account.access_token = access_token

        if refresh_token:
            existing_account.refresh_token = refresh_token

        existing_account.token_expiry = token_expiry
        existing_account.account_name = account_name
        existing_account.profile_picture = profile_picture
        existing_account.is_connected = True
        existing_account.permissions = [
            "youtube.readonly",
            "youtube.upload",
        ]

    else:
        new_account = SocialAccount(
            user_id=user_id,
            platform=Platform.YOUTUBE,
            account_name=account_name,
            account_id=str(account_id),
            access_token=access_token,
            refresh_token=refresh_token,
            token_expiry=token_expiry,
            profile_picture=profile_picture,
            is_connected=True,
            permissions=[
                "youtube.readonly",
                "youtube.upload",
            ],
        )

        db.add(new_account)

    db.commit()

    return RedirectResponse(
        url=FRONTEND_ACCOUNTS_URL,
        status_code=303,
    )


@router.delete("/{account_id}")
def disconnect_youtube(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    stmt = (
        select(SocialAccount)
        .where(
            SocialAccount.user_id == user_id,
            SocialAccount.account_id == account_id,
            SocialAccount.platform == Platform.YOUTUBE,
        )
    )

    account = (
        db.execute(stmt)
        .scalar_one_or_none()
    )

    if not account:
        raise integrations.YOUTUBE_CHANNEL_NOT_FOUND_EXCEPTION

    account.is_connected = False
    account.updated_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "message": "YouTube account disconnected successfully"
    }