from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ALGORITHM: str
    DATABASE_URL: str
    DEBUG: bool = False
    SECRET_KEY: str

    X_CLIENT_ID: str
    X_CLIENT_SECRET: str
    X_CALLBACK_URL: str

    PINTEREST_CLIENT_ID: str | None = None
    PINTEREST_CLIENT_SECRET: str | None = None
    PINTEREST_REDIRECT_URI: str | None = None

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()