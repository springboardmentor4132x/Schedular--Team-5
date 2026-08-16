from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.database.base import Base


class BusinessAssignment(Base):
    __tablename__ = "business_assignments"

    __table_args__ = (
        UniqueConstraint(
            "business_user_id",
            name="uq_business_user_single_team",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    business_user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    marketing_team_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    business_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[business_user_id],
        back_populates="assigned_team",
    )

    marketing_team: Mapped["User"] = relationship(
        "User",
        foreign_keys=[marketing_team_id],
        back_populates="assigned_clients",
    )

    def __repr__(self) -> str:
        return (
            f"<BusinessAssignment "
            f"business_user_id={self.business_user_id} "
            f"marketing_team_id={self.marketing_team_id}>"
        )