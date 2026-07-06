
from api.database.base import Base
from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

class SocialAccount(Base):
    __tablename__ = "socialaccounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
