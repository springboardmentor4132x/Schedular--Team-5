from datetime import datetime
<<<<<<< HEAD
from pydantic import BaseModel, ConfigDict, Field, model_validator
=======

from pydantic import BaseModel
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)

from api.roles.campaign import Status
from api.roles.social_account import Platform


class CampaignCreate(BaseModel):
<<<<<<< HEAD

    title: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    description: str = Field(
        ...,
        min_length=1,
        max_length=300
    )

    platform: Platform | None = None

    budget: float | None = Field(
        default=None,
        ge=0
    )

    objectives: str | None = Field(
        default=None,
        max_length=500
    )

    start_date: datetime

    end_date: datetime | None = None

    status: Status = Status.DRAFT

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "end_date must be greater than or equal to start_date"
            )

        return self


class CampaignUpdate(BaseModel):

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    description: str | None = Field(
        default=None,
        min_length=1,
        max_length=300
    )

    platform: Platform | None = None

    budget: float | None = Field(
        default=None,
        ge=0
    )

    objectives: str | None = Field(
        default=None,
        max_length=500
    )

    start_date: datetime | None = None

    end_date: datetime | None = None

    status: Status | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date is not None
            and self.end_date is not None
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
=======
    title: str
    description: str
    platform: Platform | None = None
    budget: float | None = None
    objectives: str | None = None
    start_date: datetime
    end_date: datetime | None = None


class CampaignUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    platform: Platform | None = None
    budget: float | None = None
    objectives: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: Status | None = None


class CampaignResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    platform: Platform | None = None
    budget: float | None = None
    objectives: str | None = None
    start_date: datetime
    end_date: datetime | None = None
    status: Status

    class Config:
        from_attributes = True
>>>>>>> f499e49 (Complete Module 3 backend and Campaign APIs)
