from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.database.base import Base
from api.roles.post import MediaType, Status


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    campaign_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "campaigns.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    content: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    media_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    media_urls: Mapped[list[str] | None] = mapped_column(
        JSON,
        nullable=True,
    )

    media_type: Mapped[MediaType] = mapped_column(
        SAEnum(
            MediaType,
            name="post_media_type",
            native_enum=False,
            length=15,
            values_callable=lambda enum_cls: [
                item.value
                for item in enum_cls
            ],
        ),
        nullable=False,
    )

    scheduled_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    timezone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        default="Asia/Kolkata",
    )

    published_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    status: Mapped[Status] = mapped_column(
        SAEnum(
            Status,
            name="post_status",
            native_enum=False,
            length=20,
            values_callable=lambda enum_cls: [
                item.value
                for item in enum_cls
            ],
        ),
        nullable=False,
        default=Status.DRAFT,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    user: Mapped["User"] = relationship(
        back_populates="posts",
    )

    campaign: Mapped["Campaign | None"] = relationship(
        back_populates="posts",
    )

    schedules: Mapped[list["Schedule"]] = relationship(
        back_populates="post",
        cascade="all, delete-orphan",
    )

    post_social_accounts: Mapped[
        list["PostSocialAccount"]
    ] = relationship(
        back_populates="post",
        cascade="all, delete-orphan",
    )

    logs: Mapped[list["PublishingLog"]] = relationship(
        "PublishingLog",
        back_populates="post",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Post "
            f"id={self.id} "
            f"status={self.status} "
            f"media_type={self.media_type}>"
        )