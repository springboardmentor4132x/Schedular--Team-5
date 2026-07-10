
from api.core.config import settings
import logging

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)

def get_logger(
    name: str
) -> logging.Logger:
    return logging.getLogger(name)
