
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, field_validator
from api.roles.schedule import RecurrenceType, Status

class ScheduleCreate(BaseModel):

    post_id: int
    social_account_id: str
    scheduled_time: datetime
    is_recurring: bool = False
    recurrence_type: RecurrenceType = RecurrenceType.NONE
    recurrence_end_date: datetime | None = None

    @field_validator("scheduled_time")
    @classmethod
    def must_be_future(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            raise ValueError("scheduled_time must be timezone-aware")
        if v <= datetime.now(timezone.utc):
            raise ValueError("scheduled_time must be in the future")
        return v

class ScheduleResponse(BaseModel):

    id: int
    post_id: int
    social_account_id: str
    scheduled_time: datetime
    executed_time: datetime | None
    status: Status
    is_recurring: bool
    recurrence_type: RecurrenceType
    retry_count: int
    failure_reason: str | None

    model_config = ConfigDict(from_attributes=True)
