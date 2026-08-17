import time
from api.core.celery_setup import celery_app
from api.dependencies.database import get_db

from api.models.schedule import Schedule
from api.models.post import Post
from api.models.publishing_log import PublishingLog

from api.models.notification import Notification
from api.roles.notification import NotificationType
from api.roles.schedule import Status as ScheduleStatus
from api.roles.post import Status as PostStatus
from typing import Dict

@celery_app.task(bind=True, max_retries=3)
def schedule_twitter_post(
    self,
    schedule_id: int
) -> Dict:
    """Mocks publishing a tweet and updates logs & notifications."""
    db = next(get_db())
    try:
        time.sleep(2)  
        
        schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
        if not schedule:
            return {"status": "FAILED", "error": "Schedule not found"}

        post = db.query(Post).filter(Post.id == schedule.post_id).first()

        schedule.status = ScheduleStatus.PUBLISHED 
        if post:
            post.status = PostStatus.PUBLISHED

        new_log = PublishingLog(
            post_id=schedule.post_id,
            status_changed_to=PostStatus.PUBLISHED,  
            message="X post published successfully."
        )
        db.add(new_log)

        # --- NEW NOTIFICATION BLOCK ---
        new_notification = Notification(
            user_id=schedule.user_id, 
            title="Post Published",
            description="Your scheduled post for X was published successfully.",
            type=NotificationType.SUCCESS,
            related_post_id=schedule.post_id
        )
        db.add(new_notification)
        # ------------------------------

        db.commit()

        print(f"SUCCESS: Tweet published for schedule {schedule_id}")
        return {"status": "PUBLISHED", "platform": "X", "provider_post_id": "mock_tweet_999"}

    except Exception as exc:
        db.rollback()
        print(f"ERROR: Failed to publish tweet: {exc}")
        return {"status": "FAILED", "error": str(exc)}
    finally:
        db.close()

@celery_app.task(bind=True, max_retries=3)
def schedule_pinterest_post(
    self,
    schedule_id: int
) -> Dict:
    """Mocks publishing a pin and updates logs & notifications."""
    db = next(get_db())
    try:
        time.sleep(2) 
        
        schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
        if not schedule:
            return {"status": "FAILED", "error": "Schedule not found"}

        post = db.query(Post).filter(Post.id == schedule.post_id).first()

        schedule.status = ScheduleStatus.PUBLISHED
        if post:
            post.status = PostStatus.PUBLISHED

        new_log = PublishingLog(
            post_id=schedule.post_id,
            status_changed_to=PostStatus.PUBLISHED,  
            message="Pinterest pin published successfully."
        )
        db.add(new_log)

        # --- NEW NOTIFICATION BLOCK ---
        new_notification = Notification(
            user_id=schedule.user_id, 
            title="Pin Published",
            description="Your scheduled pin for Pinterest was published successfully.",
            type=NotificationType.SUCCESS,
            related_post_id=schedule.post_id
        )
        db.add(new_notification)
        # ------------------------------

        db.commit()

        print(f"SUCCESS: Pin published for schedule {schedule_id}")
        return {"status": "PUBLISHED", "platform": "PINTEREST", "provider_post_id": "mock_pin_999"}

    except Exception as exc:
        db.rollback()
        print(f"ERROR: Failed to publish pin: {exc}")
        return {"status": "FAILED", "error": str(exc)}

    finally:
        db.close()
