import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from api.database.base import Base


class PlatformEnum(str, enum.Enum):
    facebook = "facebook"
    instagram = "instagram"
    linkedin = "linkedin"
    twitter = "twitter"
    youtube = "youtube"
    pinterest = "pinterest"


class StatusEnum(str, enum.Enum):
    connected = "connected"
    disconnected = "disconnected"
    expired = "expired"
    error = "error"


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(Enum(PlatformEnum), nullable=False)
    account_name = Column(String, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.connected, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="social_accounts")