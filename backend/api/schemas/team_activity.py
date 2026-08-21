
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TeamActivityResponse(BaseModel):
    id: int
    user_id: int
    activity_type: str
    title: str
    description: str
    related_campaign_id: int | None = None
    related_post_id: int | None = None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
