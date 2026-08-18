from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.database.base import Base
from api.roles.social_account import Platform


class AudienceAnalytics(Base):
    __tablename__ = "audience_analytics"

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
            name="audience_analytics_platform",
            native_enum=False,
            length=20,
            values_callable=lambda enum_cls: [
                item.value for item in enum_cls
            ],
        ),
        nullable=False,
        index=True,
    )

    age_group: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    gender: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    followers: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    following: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    percentage: Mapped[float] = mapped_column(
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
            f"<AudienceAnalytics "
            f"id={self.id} "
            f"platform={self.platform} "
            f"social_account_id={self.social_account_id}>"
        )