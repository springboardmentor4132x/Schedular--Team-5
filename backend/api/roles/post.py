
from enum import Enum

class Status(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHING = "publishing"
    FAILED = "failed"
    CANCELLED = "cancelled"
