from fastapi import HTTPException

class SocialAccountNotFoundException(HTTPException):
    def __init__(self, account_id: int):
        super().__init__(status_code=404, detail=f"Account {account_id} not found")