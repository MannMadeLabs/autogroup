from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "Project Apex Logic Engine"
    DEBUG: bool = False
    SECRET_KEY: str = "change_me_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # Database
    DATABASE_URL: str = "postgresql://apex_user:changeme@localhost:5432/apex"

    # Twilio
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None

    # SendGrid
    SENDGRID_API_KEY: Optional[str] = None
    SENDGRID_FROM_EMAIL: str = "noreply@autoservice.com"
    SENDGRID_FROM_NAME: str = "Auto Service"

    # Google
    GA4_MEASUREMENT_ID: Optional[str] = None
    GA4_API_SECRET: Optional[str] = None
    GA4_PROPERTY_ID: Optional[str] = None

    # Shop defaults (overridden per client .env)
    SHOP_NAME: str = "Auto Service"
    SHOP_PHONE: str = ""
    SHOP_REVIEW_LINK: str = ""

    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]


settings = Settings()
