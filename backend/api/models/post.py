
from api.database.base import Base
from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column
class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
