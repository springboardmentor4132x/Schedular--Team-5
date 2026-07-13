from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ALGORITHM: str
    DATABASE_URL: str
    DEBUG: bool = False
    SECRET_KEY: str
      
    YOUTUBE_CALLBACK_URL: str
    YOUTUBE_CLIENT_ID: str
    YOUTUBE_CLIENT_SECRET: str

    X_CLIENT_ID: str
    X_CLIENT_SECRET: str
    X_CALLBACK_URL: str
      
    PINTEREST_CLIENT_ID: str
    PINTEREST_CLIENT_SECRET: str
    PINTEREST_REDIRECT_URI: str

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
