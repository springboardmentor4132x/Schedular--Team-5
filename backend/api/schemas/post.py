
from datetime import datetime
from pydantic import BaseModel

class SchedulePost(BaseModel):

    user_id: int
    account_id: int | str
    content: str
    scheduled_time: datetime
    media_url: str
