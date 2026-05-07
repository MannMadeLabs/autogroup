"""Centralised settings - read from environment / .env via pydantic-settings."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the Apex Logic Engine."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    apex_env: str = Field(default="development")
    apex_client_slug: str = Field(default="auto-company")
    apex_public_url: str = Field(default="http://localhost:3000")
    apex_admin_url: str = Field(default="http://localhost:3001")
    apex_wp_url: str = Field(default="http://localhost:8080")

    postgres_host: str = Field(default="postgres")
    postgres_port: int = Field(default=5432)
    postgres_db: str = Field(default="apex")
    postgres_user: str = Field(default="apex")
    postgres_password: str = Field(default="apex")

    apex_jwt_secret: str = Field(default="change-me-jwt-secret")
    apex_jwt_algorithm: str = Field(default="HS256")
    apex_jwt_ttl_minutes: int = Field(default=60)

    twilio_account_sid: str = Field(default="")
    twilio_auth_token: str = Field(default="")
    twilio_from_number: str = Field(default="")

    sendgrid_api_key: str = Field(default="")
    sendgrid_from_email: str = Field(default="hello@example.com")
    sendgrid_from_name: str = Field(default="Auto Company")

    ga4_property_id: str = Field(default="")
    ga4_service_account_json: str = Field(default="")

    @property
    def database_url(self) -> str:
        """Synchronous SQLAlchemy URL (psycopg v3 driver)."""
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def is_production(self) -> bool:
        return self.apex_env.lower() == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings accessor - call this everywhere."""
    return Settings()
