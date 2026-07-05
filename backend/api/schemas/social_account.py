from pydantic import BaseModel, field_validator

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
    status: str

    class Config:
        from_attributes = True
        