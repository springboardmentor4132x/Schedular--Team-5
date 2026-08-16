from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.database.base import Base
from api.roles.social_account import Platform


class PostAnalytics(Base):
    __tablename__ = "post_analytics"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    post_id: Mapped[int] = mapped_column(
        ForeignKey(
            "posts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    social_account_id: Mapped[int] = mapped_column(
        ForeignKey(
            "socialaccounts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    platform: Mapped[Platform] = mapped_column(
        SAEnum(
            Platform,
            name="analytics_platform",
            native_enum=False,
            length=20,
            values_callable=lambda enum_cls: [
                item.value for item in enum_cls
            ],
        ),
        nullable=False,
        index=True,
    )

    platform_post_id: Mapped[str | None] = mapped_column(
        nullable=True,
    )

    likes: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    comments: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    shares: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    clicks: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    reach: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    impressions: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    engagement: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    engagement_rate: Mapped[float] = mapped_column(
        Numeric(8, 2),
        nullable=False,
        default=0,
    )

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    post: Mapped["Post"] = relationship(
        "Post",
        foreign_keys=[post_id],
    )

    social_account: Mapped["SocialAccount"] = relationship(
        "SocialAccount",
        foreign_keys=[social_account_id],
    )

    def __repr__(self) -> str:
        return (
            f"<PostAnalytics "
            f"id={self.id} "
            f"post_id={self.post_id} "
            f"platform={self.platform}>"
        )