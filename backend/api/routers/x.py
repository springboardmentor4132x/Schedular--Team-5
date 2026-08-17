
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from api.dependencies.database import get_db
from api.models.social_account import SocialAccount
from api.roles import social_account
from api.exceptions.integrations import X_ACCOUNT_NOT_FOUND_EXCEPTION
from sqlalchemy import select
from typing import Annotated, Dict

router = APIRouter(
    prefix="/x",
    tags=["X Integration Routes"]
)

@router.get("/login")
async def login_twitter(

    user_id: int

):
    return RedirectResponse(url=f"/x/callback?user_id={user_id}&code=x_code")

@router.get("/callback")
async def twitter_callback(
    db: Annotated[Session, Depends(get_db)],
    user_id: int,
    code: str = "x_code"
) -> Dict:
    
    account = db.query(SocialAccount).filter(
        SocialAccount.platform == social_account.Platform.X,
        SocialAccount.user_id == user_id
    ).first()
    
    if not account:
        account = SocialAccount(
            user_id=user_id,
            platform=social_account.Platform.X,
            account_name="Yashant Thakur", 
            account_id="x_123",
            access_token="x_access_token",
            refresh_token="x_refresh_token",
            token_expiry=datetime.now(timezone.utc) + timedelta(days=30),
            profile_picture="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png",
            is_connected=True,
            permissions=["tweet.read", "tweet.write", "users.read"]
        )
        db.add(account)
        db.commit()
        
    return {
        "status": "success",
        "platform": "x",
        "message": "X account linked successfully!"
    }

@router.delete("/{account_id}")
def disconnect_twitter(

    db: Annotated[Session, Depends(get_db)],
    account_id: str,
    user_id: int

) -> Dict:

    stmt = select(SocialAccount).where(
        SocialAccount.user_id == user_id,
        SocialAccount.account_id == account_id,
        SocialAccount.platform == social_account.Platform.X
    )
    account = db.execute(stmt).scalar_one_or_none()
    
    if not account:
        raise X_ACCOUNT_NOT_FOUND_EXCEPTION

    db.delete(account)
    db.commit()

    return {
        "message": "X account disconnected successfully"
    }
