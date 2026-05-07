from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Project Apex Logic Engine"
    environment: str = "development"
    app_base_url: str = "http://localhost:8000"

    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""

    sendgrid_api_key: str = ""
    sendgrid_from_email: str = "no-reply@example.com"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
