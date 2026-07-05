from fastapi import APIRouter
from api.schemas.social_account import SocialAccountCreate, SocialAccountResponse

router = APIRouter(prefix="/social-accounts", tags=["Social Accounts"])

# Fake in-memory data just so the endpoints work today
mock_accounts = [
    {"id": 1, "platform": "instagram", "account_name": "demo_account", "status": "connected"},
    {"id": 2, "platform": "facebook", "account_name": "demo_page", "status": "connected"},
]

@router.get("/", response_model=list[SocialAccountResponse])
def list_social_accounts():
    return mock_accounts

@router.post("/", response_model=SocialAccountResponse)
def connect_social_account(account: SocialAccountCreate):
    new_account = {
        "id": len(mock_accounts) + 1,
        "platform": account.platform,
        "account_name": account.account_name,
        "status": "connected",
    }
    mock_accounts.append(new_account)
    return new_account

@router.delete("/{account_id}")
def disconnect_social_account(account_id: int):
    global mock_accounts
    mock_accounts = [a for a in mock_accounts if a["id"] != account_id]
    return {"message": f"Account {account_id} disconnected"}
    