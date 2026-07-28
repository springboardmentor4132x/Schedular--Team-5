import secrets
from datetime import datetime, timedelta, timezone

from api.database.session import SessionLocal
from api.models.social_account import SocialAccount
from api.exceptions.social_account import (
    SocialAccountNotFoundException,
)
from api.integrations import facebook, instagram


DEFAULT_PERMISSIONS = {
    "facebook": [
        "pages_show_list",
        "pages_manage_posts",
        "pages_read_engagement",
    ],
    "instagram": [
        "instagram_basic",
        "instagram_content_publish",
    ],
    "linkedin": [
        "w_member_social",
    ],
    "twitter": [
        "tweet.read",
        "tweet.write",
    ],
    "youtube": [
        "youtube.upload",
    ],
    "pinterest": [
        "boards:read",
        "pins:write",
    ],
}


PLATFORM_MODULES = {
    "facebook": facebook,
    "instagram": instagram,
}


def list_accounts(user_id: int):
    db = SessionLocal()

    try:
        return (
            db.query(SocialAccount)
            .filter(
                SocialAccount.user_id == user_id
            )
            .all()
        )

    finally:
        db.close()


def create_account(
    user_id: int,
    platform: str,
    account_name: str,
):
    db = SessionLocal()

    try:
        mock_access_token = secrets.token_hex(16)

        mock_account_id = secrets.token_hex(8)

        new_account = SocialAccount(
            user_id=user_id,
            platform=platform,
            account_name=account_name,
            account_id=mock_account_id,
            access_token=mock_access_token,
            token_expiry=(
                datetime.now(timezone.utc)
                + timedelta(hours=1)
            ),
            is_connected=True,
            permissions=DEFAULT_PERMISSIONS.get(
                platform,
                [],
            ),
        )

        db.add(new_account)

        db.commit()

        db.refresh(new_account)

        return new_account

    finally:
        db.close()


def create_account_from_oauth(
    user_id: int,
    platform: str,
    account_name: str,
    token_data: dict,
    real_account_id: str | None = None,
):
    db = SessionLocal()

    try:
        access_token = token_data.get(
            "access_token"
        )

        expires_in = token_data.get(
            "expires_in"
        )

        token_expiry = None

        if expires_in:
            token_expiry = (
                datetime.now(timezone.utc)
                + timedelta(
                    seconds=expires_in
                )
            )

        account_id = (
            real_account_id
            or secrets.token_hex(8)
        )

        existing_account = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.user_id == user_id,
                SocialAccount.platform == platform,
                SocialAccount.account_id == account_id,
            )
            .first()
        )

        if existing_account:
            existing_account.account_name = (
                account_name
            )

            existing_account.access_token = (
                access_token
            )

            existing_account.token_expiry = (
                token_expiry
            )

            existing_account.is_connected = True

            existing_account.permissions = (
                DEFAULT_PERMISSIONS.get(
                    platform,
                    [],
                )
            )

            existing_account.updated_at = (
                datetime.now(timezone.utc)
            )

            db.commit()

            db.refresh(existing_account)

            return existing_account

        new_account = SocialAccount(
            user_id=user_id,
            platform=platform,
            account_name=account_name,
            account_id=account_id,
            access_token=access_token,
            token_expiry=token_expiry,
            is_connected=True,
            permissions=DEFAULT_PERMISSIONS.get(
                platform,
                [],
            ),
        )

        db.add(new_account)

        db.commit()

        db.refresh(new_account)

        return new_account

    finally:
        db.close()


def get_account(
    user_id: int,
    account_id: int,
):
    db = SessionLocal()

    try:
        account = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.id == account_id,
                SocialAccount.user_id == user_id,
            )
            .first()
        )

        if not account:
            raise SocialAccountNotFoundException(
                account_id
            )

        return account

    finally:
        db.close()


def delete_account(
    user_id: int,
    account_id: int,
):
    db = SessionLocal()

    try:
        account = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.id == account_id,
                SocialAccount.user_id == user_id,
            )
            .first()
        )

        if not account:
            raise SocialAccountNotFoundException(
                account_id
            )

        db.delete(account)

        db.commit()

        return {
            "message": (
                f"Account {account_id} "
                "disconnected"
            )
        }

    finally:
        db.close()


def sync_account(
    user_id: int,
    account_id: int,
):
    db = SessionLocal()

    try:
        account = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.id == account_id,
                SocialAccount.user_id == user_id,
            )
            .first()
        )

        if not account:
            raise SocialAccountNotFoundException(
                account_id
            )

        platform_key = (
            account.platform.value
            if hasattr(
                account.platform,
                "value",
            )
            else account.platform
        )

        module = PLATFORM_MODULES.get(
            platform_key
        )

        if module:
            sync_result = module.sync(
                account.account_id
            )

        else:
            sync_result = {
                "account_id": account.account_id,
                "synced": False,
            }

        account.updated_at = (
            datetime.now(timezone.utc)
        )

        db.commit()

        db.refresh(account)

        return {
            "account": account,
            "sync_result": sync_result,
        }

    finally:
        db.close()