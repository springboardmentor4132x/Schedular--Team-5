
from api.database.base import Base
from datetime import datetime
from sqlalchemy import Boolean, DateTime, func, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

class SocialAccount(Base):
    __tablename__ = "socialaccounts"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    platform: Mapped[str] = mapped_column(
        String(9),
        nullable=False
    )

    account_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    account_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    access_token: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    refresh_token: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    token_expiry: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    profile_picture: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    is_connected: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )
