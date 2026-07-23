from celery import Celery
from celery.schedules import schedule

celery_app = Celery(
    "socialpilot",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=[
        "api.tasks.publish",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",

    timezone="UTC",
    enable_utc=True,

    task_track_started=True,

    beat_schedule={
        "check-scheduled-posts-every-30-seconds": {
            "task": "api.tasks.publish.check_scheduled_posts",
            "schedule": schedule(30.0),
        },
    },
)