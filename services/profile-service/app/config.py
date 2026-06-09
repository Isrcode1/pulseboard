from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "pulseboard-profile"
    DEBUG: bool = True
    PORT: int = 8002

    DATABASE_URL: str = "postgresql+asyncpg://pulseboard:pulseboard@localhost:5432/pulseboard"
    AUTH_SERVICE_URL: str = "http://localhost:8001"

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://pulseboard.duckdns.org",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
