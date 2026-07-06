
from api.database.base import Base
from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
