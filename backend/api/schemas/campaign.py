from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from api.roles.campaign import Status
from api.roles.social_account import Platform


class CampaignCreate(BaseModel):

    title: str = Field(..., min_length=1, max_length=100)

    description: str = Field(..., min_length=1, max_length=300)

    platform: Platform | None = None

    budget: float | None = Field(default=None, ge=0)

    objectives: str | None = Field(default=None, max_length=500)

    start_date: datetime

    end_date: datetime | None = None

    status: Status = Status.DRAFT

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date and self.end_date < self.start_date:
            raise ValueError(
                "end_date must be greater than or equal to start_date"
            )
        return self


class CampaignUpdate(BaseModel):

    title: str | None = Field(default=None, min_length=1, max_length=100)

    description: str | None = Field(default=None, min_length=1, max_length=300)

    platform: Platform | None = None

    budget: float | None = Field(default=None, ge=0)

    objectives: str | None = Field(default=None, max_length=500)

    start_date: datetime | None = None

    end_date: datetime | None = None

    status: Status | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date
            and self.end_date
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "end_date must be greater than or equal to start_date"
            )
        return self


class CampaignResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    user_id: int
    title: str
    description: str
    platform: Platform | None
    budget: float | None
    objectives: str | None
    start_date: datetime
    end_date: datetime | None
    status: Status
    created_at: datetime
    updated_at: datetime