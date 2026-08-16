from celery import Celery
from celery.schedules import crontab


celery_app = Celery(
    "socialpilot",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=[
        "api.tasks.publish",
        "api.tasks.analytics_sync",
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
        "check-scheduled-posts-every-minute": {
            "task": "api.tasks.publish.check_scheduled_posts",
            "schedule": crontab(minute="*"),
        },
        "sync-platform-analytics-hourly": {
            "task": "api.tasks.analytics_sync.sync_platform_analytics",
            "schedule": crontab(minute="0"),
        },
    },
)
