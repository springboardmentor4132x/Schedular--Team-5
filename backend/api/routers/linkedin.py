
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
    prefix="/linkedin",
    tags=["LinkedIn API Integration Routes"]
)

LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_PROFILE_URL = "https://api.linkedin.com/v2/userinfo"

@router.get("/")
def get_linkedin_accounts(
    db: Annotated[Session, Depends(get_db)],
    user_id: int = 1
):
    stmt = select(SocialAccount).where(
        SocialAccount.user_id == user_id,
        SocialAccount.platform == Platform.LINKEDIN
    )
    accounts = db.execute(stmt).scalars().all()
    return accounts

@router.get("/login")
async def linkedin_login(
    user_id: int = 1
):
    params: Dict = {
        "response_type": "code",
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
        "state": str(user_id), 
        "scope": "openid profile email w_member_social"
    }
    url = httpx.URL(LINKEDIN_AUTH_URL, params=params)
    return RedirectResponse(url=str(url))

@router.get("/callback")
async def linkedin_callback(
    code: str,
    state: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    user_id = int(state)
    
    token_data: Dict = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "client_secret": settings.LINKEDIN_CLIENT_SECRET
    }
    
    async with httpx.AsyncClient() as client:
        token_res = await client.post(LINKEDIN_TOKEN_URL, data=token_data)
        if token_res.status_code != 200:
            raise integrations.RETRIEVING_API_TOKEN_FAILED_EXCEPTION
        
        token_json = token_res.json()
        access_token = token_json.get("access_token")
        expires_in = token_json.get("expires_in")
        
        headers: Dict = {
            "Authorization": f"Bearer {access_token}"
        }

        profile_res = await client.get(LINKEDIN_PROFILE_URL, headers=headers)

        if profile_res.status_code != 200:
            raise integrations.RETRIEVING_LINKEDIN_PROFILE_FAILED_EXCEPTION
            
        profile_data = profile_res.json()

    account_id = profile_data.get("sub")
    account_name = profile_data.get("name")
    profile_picture = profile_data.get("picture")
    expiry_date = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    stmt = select(SocialAccount).where(
        SocialAccount.user_id == user_id, 
        SocialAccount.platform == Platform.LINKEDIN,
        SocialAccount.account_id == account_id
    )

    existing_account = db.execute(stmt).scalar_one_or_none()

    if existing_account:
        existing_account.access_token = access_token
        existing_account.token_expiry = expiry_date
        existing_account.account_name = account_name
        existing_account.profile_picture = profile_picture
        existing_account.is_connected = True
    else:
        new_account = SocialAccount(
            user_id=user_id,
            platform=Platform.LINKEDIN,
            account_name=account_name,
            account_id=account_id,
            access_token=access_token,
            token_expiry=expiry_date,
            profile_picture=profile_picture,
            is_connected=True,
            permissions=["openid", "profile", "email", "w_member_social"]
        )
        db.add(new_account)
        
    db.commit()
    return {"message": "LinkedIn account connected successfully"}

@router.delete("/{account_id}")
def disconnect_linkedin(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    user_id: int = 1
) -> Dict:
    stmt = select(SocialAccount).where(
        SocialAccount.user_id == user_id,
        SocialAccount.account_id == account_id,
        SocialAccount.platform == Platform.LINKEDIN
    )
    account = db.execute(stmt).scalar_one_or_none()
    
    if not account:
        raise integrations.LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION
        
    db.delete(account)
    db.commit()
    return {
        "message": "account disconnected successfully"
    }
