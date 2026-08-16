
from sqlalchemy.orm import Session
from api.core.celery_setup import celery_app
from api.core.config import settings
from api.database.session import SessionLocal
from api.models.schedule import Schedule
from api.models.publishing_log import PublishingLog
from api.utils.email import send_mock_email
from api.models.social_account import SocialAccount
from api.models.post import Post
from api.roles.post import Status as PostStatus
from api.roles.schedule import Status as ScheduleStatus
from datetime import datetime, timezone, timedelta
from typing import Dict
import httpx
import json

@celery_app.task(
        bind=True
)
def publish_to_youtube(self, schedule_id: int) -> Dict | str:
    db: Session = SessionLocal()
    schedule = None
    post = None
    
    try:
        schedule = db.query(Schedule).get(schedule_id)
        if not schedule or schedule.status == ScheduleStatus.CANCELLED:
            return "Task cancelled or not found"

        post = db.query(Post).get(schedule.post_id)
        account = db.query(SocialAccount).get(schedule.social_account_id)

        if not post or not account or not post.media_url:
            schedule.status = ScheduleStatus.FAILED
            db.commit()
            return "Post, Account, or Video Media URL missing"

        schedule.status = ScheduleStatus.PUBLISHING
        db.commit()

        if account.token_expiry and datetime.now(timezone.utc) >= account.token_expiry - timedelta(minutes=5):
            res = httpx.post("https://oauth2.googleapis.com/token", data={
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "refresh_token": account.refresh_token,
                "grant_type": "refresh_token"
            })
            res.raise_for_status()
            token_json = res.json()
            account.access_token = token_json["access_token"]
            account.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=token_json["expires_in"])
            db.commit()

        url = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status"
        headers = {"Authorization": f"Bearer {account.access_token}"}
        
        title = post.content[:50] + "..." if len(post.content) > 50 else post.content # type: ignore
        
        metadata = {
            "snippet": {
                "title": title,
                "description": post.content,
                "categoryId": "22"
            },
            "status": {
                "privacyStatus": "public"
            }
        }

        with open(post.media_url, "rb") as video_file:
            files = {
                "metadata": (None, json.dumps(metadata), "application/json"),
                "file": ("video.mp4", video_file, "video/mp4")
            }
            response = httpx.post(url, headers=headers, files=files, timeout=120.0)
            response.raise_for_status()

        schedule.status = ScheduleStatus.PUBLISHED
        schedule.executed_time = datetime.now(timezone.utc)
        post.status = PostStatus.PUBLISHED
        send_mock_email(
            user_email="yashant.thakur2007@gmail.com", # In production, this would be post.user.email
            subject="Your post is live!",
            message="Your scheduled post was successfully published."
        )
        db.add(PublishingLog(post_id=post.id, status_changed_to=PostStatus.PUBLISHED, message="Successfully published post."))
        db.commit()
        
        return "Successfully published to YouTube"

    except httpx.HTTPStatusError as e:
        print(f"YOUTUBE API ERROR: {e.response.text}")
        if schedule:
            schedule.status = ScheduleStatus.FAILED
            db.commit()
        raise e
    except Exception as e:
        if schedule:
            schedule.status = ScheduleStatus.FAILED
        if post:
            post.status = PostStatus.FAILED
            db.add(PublishingLog(post_id=post.id, status_changed_to=PostStatus.FAILED, message=str(e)))
        raise e
    finally:
        db.close()
