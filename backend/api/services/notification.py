from api.database.session import SessionLocal
from api.models.notification import Notification


def get_notifications(user_id: int):
    db = SessionLocal()

    try:
        return (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id
            )
            .order_by(
                Notification.created_at.desc()
            )
            .all()
        )

    finally:
        db.close()


def mark_notification_as_read(
    user_id: int,
    notification_id: int,
):
    db = SessionLocal()

    try:
        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
            .first()
        )

        if not notification:
            raise ValueError(
                f"Notification {notification_id} not found"
            )

        notification.is_read = True

        db.commit()
        db.refresh(notification)

        return notification

    finally:
        db.close()


def mark_all_notifications_as_read(
    user_id: int,
):
    db = SessionLocal()

    try:
        notifications = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == False,
            )
            .all()
        )

        for notification in notifications:
            notification.is_read = True

        db.commit()

        return {
            "message": "All notifications marked as read"
        }

    finally:
        db.close()


def delete_notification(
    user_id: int,
    notification_id: int,
):
    db = SessionLocal()

    try:
        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
            .first()
        )

        if not notification:
            raise ValueError(
                f"Notification {notification_id} not found"
            )

        db.delete(notification)
        db.commit()

        return {
            "message": (
                f"Notification {notification_id} deleted successfully"
            )
        }

    finally:
        db.close()


def clear_notifications(
    user_id: int,
):
    db = SessionLocal()

    try:
        notifications = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id
            )
            .all()
        )

        for notification in notifications:
            db.delete(notification)

        db.commit()

        return {
            "message": "All notifications cleared successfully"
        }

    finally:
        db.close()