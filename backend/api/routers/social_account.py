from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from typing import Optional, List
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
    """Local session generator to guarantee compatibility."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _get_user_id(current_user: dict) -> int:
    users = get_users()

    for user in users:
        if user.username == current_user["username"]:
            return user.id

    raise HTTPException(
        status_code=404,
        detail="User not found",
    )


def _resolve_target_id(current_user, client_id: Optional[int]) -> int:
    user_id = _get_user_id(current_user)
    
    is_marketing = False
    if isinstance(current_user, dict) and current_user.get("role") == "marketing_team":
        is_marketing = True
    elif hasattr(current_user, "role") and getattr(current_user, "role") == "marketing_team":
        is_marketing = True

    if is_marketing and client_id is not None:
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
    print(f"DEBUG: Received client_id query param -> {client_id} (type: {type(client_id)})")
    if client_id is not None:
        try:
            accounts = db.query(SocialAccount).filter(
                (SocialAccount.client_id == client_id) | 
                (SocialAccount.client_id == str(client_id))
            ).all()
            print(f"DEBUG: Found accounts in DB -> {accounts}")
            return accounts
        except Exception as e:
            print(f"DEBUG ERROR: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    target_id = _resolve_target_id(current_user, client_id)
    return service.list_accounts(target_id)

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
    target_id = _resolve_target_id(current_user, client_id)
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
    target_id = _resolve_target_id(current_user, client_id)
    url = facebook.get_login_url(
        state=str(target_id)
    )

    return {
        "url": url
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

        user_access_token = token_data[
            "access_token"
        ]

        pages = (
            await facebook.get_user_pages(
                user_access_token
            )
        )

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
                "You must manage at least one Page "
                "to connect Facebook."
            ),
        )

    page = pages[0]

    # Explicitly enforce saving strictly as Facebook, ignoring any side-effects
    service.create_account_from_oauth(
        user_id=user_id,
        platform="facebook",
        account_name=page["name"],
        token_data={
            "access_token": page[
                "access_token"
            ],
            "expires_in": token_data.get(
                "expires_in"
            ),
        },
        real_account_id=page["id"],
    )

    return RedirectResponse(url="http://localhost:5173/app/accounts")


@router.get(
    "/instagram/login",
    tags=["Facebook & Instagram"],
)
def instagram_login(
    client_id: Optional[int] = None,
    current_user=Depends(get_current_user),
):
    target_id = _resolve_target_id(current_user, client_id)
    url = instagram.get_login_url(
        state=str(target_id)
    )

    return {
        "url": url
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

        user_access_token = token_data[
            "access_token"
        ]

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

    # Strictly save as Instagram platform
    service.create_account_from_oauth(
        user_id=user_id,
        platform="instagram",
        account_name=(
            ig_account[
                "instagram_username"
            ]
            or ig_account["page_name"]
        ),
        token_data={
            "access_token": ig_account[
                "page_access_token"
            ],
            "expires_in": token_data.get(
                "expires_in"
            ),
        },
        real_account_id=ig_account[
            "instagram_account_id"
        ],
    )

    return RedirectResponse(url="http://localhost:5173/app/accounts")


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