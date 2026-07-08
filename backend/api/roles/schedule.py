
from enum import Enum

class Status(str, Enum):
    
    PENDING = "pending"
    EXECUTED = "executed"
    FAILED = "failed"
    CANCELLED = "cancelled"
