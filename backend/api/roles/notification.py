
from enum import Enum

class NotificationType(str, Enum):
    
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
