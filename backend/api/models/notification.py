
from api.database.base import Base
from api.roles.notification import NotificationType
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, func, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Notification(Base):
    
    __tablename__ = "notifications"

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
        String(40),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    type: Mapped[NotificationType] = mapped_column(
        SAEnum(NotificationType, name="notification_type", native_enum=False, length=10,
               values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=False,
        default=NotificationType.INFO
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    related_post_id: Mapped[int | None] = mapped_column(
        ForeignKey("posts.id", ondelete="SET NULL"),
        nullable=True
    )

    related_campaign_id: Mapped[int | None] = mapped_column(
        ForeignKey("campaigns.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="notifications")     # type: ignore

    def __repr__(self) -> str:
        return f"<Notification id={self.id} type={self.type} user_id={self.user_id}>"
