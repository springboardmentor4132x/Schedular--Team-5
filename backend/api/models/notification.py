
from api.database.base import Base
from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
