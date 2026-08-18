
from api.core.config import settings
from celery import Celery

celery_app = Celery(
    "social_pilot",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "api.tasks.linkedin",
        "api.tasks.youtube"
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_transport_options={'protocol': 2},
    result_backend_transport_options={'protocol': 2}
)
