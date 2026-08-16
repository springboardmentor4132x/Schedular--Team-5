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
        "instagram_manage_insights",

    ],
    "linkedin": [
        "w_member_social",
    ],
    "twitter": [
        "tweet.read",
        "tweet.write",
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


SUPPORTED_PLATFORMS = {
    "facebook",
    "instagram",
    "linkedin",
    "x",
    "twitter",
    "youtube",
    "pinterest",
}


def _normalize_platform(platform: str) -> str:
    platform = str(platform).lower().strip()

    if platform == "twitter":
        platform = "x"

    if platform not in SUPPORTED_PLATFORMS:
        raise ValueError(
            f"Unsupported social platform: {platform}"
        )

    return platform


def list_accounts(user_id: int):
    db = SessionLocal()

    try:
        return (
            db.query(SocialAccount)
            .filter(
                SocialAccount.user_id == user_id,
                SocialAccount.is_connected.is_(True),
            )
            .order_by(SocialAccount.id.asc())
            .all()
        )
    finally:
        db.close()


def list_accounts_for_user(user_id: int):
    return list_accounts(user_id)


def create_account(
    user_id: int,
    platform: str,
    account_name: str,
):
    db = SessionLocal()

    try:
        platform = _normalize_platform(platform)

        new_account = SocialAccount(
            user_id=user_id,
            platform=platform,
            account_name=account_name,
            account_id=secrets.token_hex(8),
            access_token=secrets.token_hex(16),
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
        platform = _normalize_platform(platform)

        access_token = token_data.get("access_token")

        if not access_token:
            raise ValueError(
                "OAuth response did not contain an access_token"
            )

        expires_in = token_data.get("expires_in")

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

        account_id = (
            str(real_account_id)
            if real_account_id is not None
            else secrets.token_hex(8)
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
            existing_account.account_name = account_name
            existing_account.access_token = access_token
            existing_account.token_expiry = token_expiry
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

        account.is_connected = False
        account.updated_at = datetime.now(
            timezone.utc
        )

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
                SocialAccount.is_connected.is_(True),
            )
            .first()
        )

        if not account:
            raise SocialAccountNotFoundException(
                account_id
            )

        platform_key = (
            account.platform.value
            if hasattr(account.platform, "value")
            else str(account.platform)
        )

        module = PLATFORM_MODULES.get(platform_key)

        if module:
            sync_result = module.sync(
                account.account_id
            )
        else:
            sync_result = {
                "account_id": account.account_id,
                "synced": False,
            }

        account.updated_at = datetime.now(
            timezone.utc
        )

        db.commit()
        db.refresh(account)

        return {
            "account": account,
            "sync_result": sync_result,
        }

    finally:
        db.close()