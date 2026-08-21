
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.database.base import Base


class TeamActivity(Base):
    __tablename__ = "team_activities"

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

    activity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    related_campaign_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "campaigns.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    related_post_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "posts.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="team_activities",
    )

    campaign: Mapped["Campaign | None"] = relationship(
        "Campaign",
    )

    post: Mapped["Post | None"] = relationship(
        "Post",
    )

    def __repr__(self) -> str:
        return (
            f"<TeamActivity "
            f"id={self.id} "
            f"type={self.activity_type!r} "
            f"user_id={self.user_id}>"
        )