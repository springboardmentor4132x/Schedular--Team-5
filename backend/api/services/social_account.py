from fastapi import HTTPException

mock_accounts = [
    {"id": 1, "platform": "instagram", "account_name": "demo_account", "status": "connected"},
    {"id": 2, "platform": "facebook", "account_name": "demo_page", "status": "connected"},
]

def list_accounts():
    return mock_accounts

def create_account(platform: str, account_name: str):
    new_account = {
        "id": len(mock_accounts) + 1,
        "platform": platform,
        "account_name": account_name,
        "status": "connected",
    }
    mock_accounts.append(new_account)
    return new_account

def get_account(account_id: int):
    for account in mock_accounts:
        if account["id"] == account_id:
            return account
    raise HTTPException(status_code=404, detail=f"Account {account_id} not found")

def delete_account(account_id: int):
    global mock_accounts
    account_exists = any(a["id"] == account_id for a in mock_accounts)
    if not account_exists:
        raise HTTPException(status_code=404, detail=f"Account {account_id} not found")
    mock_accounts = [a for a in mock_accounts if a["id"] != account_id]
    return {"message": f"Account {account_id} disconnected"}
    