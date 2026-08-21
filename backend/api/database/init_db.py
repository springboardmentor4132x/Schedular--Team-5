from api.core.logger import get_logger
from api.database.session import engine
from api.database.base import Base

from api.models.user import User
from api.models.business_assignment import BusinessAssignment
from api.models.social_account import SocialAccount
from api.models.post import Post
from api.models.post_social_account import PostSocialAccount
from api.models.campaign import Campaign
from api.models.notification import Notification

logger = get_logger(__name__)


def init_db() -> None:
    try:
        Base.metadata.create_all(bind=engine)

        logger.info(
            "Database tables created successfully."
        )

    except Exception:
        logger.exception(
            "Failed to initialize database tables."
        )
        raise