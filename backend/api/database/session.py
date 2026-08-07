
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from api.core.config import settings


DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=0,
    pool_pre_ping=True,
    pool_recycle=1800,
    connect_args={
        "check_same_thread": False
    } if DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

