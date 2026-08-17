
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from api.dependencies.database import get_db
from api.models.social_account import SocialAccount
from api.roles import social_account
from api.exceptions.integrations import PINTEREST_ACCOUNT_NOT_FOUND_EXCEPTION
from sqlalchemy import select
from typing import Annotated, Dict

router = APIRouter(
    prefix="/pinterest",
    tags=["Pinterest Integration Routes"]
)

@router.get("/login")
async def login_pinterest(
    user_id: int
):
    return RedirectResponse(url=f"/pinterest/callback?user_id={user_id}&code=pin_code")

@router.get("/callback")
async def pinterest_callback(
    db: Annotated[Session, Depends(get_db)],
    user_id: int,
    code: str = "pin_code",
) -> Dict:
    
    account = db.query(SocialAccount).filter(
        SocialAccount.platform == social_account.Platform.PINTEREST,
        SocialAccount.user_id == user_id
    ).first()
    
    if not account:
        account = SocialAccount(
            user_id=user_id,  
            platform=social_account.Platform.PINTEREST,
            account_name="Yashant Thakur", 
            account_id="pin_123",
            access_token="pin_access_token",
            refresh_token="pin_refresh_token",
            token_expiry=datetime.now(timezone.utc) + timedelta(days=30),
            profile_picture="https://s.pinimg.com/images/user/default_140.png",
            is_connected=True,
            permissions=["boards:read", "pins:read", "pins:write"]
        )
        db.add(account)
        db.commit()
        
    return {
        "status": "success",
        "platform": "pinterest",
        "message": "Pinterest account linked successfully."
    }

@router.delete("/{account_id}")
def disconnect_pinterest(
    db: Annotated[Session, Depends(get_db)],
    account_id: str,
    user_id: int
) -> Dict:
    stmt = select(SocialAccount).where(
        SocialAccount.user_id == user_id,
        SocialAccount.account_id == account_id,
        SocialAccount.platform == social_account.Platform.PINTEREST
    )
    account = db.execute(stmt).scalar_one_or_none()
    
    if not account:
        raise PINTEREST_ACCOUNT_NOT_FOUND_EXCEPTION
        
    db.delete(account)
    db.commit()

    return {
        "message": "Pinterest account disconnected successfully"
    }
