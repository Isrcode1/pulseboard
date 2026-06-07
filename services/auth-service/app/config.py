from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "pulseboard-auth"
    DEBUG: bool = True
    PORT: int = 8001

    DATABASE_URL: str = "postgresql+asyncpg://pulseboard:pulseboard@localhost:5432/pulseboard"
    REDIS_URL: str = "redis://localhost:6379/0"

    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:8001/auth/github/callback"

    JWT_SECRET_KEY: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://98-83-149-72.nip.io",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
