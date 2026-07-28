
from api.database.base import Base
from api.roles.schedule import Status
from datetime import datetime
from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Schedule(Base):

    __tablename__ = "schedules"

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

    social_account_id: Mapped[int] = mapped_column(
        ForeignKey("socialaccounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    celery_task_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False
    )

    scheduled_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    executed_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    status: Mapped[Status] = mapped_column(
        SAEnum(Status, name="schedule_status", native_enum=False, length=15,
            values_callable=lambda enum_cls: [e.value for e in enum_cls]
        ),
        nullable=False,
        default=Status.PENDING
    )

    user: Mapped["User"] = relationship(back_populates="schedules")     # type: ignore

    post: Mapped["Post"] = relationship(back_populates="schedules")     # type: ignore

    social_account: Mapped["SocialAccount"] = relationship()     # type: ignore

    def __repr__(self) -> str:
        return f"<Schedule id={self.id} post_id={self.post_id} status={self.status}>"
