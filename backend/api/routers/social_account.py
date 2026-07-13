from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse

from api.schemas.social_account import SocialAccountCreate, SocialAccountResponse
from api.services import social_account as service
from api.auth.auth import get_current_user
from api.services.user import get_users
from api.integrations import facebook, instagram

router = APIRouter(prefix="/social-accounts", tags=["Social Accounts"])


def _get_user_id(current_user: dict) -> int:
    """Look up the numeric user id from the username in the token."""
    users = get_users()
    for user in users:
        if user.username == current_user["username"]:
            return user.id
    raise Exception("User not found")


@router.get("/", response_model=list[SocialAccountResponse])
def list_social_accounts(current_user=Depends(get_current_user)):
    user_id = _get_user_id(current_user)
    return service.list_accounts(user_id)


@router.post("/", response_model=SocialAccountResponse)
def connect_social_account(account: SocialAccountCreate, current_user=Depends(get_current_user)):
    user_id = _get_user_id(current_user)
    return service.create_account(user_id, account.platform, account.account_name)


@router.get("/{account_id}", response_model=SocialAccountResponse)
def get_social_account(account_id: int, current_user=Depends(get_current_user)):
    user_id = _get_user_id(current_user)
    return service.get_account(user_id, account_id)


@router.delete("/{account_id}")
def disconnect_social_account(account_id: int, current_user=Depends(get_current_user)):
    user_id = _get_user_id(current_user)
    return service.delete_account(user_id, account_id)


@router.post("/{account_id}/sync")
def sync_social_account(account_id: int, current_user=Depends(get_current_user)):
    user_id = _get_user_id(current_user)
    return service.sync_account(user_id, account_id)


@router.get("/facebook/login")
def facebook_login(current_user=Depends(get_current_user)):
    """
    Redirects the user to Facebook's real login/consent screen,
    passing the user's id through the state parameter.
    """
    user_id = _get_user_id(current_user)
    url = facebook.get_login_url(state=str(user_id))
    return RedirectResponse(url)


@router.get("/facebook/callback")
async def facebook_callback(code: str, state: str):
    """
    Facebook redirects here after the user approves permissions.
    'state' contains the user_id we passed during login.
    """
    user_id = int(state)
    token_data = await facebook.exchange_code_for_token(code)

    account = service.create_account_from_oauth(
        user_id=user_id,
        platform="facebook",
        account_name="Facebook Page",
        token_data=token_data
    )

    return account


@router.get("/instagram/login")
def instagram_login(current_user=Depends(get_current_user)):
    """
    Redirects the user to Instagram's (Meta) real login/consent screen,
    passing the user's id through the state parameter.
    """
    user_id = _get_user_id(current_user)
    url = instagram.get_login_url(state=str(user_id))
    return RedirectResponse(url)


@router.get("/instagram/callback")
async def instagram_callback(code: str, state: str):
    """
    Meta redirects here after the user approves Instagram permissions.
    'state' contains the user_id we passed during login.
    """
    user_id = int(state)
    token_data = await instagram.exchange_code_for_token(code)
    user_access_token = token_data["access_token"]

    try:
        ig_account = await instagram.get_instagram_business_account(user_access_token)
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=f"{e} This is expected while the app is in Meta Development Mode without App Review."
        )

    account = service.create_account_from_oauth(
        user_id=user_id,
        platform="instagram",
        account_name=ig_account["instagram_username"] or ig_account["page_name"],
        token_data={
            "access_token": ig_account["page_access_token"],
            "expires_in": token_data.get("expires_in"),
        },
    )

    return account