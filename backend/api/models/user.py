
from datetime import datetime
from typing import List

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SAEnum,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from api.database.base import Base
from api.roles.user import Role


class User(Base):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    email: Mapped[str] = mapped_column(
        String(254),
        unique=True,
        nullable=False,
    )

    username: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    website: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    bio: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    role: Mapped[Role] = mapped_column(
        SAEnum(
            Role,
            name="user_role",
            native_enum=False,
            length=20,
            values_callable=lambda enum_cls: [
                e.value for e in enum_cls
            ],
        ),
        nullable=False,
        default=Role.CONTENT_CREATOR,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
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

    # ============================================================
    # SOCIAL ACCOUNTS
    # ============================================================

    social_accounts: Mapped[List["SocialAccount"]] = relationship(
        "SocialAccount",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # ============================================================
    # CAMPAIGNS
    # ============================================================

    campaigns: Mapped[List["Campaign"]] = relationship(
        "Campaign",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # ============================================================
    # POSTS
    # ============================================================

    posts: Mapped[List["Post"]] = relationship(
        "Post",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # ============================================================
    # SCHEDULES
    # ============================================================

    schedules: Mapped[List["Schedule"]] = relationship(
        "Schedule",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # ============================================================
    # NOTIFICATIONS
    # ============================================================

    notifications: Mapped[List["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # ============================================================
    # TEAM ACTIVITIES
    # ============================================================
    #
    # IMPORTANT:
    # TeamActivity is imported here so SQLAlchemy can resolve
    # the relationship reliably when mapper configuration occurs.
    #
    # This does NOT change the database structure or existing
    # Team Activity functionality.
    # ============================================================

    team_activities: Mapped[List["TeamActivity"]] = relationship(
        "TeamActivity",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # ============================================================
    # NOTIFICATION PREFERENCES
    # ============================================================

    notification_preferences: Mapped[
        "NotificationPreference | None"
    ] = relationship(
        "NotificationPreference",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # ============================================================
    # BUSINESS ASSIGNMENTS
    # ============================================================

    assigned_team: Mapped[
        "BusinessAssignment | None"
    ] = relationship(
        "BusinessAssignment",
        foreign_keys="BusinessAssignment.business_user_id",
        back_populates="business_user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    assigned_clients: Mapped[
        List["BusinessAssignment"]
    ] = relationship(
        "BusinessAssignment",
        foreign_keys="BusinessAssignment.marketing_team_id",
        back_populates="marketing_team",
        cascade="all, delete-orphan",
    )

    # ============================================================
    # REPRESENTATION
    # ============================================================

    def __repr__(self) -> str:
        return (
            f"<User id={self.id} "
            f"username={self.username!r} "
            f"role={self.role}>"
        )
