from datetime import datetime, timedelta, timezone
from typing import Annotated, Dict

import httpx

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from api.auth.auth import get_current_user
from api.core.config import settings
from api.dependencies.database import get_db
from api.exceptions import integrations
from api.models.social_account import SocialAccount
from api.roles.social_account import Platform


router = APIRouter(
    prefix="/linkedin",
    tags=["LinkedIn API Integration Routes"],
)


LINKEDIN_AUTH_URL = (
    "https://www.linkedin.com/oauth/v2/authorization"
)

LINKEDIN_TOKEN_URL = (
    "https://www.linkedin.com/oauth/v2/accessToken"
)

LINKEDIN_PROFILE_URL = (
    "https://api.linkedin.com/v2/userinfo"
)


# ============================================================
# GET CONNECTED LINKEDIN ACCOUNTS
# ============================================================

@router.get("/")
def get_linkedin_accounts(
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
        SocialAccount.platform ==
        Platform.LINKEDIN,
        SocialAccount.is_connected.is_(True),
    )

    accounts = (
        db.execute(stmt)
        .scalars()
        .all()
    )

    return accounts


# ============================================================
# START LINKEDIN OAUTH
# ============================================================

@router.get("/login")
async def linkedin_login(
    current_user=Depends(
        get_current_user
    ),
):
    """
    Start LinkedIn OAuth.

    IMPORTANT:
    This endpoint returns JSON instead of performing
    a 307 redirect.

    The frontend first calls this endpoint using Axios,
    so the JWT Authorization header is included.

    Then the frontend redirects the browser to the
    returned LinkedIn authorization URL.
    """

    user_id = current_user["id"]

    params: Dict[str, str] = {
        "response_type": "code",
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
        "state": str(user_id),
        "scope": (
            "openid "
            "profile "
            "email "
            "w_member_social"
        ),
    }

    url = httpx.URL(
        LINKEDIN_AUTH_URL,
        params=params,
    )

    return {
        "url": str(url)
    }


# ============================================================
# LINKEDIN CALLBACK
# ============================================================

@router.get("/callback")
async def linkedin_callback(
    code: str,
    state: str,
    db: Annotated[
        Session,
        Depends(get_db)
    ],
):
    """
    LinkedIn redirects the browser here after
    the user approves the application.
    """

    try:
        user_id = int(state)

    except (
        TypeError,
        ValueError,
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid OAuth state.",
        )


    # --------------------------------------------------------
    # EXCHANGE AUTHORIZATION CODE FOR ACCESS TOKEN
    # --------------------------------------------------------

    token_data: Dict[str, str] = {
        "grant_type":
            "authorization_code",

        "code":
            code,

        "redirect_uri":
            settings.LINKEDIN_REDIRECT_URI,

        "client_id":
            settings.LINKEDIN_CLIENT_ID,

        "client_secret":
            settings.LINKEDIN_CLIENT_SECRET,
    }


    async with httpx.AsyncClient() as client:

        token_res = await client.post(
            LINKEDIN_TOKEN_URL,
            data=token_data,
        )


        if token_res.status_code != 200:
            print(
                "LinkedIn token error:",
                token_res.text,
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


        expires_in = (
            token_json.get(
                "expires_in"
            )
        )


        if not access_token:
            raise HTTPException(
                status_code=400,
                detail=(
                    "LinkedIn did not return "
                    "an access token."
                ),
            )


        # ----------------------------------------------------
        # GET LINKEDIN USER PROFILE
        # ----------------------------------------------------

        headers = {
            "Authorization":
                f"Bearer {access_token}"
        }


        profile_res = await client.get(
            LINKEDIN_PROFILE_URL,
            headers=headers,
        )


        if profile_res.status_code != 200:
            print(
                "LinkedIn profile error:",
                profile_res.text,
            )

            raise integrations.RETRIEVING_LINKEDIN_PROFILE_FAILED_EXCEPTION


        profile_data = (
            profile_res.json()
        )


    # --------------------------------------------------------
    # PROFILE INFORMATION
    # --------------------------------------------------------

    account_id = (
        profile_data.get("sub")
    )

    account_name = (
        profile_data.get("name")
        or "LinkedIn Account"
    )

    profile_picture = (
        profile_data.get("picture")
    )


    if not account_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "LinkedIn did not return "
                "a user ID."
            ),
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
    # CHECK EXISTING ACCOUNT
    # --------------------------------------------------------

    stmt = select(
        SocialAccount
    ).where(
        SocialAccount.user_id == user_id,
        SocialAccount.platform ==
        Platform.LINKEDIN,
        SocialAccount.account_id ==
        str(account_id),
    )


    existing_account = (
        db.execute(stmt)
        .scalar_one_or_none()
    )


    if existing_account:

        existing_account.access_token = (
            access_token
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
            "openid",
            "profile",
            "email",
            "w_member_social",
        ]

    else:

        new_account = SocialAccount(
            user_id=user_id,
            platform=Platform.LINKEDIN,
            account_name=account_name,
            account_id=str(account_id),
            access_token=access_token,
            token_expiry=expiry_date,
            profile_picture=profile_picture,
            is_connected=True,
            permissions=[
                "openid",
                "profile",
                "email",
                "w_member_social",
            ],
        )

        db.add(
            new_account
        )


    db.commit()


    # --------------------------------------------------------
    # RETURN TO SOCIAL ACCOUNTS PAGE
    # --------------------------------------------------------

    from fastapi.responses import RedirectResponse

    return RedirectResponse(
        url=(
            "http://localhost:5173/"
            "app/accounts"
        )
    )


# ============================================================
# DISCONNECT LINKEDIN
# ============================================================

@router.delete(
    "/{account_id}"
)
def disconnect_linkedin(
    account_id: str,
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
        SocialAccount.account_id ==
        account_id,
        SocialAccount.platform ==
        Platform.LINKEDIN,
    )


    account = (
        db.execute(stmt)
        .scalar_one_or_none()
    )


    if not account:
        raise integrations.LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION


    db.delete(
        account
    )

    db.commit()


    return {
        "message":
            "LinkedIn account disconnected successfully"
    }