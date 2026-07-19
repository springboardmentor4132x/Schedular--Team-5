from api.database.base import Base
from api.roles.post_social_account import PublishStatus
from datetime import datetime
from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, func, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

class PostSocialAccount(Base):

    __tablename__ = "post_social_accounts"

    __table_args__ = (
        UniqueConstraint("post_id", "social_account_id", name="uq_post_social_account"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    social_account_id: Mapped[int] = mapped_column(
        ForeignKey("socialaccounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    publish_status: Mapped[PublishStatus] = mapped_column(
        SAEnum(PublishStatus, name="publish_status", native_enum=False, length=20,
               values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=False,
        default=PublishStatus.SCHEDULED
    )

    platform_post_id: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    published_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
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

    post: Mapped["Post"] = relationship(back_populates="post_social_accounts")

    social_account: Mapped["SocialAccount"] = relationship()

    def __repr__(self) -> str:
        return f"<PostSocialAccount post_id={self.post_id} account_id={self.social_account_id} status={self.publish_status}>"