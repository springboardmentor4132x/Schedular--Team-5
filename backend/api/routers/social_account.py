from fastapi import APIRouter
from api.schemas.social_account import SocialAccountCreate, SocialAccountResponse
from api.services import social_account as service

router = APIRouter(prefix="/social-accounts", tags=["Social Accounts"])

@router.get("/", response_model=list[SocialAccountResponse])
def list_social_accounts():
    return service.list_accounts()

@router.post("/", response_model=SocialAccountResponse)
def connect_social_account(account: SocialAccountCreate):
    return service.create_account(account.platform, account.account_name)

@router.get("/{account_id}", response_model=SocialAccountResponse)
def get_social_account(account_id: int):
    return service.get_account(account_id)

@router.delete("/{account_id}")
def disconnect_social_account(account_id: int):
    return service.delete_account(account_id)