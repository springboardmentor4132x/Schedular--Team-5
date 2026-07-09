
from enum import Enum

class Role(str, Enum):

    CONTENT_CREATOR = "content_creator"
    MARKETING_TEAM = "marketing_team"
    BUSINESS_USER = "business_user"
    ADMINISTRATOR = "administrator"
