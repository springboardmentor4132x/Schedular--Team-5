
from api.core.celery_setup import celery_app
from api.dependencies.database import get_db
from api.exceptions.tasks import INVALID_SCHEDULED_TIME_EXCEPTION
from api.models.post import Post
from api.models.schedule import Schedule
from api.roles.social_account import Platform
from api.models.social_account import SocialAccount
from api.roles.post import MediaType, Status as PostStatus
from api.roles.schedule import Status as ScheduleStatus
from api.tasks.youtube import publish_to_youtube
from api.tasks.linkedin import publish_to_linkedin
from api.schemas.post import SchedulePost
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, Dict
from sqlalchemy.orm import Session
import mimetypes
import uuid

router = APIRouter(prefix="/schedule", tags=["Posts Scheduling Routes"])

@router.post("/post")
def schedule_youtube_post(payload: SchedulePost, db: Annotated[Session, Depends(get_db)]):
    account = db.query(SocialAccount).filter(
        SocialAccount.user_id == payload.user_id,
        SocialAccount.account_id == payload.account_id
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="social account not found for this user. Please connect your account first."
        )

    scheduled_time = payload.scheduled_time

    if scheduled_time.tzinfo is None:
        scheduled_time = scheduled_time.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)
    if scheduled_time <= now:
        raise INVALID_SCHEDULED_TIME_EXCEPTION

    post_media_type = MediaType.TEXT
    if payload.media_url:
        mime_type, _ = mimetypes.guess_type(payload.media_url)
        if mime_type and mime_type.startswith("image"):
            post_media_type = MediaType.IMAGE
        else:
            post_media_type = MediaType.VIDEO

    new_post = Post(
        user_id=payload.user_id,
        content=payload.content,
        media_url=payload.media_url,
        media_type=post_media_type,
        status=PostStatus.SCHEDULED,
        scheduled_time=scheduled_time
    )
    db.add(new_post)
    db.flush()

    temp_task_id = str(uuid.uuid4())
    new_schedule = Schedule(
        user_id=payload.user_id,
        post_id=new_post.id,
        social_account_id=account.id,
        scheduled_time=scheduled_time,
        status=ScheduleStatus.SCHEDULED,
        celery_task_id=temp_task_id
    )
    db.add(new_schedule)
    db.commit()

    if account.platform == Platform.LINKEDIN:
        task = publish_to_linkedin.apply_async(  # type: ignore
            args=[new_schedule.id],
            eta=scheduled_time
        )
    elif account.platform == Platform.YOUTUBE:
        if not new_post.media_url:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A media_url (video file) is required for YouTube posts.")
            
        task = publish_to_youtube.apply_async(  # type: ignore
            args=[new_schedule.id],
            eta=scheduled_time
        )
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported platform for scheduling")

    new_schedule.celery_task_id = task.id
    db.commit()

    return {
        "message": f"Post scheduled successfully for {account.platform}", "task_id": task.id
    }

@router.put("/{schedule_id}/cancel")
async def cancel_scheduled_post(
    schedule_id: int,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Scheduled task not found."
        )
        
    if schedule.status in [ScheduleStatus.PUBLISHED, ScheduleStatus.PUBLISHING, ScheduleStatus.FAILED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Cannot cancel a post that is already in '{schedule.status.value}' state."
        )
        
    if schedule.status == ScheduleStatus.CANCELLED:
        return {"message": "Schedule is already cancelled."}

    if schedule.celery_task_id:
        celery_app.control.revoke(schedule.celery_task_id, terminate=True)
        
    schedule.status = ScheduleStatus.CANCELLED
    db.commit()
    
    return {
        "message": "Scheduled post cancelled successfully",
        "schedule_id": schedule.id,
        "status": schedule.status.value
    }
