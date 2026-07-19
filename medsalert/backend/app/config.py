from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://medsalert:medsalert@localhost:5432/medsalert"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret_key: str = "change-me-to-something-random"
    jwt_expiry_hours: int = 72

    # console | termii
    sms_provider: str = "console"
    termii_api_key: str = ""
    termii_sender_id: str = "MedsAlert"

    otp_ttl_seconds: int = 300
    otp_max_requests_per_hour: int = 3

    # Stock entries older than this are demoted in search results and
    # flagged "unconfirmed" — staleness is a first-class concept.
    stock_stale_hours: int = 48

    default_search_radius_km: float = 10.0
    debug: bool = True


settings = Settings()
