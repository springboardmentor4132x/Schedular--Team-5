from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.database.base import Base
from api.roles.notification import NotificationType


class Notification(Base):

    __tablename__ = "notifications"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # ========================================================
    # USER
    # ========================================================

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # ========================================================
    # NOTIFICATION CONTENT
    # ========================================================

    title: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    # ========================================================
    # NOTIFICATION TYPE
    #
    # success / error / warning / info
    # ========================================================

    type: Mapped[NotificationType] = mapped_column(
        SAEnum(
            NotificationType,
            name="notification_type",
            native_enum=False,
            length=10,
            values_callable=lambda enum_cls: [
                enum.value
                for enum in enum_cls
            ],
        ),
        nullable=False,
        default=NotificationType.INFO,
    )

    # ========================================================
    # NOTIFICATION CATEGORY
    #
    # publishing
    # campaign
    # account_activity
    # team_collaboration
    # system
    # ========================================================

    category: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="system",
        server_default="system",
        index=True,
    )

    # ========================================================
    # DELIVERY CHANNEL
    #
    # in_app
    # email
    # push
    # ========================================================

    delivery_channel: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="in_app",
        server_default="in_app",
        index=True,
    )

    # ========================================================
    # READ STATUS
    # ========================================================

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    # ========================================================
    # READ TIMESTAMP
    # ========================================================

    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ========================================================
    # RELATED POST
    # ========================================================

    related_post_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "posts.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    # ========================================================
    # RELATED CAMPAIGN
    # ========================================================

    related_campaign_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "campaigns.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    # ========================================================
    # CREATED TIMESTAMP
    # ========================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    # ========================================================
    # USER RELATIONSHIP
    # ========================================================

    user: Mapped["User"] = relationship(
        "User",
        back_populates="notifications",
    )

    # ========================================================
    # REPRESENTATION
    # ========================================================

    def __repr__(self) -> str:
        return (
            f"<Notification "
            f"id={self.id} "
            f"type={self.type} "
            f"category={self.category} "
            f"user_id={self.user_id}>"
        )