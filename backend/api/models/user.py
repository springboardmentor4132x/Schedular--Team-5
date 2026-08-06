from api.database.base import Base
from api.roles.user import Role

from datetime import datetime
from typing import List

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SAEnum,
    func,
    Integer,
    String,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)


class User(Base):

    __tablename__ = "users"

    # ============================================================
    # BASIC USER INFORMATION
    # ============================================================

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    email: Mapped[str] = mapped_column(
        String(254),
        unique=True,
        nullable=False
    )

    username: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    # ============================================================
    # PROFILE INFORMATION
    # ============================================================

    phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    website: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    bio: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )

    # ============================================================
    # ROLE
    # ============================================================

    role: Mapped[Role] = mapped_column(
        SAEnum(
            Role,
            name="user_role",
            native_enum=False,
            length=20,
            values_callable=lambda enum_cls: [
                e.value for e in enum_cls
            ]
        ),
        nullable=False,
        default=Role.CONTENT_CREATOR
    )

    # ============================================================
    # ACCOUNT STATUS
    # ============================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

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

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    social_accounts: Mapped[List["SocialAccount"]] = relationship(  # type: ignore
        back_populates="user",
        cascade="all, delete-orphan"
    )

    campaigns: Mapped[List["Campaign"]] = relationship(  # type: ignore
        back_populates="user",
        cascade="all, delete-orphan"
    )

    posts: Mapped[List["Post"]] = relationship(  # type: ignore
        back_populates="user",
        cascade="all, delete-orphan"
    )

    schedules: Mapped[List["Schedule"]] = relationship(  # type: ignore
        back_populates="user",
        cascade="all, delete-orphan"
    )

    notifications: Mapped[List["Notification"]] = relationship(  # type: ignore
        back_populates="user",
        cascade="all, delete-orphan"
    )

    assigned_team: Mapped[
        "BusinessAssignment | None"
    ] = relationship(
        foreign_keys="BusinessAssignment.business_user_id",
        back_populates="business_user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    assigned_clients: Mapped[
        List["BusinessAssignment"]
    ] = relationship(
        foreign_keys="BusinessAssignment.marketing_team_id",
        back_populates="marketing_team",
        cascade="all, delete-orphan"
    )

    # ============================================================
    # REPRESENTATION
    # ============================================================

    def __repr__(self) -> str:
        return (
            f"<User "
            f"id={self.id} "
            f"username={self.username!r} "
            f"role={self.role}>"
        )