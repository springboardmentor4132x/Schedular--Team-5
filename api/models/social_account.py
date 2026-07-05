from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

class SocialAccount:
    def __init__(self, id, user_id, platform, account_name, status="connected"):
        self.id = id
        self.user_id = user_id
        self.platform = platform
        self.account_name = account_name
        self.status = status