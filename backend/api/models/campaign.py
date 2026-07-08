
from api.database.base import Base
from api.roles.campaign import Status
from api.roles.social_account import Platform
from datetime import datetime
from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, func, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

class Campaign(Base):

    __tablename__ = "campaigns"

    __table_args__ = (
        UniqueConstraint("user_id", "title", name="uq_user_campaign_title"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        String(300),
        nullable=False
    )

    platform: Mapped[Platform | None] = mapped_column(
        SAEnum(Platform, name="social_platform", native_enum=False, length=20,
               values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=True
    )

    budget: Mapped[float | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    objectives: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    status: Mapped[Status] = mapped_column(
        SAEnum(Status, name="campaign_status", native_enum=False, length=20,
               values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=False,
        default=Status.DRAFT
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
    
    user: Mapped["User"] = relationship(back_populates="campaigns")

    posts: Mapped[List["Post"]] = relationship(back_populates="campaign")
 
    def __repr__(self) -> str:
        return f"<Campaign id={self.id} title={self.title!r} status={self.status}>"
