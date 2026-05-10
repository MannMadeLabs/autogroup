from uuid import UUID

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    log_level: str = "info"

    database_url: str = "postgresql://apex:apex@localhost:5432/apex"

    # Comma-separated list (see .env.example)
    cors_origins: str = "http://localhost:3000"

    tenant_id: str | None = None
    tenant_slug: str = "mann-co"

    @field_validator("tenant_id")
    @classmethod
    def tenant_id_optional_uuid(cls, value: str | None) -> str | None:
        if value is None:
            return None
        text = value.strip()
        if not text:
            return None
        UUID(text)
        return text

    webhook_secret: str | None = None
    internal_api_key: str | None = None

    twilio_account_sid: str | None = None
    twilio_auth_token: str | None = None
    twilio_from_number: str | None = None

    sendgrid_api_key: str | None = None
    sendgrid_from_email: str | None = None

    def cors_origin_list(self) -> list[str]:
        parts = [p.strip() for p in self.cors_origins.split(",")]
        return [p for p in parts if p]


def get_settings() -> Settings:
    return Settings()
