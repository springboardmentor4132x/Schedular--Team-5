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


class PlatformAnalytics(Base):
    __tablename__ = "platform_analytics"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
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
            name="platform_analytics_platform",
            native_enum=False,
            length=20,
            values_callable=lambda enum_cls: [
                item.value for item in enum_cls
            ],
        ),
        nullable=False,
        index=True,
    )

    followers: Mapped[float] = mapped_column(
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

    social_account: Mapped["SocialAccount"] = relationship(
        "SocialAccount",
        foreign_keys=[social_account_id],
    )

    def __repr__(self) -> str:
        return (
            f"<PlatformAnalytics "
            f"id={self.id} "
            f"platform={self.platform} "
            f"social_account_id={self.social_account_id}>"
        )