
from api.database.base import Base
from datetime import datetime
from sqlalchemy import Boolean, DateTime, func, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(40),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    type: Mapped[str] = mapped_column(
        String(7),
        nullable=False,
        default="info"
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    related_post_id: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    related_campaign_id: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )
