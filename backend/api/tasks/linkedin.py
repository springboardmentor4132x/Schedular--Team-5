import os
import httpx
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from api.core.celery_setup import celery_app
from api.database.session import SessionLocal
from api.models.schedule import Schedule
from api.models.publishing_log import PublishingLog
from api.utils.email import send_mock_email
from api.models.social_account import SocialAccount
from api.models.post import Post
from api.roles.post import Status as PostStatus, MediaType
from api.roles.schedule import Status as ScheduleStatus

@celery_app.task(
        bind=True
)
def publish_to_linkedin(self, schedule_id: int):
    db: Session = SessionLocal()
    schedule = None
    post = None
    
    try:
        schedule = db.query(Schedule).get(schedule_id)
        if not schedule or schedule.status == ScheduleStatus.CANCELLED:
            return "Task cancelled or not found"

        post = db.query(Post).get(schedule.post_id)
        account = db.query(SocialAccount).get(schedule.social_account_id)

        if not post or not account:
            schedule.status = ScheduleStatus.FAILED
            db.commit()
            return "Post or Account not found"

        schedule.status = ScheduleStatus.PUBLISHING
        db.commit()

        headers = {
            "Authorization": f"Bearer {account.access_token}",
            "LinkedIn-Version": "202607",
            "Content-Type": "application/json"
        }
        
        author_urn = f"urn:li:person:{account.account_id}"
        
        payload = {
            "author": author_urn,
            "commentary": post.content,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": []
            },
            "lifecycleState": "PUBLISHED"
        }

        if post.media_url and os.path.exists(post.media_url):
            media_urn = None
            
            with open(post.media_url, "rb") as file:
                file_bytes = file.read()

            if post.media_type == MediaType.IMAGE:
                init_res = httpx.post(
                    "https://api.linkedin.com/rest/images?action=initializeUpload",
                    json={"initializeUploadRequest": {"owner": author_urn}},
                    headers=headers
                )
                init_res.raise_for_status()
                upload_url = init_res.json()["value"]["uploadUrl"]
                media_urn = init_res.json()["value"]["image"]
                
                upload_res = httpx.put(upload_url, content=file_bytes, headers={"Authorization": f"Bearer {account.access_token}"})
                upload_res.raise_for_status()

            elif post.media_type == MediaType.VIDEO:
                init_res = httpx.post(
                    "https://api.linkedin.com/rest/videos?action=initializeUpload",
                    json={
                        "initializeUploadRequest": {
                            "owner": author_urn,
                            "fileSizeBytes": len(file_bytes)
                        }
                    },
                    headers=headers
                )
                init_res.raise_for_status()
                
                init_data = init_res.json()["value"]
                upload_url = init_data["uploadInstructions"][0]["uploadUrl"]
                media_urn = init_data["video"]
                upload_token = init_data.get("uploadToken", "")
                
                upload_headers = {
                    "Authorization": f"Bearer {account.access_token}",
                    "Content-Type": "application/octet-stream"
                }
                upload_res = httpx.put(upload_url, content=file_bytes, headers=upload_headers, timeout=120.0)
                upload_res.raise_for_status()
                
                etag = upload_res.headers.get("etag")
                
                finalize_res = httpx.post(
                    "https://api.linkedin.com/rest/videos?action=finalizeUpload",
                    json={
                        "finalizeUploadRequest": {
                            "video": media_urn,
                            "uploadToken": upload_token,
                            "uploadedPartIds": [etag]
                        }
                    },
                    headers=headers
                )
                finalize_res.raise_for_status()

            if media_urn:
                payload["content"] = {"media": {"id": media_urn}}

        response = httpx.post("https://api.linkedin.com/rest/posts", json=payload, headers=headers)
        response.raise_for_status()

        schedule.status = ScheduleStatus.PUBLISHED
        schedule.executed_time = datetime.now(timezone.utc)
        post.status = PostStatus.PUBLISHED
        send_mock_email(
            user_email="yashant.thakur2007@gmail.com",
            subject="Your post is live!",
            message="Your scheduled post was successfully published."
        )
        db.add(PublishingLog(post_id=post.id, status_changed_to=PostStatus.PUBLISHED, message="Successfully published post."))
        db.commit()
        
        return "Successfully published to LinkedIn"

    except httpx.HTTPStatusError as e:
        print(f"LINKEDIN API ERROR: {e.response.text}")
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
            db.commit()
        raise e
    finally:
        db.close()
