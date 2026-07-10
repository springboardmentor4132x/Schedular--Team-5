
from api.core.logger import get_logger
from api.database.session import engine
from sqlalchemy import text

logger = get_logger(__name__)


def init_db() -> None:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection established successfully.")

    except Exception:
        logger.exception("Failed to connect to the database.")
        raise
