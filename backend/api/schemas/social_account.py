from pydantic import BaseModel, field_validator
from datetime import datetime

SUPPORTED_PLATFORMS = ["instagram", "facebook", "linkedin", "twitter", "youtube", "pinterest"]


class SocialAccountBase(BaseModel):
    platform: str
    account_name: str

    @field_validator("platform")
    @classmethod
    def validate_platform(cls, value):
        if value.lower() not in SUPPORTED_PLATFORMS:
            raise ValueError(f"platform must be one of {SUPPORTED_PLATFORMS}")
        return value.lower()


class SocialAccountCreate(SocialAccountBase):
    pass


class SocialAccountResponse(SocialAccountBase):
    id: int
    account_id: str
    is_connected: bool
    token_expiry: datetime | None = None
    permissions: list[str] | None = None
    created_at: datetime

    class Config:
        from_attributes = True