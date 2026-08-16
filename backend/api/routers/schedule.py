
from api.core.celery_setup import celery_app
from api.dependencies.database import get_db
from api.exceptions.tasks import INVALID_SCHEDULED_TIME_EXCEPTION
from api.models.post import Post
from api.models.schedule import Schedule
from api.roles.social_account import Platform
from api.models.social_account import SocialAccount
from api.models.publishing_log import PublishingLog
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

router = APIRouter(prefix="/schedule", tags=["Posts"])

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

    return {"message": f"Post scheduled successfully for {account.platform}", "task_id": task.id}

# @router.put("/posts/{post_id}/cancel")
# async def cancel_scheduled_post(
#     post_id: int,
#     db: Annotated[Session, Depends(get_db)]
# ) -> Dict:
    
#     post = db.query(Schedule).filter(Schedule.id == post_id).first()
    
#     if post.status != PostStatus.SCHEDULED:
#         raise HTTPException(status_code=400, detail="Only scheduled posts can be cancelled")
        
#     # Assuming you saved the Celery task_id to your Post model when you scheduled it
#     if post.celery_task_id:
#         celery_app.control.revoke(post.celery_task_id, terminate=True)
        
#     post.status = PostStatus.CANCELLED
#     db.add(PublishingLog(post_id=post.id, status_changed_to=PostStatus.CANCELLED, message="User manually cancelled the post."))
#     db.commit()
    
#     return {"message": "Post successfully pulled from the publishing queue"}
