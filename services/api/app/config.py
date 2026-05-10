from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    log_level: str = "info"

    database_url: str = "postgresql://apex:apex@localhost:5432/apex"

    webhook_secret: str | None = None

    twilio_account_sid: str | None = None
    twilio_auth_token: str | None = None
    twilio_from_number: str | None = None

    sendgrid_api_key: str | None = None
    sendgrid_from_email: str | None = None


def get_settings() -> Settings:
    return Settings()
