from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from api.roles.social_account import Platform


class SocialAccountBase(BaseModel):
    platform: Platform
    account_name: str

    @field_validator("account_name")
    @classmethod
    def validate_account_name(cls, value: str):
        value = value.strip()

        if not value:
            raise ValueError("account_name cannot be empty")

        if len(value) > 100:
            raise ValueError(
                "account_name cannot exceed 100 characters"
            )

        return value


class SocialAccountCreate(SocialAccountBase):
    pass


class SocialAccountResponse(SocialAccountBase):
    id: int
    account_id: str
    is_connected: bool
    token_expiry: datetime | None = None
    permissions: list[str] | None = None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )