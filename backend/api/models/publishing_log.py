
# from __future__ import annotations
# from api.database.base import Base
# from api.roles.post import Status
# from datetime import datetime
# from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, func, Integer, Text
# from sqlalchemy.orm import Mapped, mapped_column, relationship

# class PublishingLog(Base):

#     __tablename__ = "publishing_logs"
    
#     id: Mapped[int] = mapped_column(
#         Integer,
#         primary_key=True,
#         index=True
#     )

#     post_id: Mapped[int] = mapped_column(
#         Integer,
#         ForeignKey("posts.id", ondelete="CASCADE"),
#         index=True
#     )

#     status_changed_to: Mapped[Status] = mapped_column(
#         SAEnum(Status)
#     )

#     message: Mapped[str | None] = mapped_column(
#         Text,
#         nullable=True
#     )

#     created_at: Mapped[datetime] = mapped_column(
#         DateTime,
#         server_default=func.now(),
#         default=func.now()
#     )

#     post: Mapped["Post"] = relationship(  #type: ignore
#         "Post",
#         back_populates="logs"
#     )

#     logs = relationship("PublishingLog", back_populates="post", cascade="all, delete-orphan")