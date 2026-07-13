
from api.database.base import Base
from api.roles.social_account import Platform
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, func, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

class SocialAccount(Base):

    __tablename__ = "socialaccounts"

    __table_args__ = (
        UniqueConstraint("user_id", "platform", "account_id", name="uq_user_platform_account"),
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

    platform: Mapped[Platform] = mapped_column(
        SAEnum(Platform, name="social_platform", native_enum=False, length=20,
               values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=False
    )

    account_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    account_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    access_token: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    refresh_token: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    token_expiry: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    profile_picture: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    is_connected: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    permissions: Mapped[list[str] | None] = mapped_column(
        JSON,
        nullable=True,
        default=list
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

    user: Mapped["User"] = relationship(back_populates="social_accounts")

    def __repr__(self) -> str:
        return f"<SocialAccount id={self.id} platform={self.platform} account={self.account_name!r}>"
