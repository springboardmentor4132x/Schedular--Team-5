
from fastapi import HTTPException, status

INVALID_SCHEDULED_TIME_EXCEPTION = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Scheduled time must be in the future"
)
