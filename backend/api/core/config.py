from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ALGORITHM: str
    DATABASE_URL: str
    DEBUG: bool = False
    SECRET_KEY: str

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()