
from enum import Enum

class Status(str, Enum):
    ADMIN = "admin"
    INDIVIDUAL = "individual"
    ORGANIZATION = "organization"
