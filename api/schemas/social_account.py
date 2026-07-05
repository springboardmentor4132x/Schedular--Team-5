from pydantic import BaseModel

class SocialAccountBase(BaseModel):
    platform: str
    account_name: str

class SocialAccountCreate(SocialAccountBase):
    pass

class SocialAccountResponse(SocialAccountBase):
    id: int
    status: str

    class Config:
        from_attributes = True
        