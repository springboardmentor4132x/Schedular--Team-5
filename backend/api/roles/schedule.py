
from enum import Enum

class Status(str, Enum):
    
    PENDING = "pending"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    SCHEDULED = "scheduled"

class RecurrenceType(str, Enum):

    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
