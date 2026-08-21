from datetime import datetime, timedelta, timezone
from typing import Annotated, Dict

import httpx

from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from api.auth.auth import get_current_user
from api.core.config import settings
from api.dependencies.database import get_db
from api.exceptions import integrations
from api.models.social_account import SocialAccount
from api.roles.social_account import Platform
from api.services.notification import create_notification


router = APIRouter(
    prefix="/youtube",
    tags=["YouTube API Integration Routes"],
)


GOOGLE_AUTH_URL = (
    "https://accounts.google.com/o/oauth2/v2/auth"
)

GOOGLE_TOKEN_URL = (
    "https://oauth2.googleapis.com/token"
)

YOUTUBE_CHANNEL_URL = (
    "https://www.googleapis.com/youtube/v3/channels"
)


# ============================================================
# GET CONNECTED YOUTUBE ACCOUNTS
# ============================================================

@router.get("/")
def get_youtube_accounts(
    db: Annotated[
        Session,
        Depends(get_db)
    ],
    current_user=Depends(
        get_current_user
    ),
):
    user_id = current_user["id"]

    stmt = select(
        SocialAccount
    ).where(
        SocialAccount.user_id == user_id,
        SocialAccount.platform == Platform.YOUTUBE,
        SocialAccount.is_connected.is_(True),
    )

    return (
        db.execute(stmt)
        .scalars()
        .all()
    )


# ============================================================
# START YOUTUBE OAUTH
# ============================================================

@router.get("/login")
async def youtube_login(
    current_user=Depends(
        get_current_user
    ),
):
    """
    Start YouTube OAuth.

    IMPORTANT:
    This endpoint returns the Google OAuth URL as JSON
    instead of performing a 307 redirect.

    The frontend calls this endpoint through Axios,
    so the JWT Authorization header is included.

    After receiving the URL, the frontend performs a
    normal browser navigation using window.location.assign().
    This avoids a CORS error caused by Axios following
    the redirect directly to Google's OAuth server.
    """

    user_id = current_user["id"]

    params: Dict[str, str] = {
        "client_id": settings.YOUTUBE_CLIENT_ID,
        "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
        "response_type": "code",

        "scope": (
            "https://www.googleapis.com/auth/youtube.readonly "
            "https://www.googleapis.com/auth/youtube.upload "
            "https://www.googleapis.com/auth/yt-analytics.readonly"
        ),

        "access_type": "offline",
        "prompt": "consent",

        # Store the logged-in application user ID.
        "state": str(user_id),
    }

    url = httpx.URL(
        GOOGLE_AUTH_URL,
        params=params,
    )

    return {
        "url": str(url)
    }


# ============================================================
# YOUTUBE OAUTH CALLBACK
# ============================================================

@router.get("/callback")
async def youtube_callback(
    code: str,
    state: str,
    db: Annotated[
        Session,
        Depends(get_db)
    ],
) -> Dict:
    """
    Google redirects the browser here after the user
    approves the YouTube application.

    The authorization code is exchanged for Google tokens,
    the YouTube channel is retrieved, and the account is
    stored in SocialAccount.

    A notification is created after successful connection
    or reconnection.
    """

    # --------------------------------------------------------
    # GET USER ID FROM OAUTH STATE
    # --------------------------------------------------------

    try:
        user_id = int(state)

    except (
        TypeError,
        ValueError,
    ):
        raise integrations.INVALID_OAUTH_STATE_EXCEPTION

    # --------------------------------------------------------
    # EXCHANGE AUTHORIZATION CODE FOR ACCESS TOKEN
    # --------------------------------------------------------

    token_data: Dict[str, str] = {
        "client_id":
            settings.YOUTUBE_CLIENT_ID,

        "client_secret":
            settings.YOUTUBE_CLIENT_SECRET,

        "code":
            code,

        "grant_type":
            "authorization_code",

        "redirect_uri":
            settings.YOUTUBE_REDIRECT_URI,
    }

    async with httpx.AsyncClient() as client:

        token_res = await client.post(
            GOOGLE_TOKEN_URL,
            data=token_data,
        )

        if token_res.status_code != 200:

            print(
                ">>> YOUTUBE TOKEN ERROR:",
                token_res.text,
                flush=True,
            )

            raise integrations.RETRIEVING_API_TOKEN_FAILED_EXCEPTION

        token_json = (
            token_res.json()
        )

        access_token = (
            token_json.get(
                "access_token"
            )
        )

        refresh_token = (
            token_json.get(
                "refresh_token"
            )
        )

        expires_in = (
            token_json.get(
                "expires_in"
            )
        )

        if not access_token:

            raise integrations.RETRIEVING_API_TOKEN_FAILED_EXCEPTION

        # ----------------------------------------------------
        # GET YOUTUBE CHANNEL INFORMATION
        # ----------------------------------------------------

        params: Dict[str, str] = {
            "part": "snippet",
            "mine": "true",
        }

        headers: Dict[str, str] = {
            "Authorization":
                f"Bearer {access_token}"
        }

        profile_res = await client.get(
            YOUTUBE_CHANNEL_URL,
            params=params,
            headers=headers,
        )

        if profile_res.status_code != 200:

            print(
                ">>> YOUTUBE CHANNEL ERROR:",
                profile_res.text,
                flush=True,
            )

            raise integrations.RETRIEVE_CHANNEL_INFO_FAILED_EXCEPTION

        profile_data = (
            profile_res.json()
        )

        if not profile_data.get("items"):

            raise integrations.YOUTUBE_CHANNEL_NOT_FOUND_EXCEPTION

        channel = (
            profile_data["items"][0]
        )

        # ----------------------------------------------------
        # CHANNEL INFORMATION
        # ----------------------------------------------------

        account_id = (
            channel["id"]
        )

        account_name = (
            channel["snippet"]["title"]
        )

        profile_picture = (
            channel["snippet"]
            .get("thumbnails", {})
            .get("default", {})
            .get("url")
        )

    # --------------------------------------------------------
    # TOKEN EXPIRY
    # --------------------------------------------------------

    try:
        expires_seconds = int(
            expires_in or 0
        )

    except (
        TypeError,
        ValueError,
    ):
        expires_seconds = 0

    expiry_date = (
        datetime.now(
            timezone.utc
        )
        + timedelta(
            seconds=expires_seconds
        )
    )

    # --------------------------------------------------------
    # CHECK IF YOUTUBE ACCOUNT ALREADY EXISTS
    # --------------------------------------------------------

    stmt = select(
        SocialAccount
    ).where(
        SocialAccount.user_id == user_id,

        SocialAccount.platform ==
        Platform.YOUTUBE,

        SocialAccount.account_id ==
        account_id,
    )

    existing_account = (
        db.execute(stmt)
        .scalar_one_or_none()
    )

    # --------------------------------------------------------
    # UPDATE EXISTING ACCOUNT / RECONNECT
    # --------------------------------------------------------

    if existing_account:

        existing_account.access_token = (
            access_token
        )

        # Google may not return a refresh token
        # when the account is being reconnected.
        #
        # Therefore, keep the old refresh token if
        # Google does not return a new one.

        if refresh_token:

            existing_account.refresh_token = (
                refresh_token
            )

        existing_account.token_expiry = (
            expiry_date
        )

        existing_account.account_name = (
            account_name
        )

        existing_account.profile_picture = (
            profile_picture
        )

        existing_account.is_connected = True

        existing_account.permissions = [
            "youtube.readonly",
            "youtube.upload",
            "yt-analytics.readonly",
        ]

        print(
            ">>> YOUTUBE ACCOUNT RECONNECTED:",
            account_name,
            "| CHANNEL ID:",
            account_id,
            "| USER ID:",
            user_id,
            flush=True,
        )

    # --------------------------------------------------------
    # CREATE NEW ACCOUNT
    # --------------------------------------------------------

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

            permissions=[
                "youtube.readonly",
                "youtube.upload",
                "yt-analytics.readonly",
            ],
        )

        db.add(
            new_account
        )

        print(
            ">>> YOUTUBE ACCOUNT CONNECTED:",
            account_name,
            "| CHANNEL ID:",
            account_id,
            "| USER ID:",
            user_id,
            flush=True,
        )

    # --------------------------------------------------------
    # SAVE TO DATABASE
    # --------------------------------------------------------

    db.commit()

    # --------------------------------------------------------
    # MODULE 7 - YOUTUBE ACCOUNT CONNECTED NOTIFICATION
    # --------------------------------------------------------

    try:

        create_notification(
            user_id=user_id,

            title="Social Account Connected",

            description=(
                f'Your Youtube account '
                f'"{account_name}" was connected successfully.'
            ),

            notification_type="success",

            category="account_activity",

            delivery_channel="in_app",
        )

        print(
            ">>> YOUTUBE ACCOUNT CONNECTION NOTIFICATION CREATED",
            flush=True,
        )

    except Exception as notification_error:

        print(
            ">>> YOUTUBE ACCOUNT CONNECTION NOTIFICATION FAILED:",
            notification_error,
            flush=True,
        )

    # --------------------------------------------------------
    # RETURN TO SOCIAL ACCOUNTS PAGE
    # --------------------------------------------------------

    return RedirectResponse(
        url=(
            "http://localhost:5173/"
            "app/accounts"
        )
    )


# ============================================================
# DISCONNECT YOUTUBE ACCOUNT
# ============================================================

@router.delete(
    "/{account_id}"
)
def disconnect_youtube(
    account_id: str,
    db: Annotated[
        Session,
        Depends(get_db)
    ],
    current_user=Depends(
        get_current_user
    ),
) -> Dict:

    user_id = current_user["id"]

    stmt = select(
        SocialAccount
    ).where(
        SocialAccount.user_id == user_id,

        SocialAccount.account_id ==
        account_id,

        SocialAccount.platform ==
        Platform.YOUTUBE,
    )

    account = (
        db.execute(stmt)
        .scalar_one_or_none()
    )

    if not account:

        raise integrations.YOUTUBE_CHANNEL_NOT_FOUND_EXCEPTION

    # --------------------------------------------------------
    # SAVE ACCOUNT INFORMATION BEFORE DELETE
    # --------------------------------------------------------

    account_name = account.account_name

    # --------------------------------------------------------
    # DELETE ACCOUNT
    # --------------------------------------------------------

    db.delete(
        account
    )

    db.commit()

    # --------------------------------------------------------
    # MODULE 7 - YOUTUBE ACCOUNT DISCONNECTED NOTIFICATION
    # --------------------------------------------------------

    try:

        create_notification(
            user_id=user_id,

            title="Social Account Disconnected",

            description=(
                f'Your Youtube account '
                f'"{account_name}" was disconnected.'
            ),

            notification_type="info",

            category="account_activity",

            delivery_channel="in_app",
        )

        print(
            ">>> YOUTUBE ACCOUNT DISCONNECTION NOTIFICATION CREATED",
            flush=True,
        )

    except Exception as notification_error:

        print(
            ">>> YOUTUBE ACCOUNT DISCONNECTION NOTIFICATION FAILED:",
            notification_error,
            flush=True,
        )

    return {
        "message":
            "YouTube account disconnected successfully"
    }