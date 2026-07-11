import secrets
from datetime import datetime, timedelta, timezone

from api.database.session import SessionLocal
from api.models.social_account import SocialAccount
from api.exceptions.social_account import SocialAccountNotFoundException


def list_accounts(user_id: int):
    db = SessionLocal()
    try:
        return db.query(SocialAccount).filter(SocialAccount.user_id == user_id).all()
    finally:
        db.close()


def create_account(user_id: int, platform: str, account_name: str):
    db = SessionLocal()
    try:
        # Simulate an OAuth connection — generates a mock token instead of calling the real platform API
        mock_access_token = secrets.token_hex(16)
        mock_account_id = secrets.token_hex(8)

        new_account = SocialAccount(
            user_id=user_id,
            platform=platform,
            account_name=account_name,
            account_id=mock_account_id,
            access_token=mock_access_token,
            token_expiry=datetime.now(timezone.utc) + timedelta(hours=1),
            is_connected=True
        )
        db.add(new_account)
        db.commit()
        db.refresh(new_account)
        return new_account
    finally:
        db.close()


def get_account(user_id: int, account_id: int):
    db = SessionLocal()
    try:
        account = db.query(SocialAccount).filter(
            SocialAccount.id == account_id,
            SocialAccount.user_id == user_id
        ).first()
        if not account:
            raise SocialAccountNotFoundException(account_id)
        return account
    finally:
        db.close()


def delete_account(user_id: int, account_id: int):
    db = SessionLocal()
    try:
        account = db.query(SocialAccount).filter(
            SocialAccount.id == account_id,
            SocialAccount.user_id == user_id
        ).first()
        if not account:
            raise SocialAccountNotFoundException(account_id)
        db.delete(account)
        db.commit()
        return {"message": f"Account {account_id} disconnected"}
    finally:
        db.close()