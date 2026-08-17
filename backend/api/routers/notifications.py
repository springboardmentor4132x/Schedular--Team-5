from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.dependencies.database import get_db
from api.models.publishing_log import PublishingLog
from sqlalchemy import desc
from typing import Annotated, Dict

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/")
async def get_user_notifications(

    db: Annotated[Session, Depends(get_db)],
    limit: int = 20

) -> Dict:

    recent_logs = db.query(PublishingLog).order_by(desc(PublishingLog.created_at)).limit(limit).all()
    
    notifications = []
    for log in recent_logs:
        notifications.append({
            "id": log.id,
            "post_id": log.post_id,
            "status": log.status_changed_to.value if log.status_changed_to else "UPDATE",
            "message": log.message,
            "timestamp": log.created_at,
            "is_read": False 
        })
        
    return {
        "notifications": notifications,
        "unread_count": len(notifications)
    }
