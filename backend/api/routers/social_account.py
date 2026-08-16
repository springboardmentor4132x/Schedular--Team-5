from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from api.schemas.social_account import (
    SocialAccountCreate,
    SocialAccountResponse,
)
from api.services import social_account as service
from api.auth.auth import get_current_user
from api.services.user import get_users
from api.integrations import facebook, instagram
from api.database.session import SessionLocal
from api.models.social_account import SocialAccount


router = APIRouter(prefix="/social-accounts")


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


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


def _resolve_target_id(
    current_user,
    client_id: Optional[int],
) -> int:
    user_id = _get_user_id(current_user)

    role = (
        current_user.get("role")
        if isinstance(current_user, dict)
        else getattr(current_user, "role", None)
    )

    if role == "marketing_team" and client_id is not None:
        return client_id

    return user_id


@router.get(
    "/",
    response_model=List[SocialAccountResponse],
    tags=["Social Accounts"],
)
def list_social_accounts(
    client_id: Optional[int] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_id = _resolve_target_id(
        current_user,
        client_id,
    )

    accounts = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.user_id == target_id,
            SocialAccount.is_connected.is_(True),
        )
        .order_by(SocialAccount.id.asc())
        .all()
    )

    return accounts


@router.post(
    "/",
    response_model=SocialAccountResponse,
    tags=["Social Accounts"],
)
def connect_social_account(
    account: SocialAccountCreate,
    client_id: Optional[int] = None,
    current_user=Depends(get_current_user),
):
    target_id = _resolve_target_id(
        current_user,
        client_id,
    )

    return service.create_account(
        target_id,
        account.platform,
        account.account_name,
    )


@router.get(
    "/facebook/login",
    tags=["Facebook & Instagram"],
)
def facebook_login(
    client_id: Optional[int] = None,
    current_user=Depends(get_current_user),
):
    target_id = _resolve_target_id(
        current_user,
        client_id,
    )

    url = facebook.get_login_url(
        state=str(target_id)
    )

    return {
        "url": url,
    }


@router.get(
    "/facebook/callback",
    tags=["Facebook & Instagram"],
)
async def facebook_callback(
    code: str,
    state: str,
):
    try:
        user_id = int(state)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Invalid OAuth state.",
        )

    try:
        token_data = (
            await facebook.exchange_code_for_token(
                code
            )
        )

        user_access_token = token_data.get(
            "access_token"
        )

        if not user_access_token:
            raise ValueError(
                "Facebook OAuth did not return an access token."
            )

        pages = (
            await facebook.get_user_pages(
                user_access_token
            )
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    if not pages:
        raise HTTPException(
            status_code=422,
            detail=(
                "No Facebook Pages found for this user. "
                "You must manage at least one Facebook Page."
            ),
        )

    page = pages[0]

    page_id = page.get("id")
    page_name = page.get("name")
    page_access_token = page.get(
        "access_token"
    )

    if not page_id:
        raise HTTPException(
            status_code=422,
            detail="Facebook did not return a Page ID.",
        )

    if not page_name:
        raise HTTPException(
            status_code=422,
            detail="Facebook did not return a Page name.",
        )

    if not page_access_token:
        raise HTTPException(
            status_code=422,
            detail=(
                "Facebook did not return a Page access token."
            ),
        )

    service.create_account_from_oauth(
        user_id=user_id,
        platform="facebook",
        account_name=page_name,
        token_data={
            "access_token": page_access_token,
            "expires_in": token_data.get(
                "expires_in"
            ),
        },
        real_account_id=str(page_id),
    )

    return RedirectResponse(
        url="http://localhost:5173/app/accounts"
    )


@router.get(
    "/instagram/login",
    tags=["Facebook & Instagram"],
)
def instagram_login(
    client_id: Optional[int] = None,
    current_user=Depends(get_current_user),
):
    target_id = _resolve_target_id(
        current_user,
        client_id,
    )

    url = instagram.get_login_url(
        state=str(target_id)
    )

    return {
        "url": url,
    }


@router.get(
    "/instagram/callback",
    tags=["Facebook & Instagram"],
)
async def instagram_callback(
    code: str,
    state: str,
):
    try:
        user_id = int(state)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Invalid OAuth state.",
        )

    try:
        token_data = (
            await instagram.exchange_code_for_token(
                code
            )
        )

        user_access_token = token_data.get(
            "access_token"
        )

        if not user_access_token:
            raise ValueError(
                "Instagram OAuth did not return an access token."
            )

        ig_account = (
            await instagram.get_instagram_business_account(
                user_access_token
            )
        )

    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    instagram_account_id = ig_account.get(
        "instagram_account_id"
    )

    instagram_username = ig_account.get(
        "instagram_username"
    )

    page_name = ig_account.get(
        "page_name"
    )

    page_access_token = ig_account.get(
        "page_access_token"
    )

    if not instagram_account_id:
        raise HTTPException(
            status_code=422,
            detail=(
                "Instagram did not return an Instagram account ID."
            ),
        )

    if not page_access_token:
        raise HTTPException(
            status_code=422,
            detail=(
                "Instagram did not return a Page access token."
            ),
        )

    account_name = (
        instagram_username
        or page_name
        or "Instagram Account"
    )

    service.create_account_from_oauth(
        user_id=user_id,
        platform="instagram",
        account_name=account_name,
        token_data={
            "access_token": page_access_token,
            "expires_in": token_data.get(
                "expires_in"
            ),
        },
        real_account_id=str(
            instagram_account_id
        ),
    )

    return RedirectResponse(
        url="http://localhost:5173/app/accounts"
    )


@router.get(
    "/{account_id}",
    response_model=SocialAccountResponse,
    tags=["Social Accounts"],
)
def get_social_account(
    account_id: int,
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.get_account(
        user_id,
        account_id,
    )


@router.delete(
    "/{account_id}",
    tags=["Social Accounts"],
)
def disconnect_social_account(
    account_id: int,
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.delete_account(
        user_id,
        account_id,
    )


@router.post(
    "/{account_id}/sync",
    tags=["Social Accounts"],
)
def sync_social_account(
    account_id: int,
    current_user=Depends(get_current_user),
):
    user_id = _get_user_id(current_user)

    return service.sync_account(
        user_id,
        account_id,
    )