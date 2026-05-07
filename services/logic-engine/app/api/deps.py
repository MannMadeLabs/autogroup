"""FastAPI dependency providers.

Routes pull integration clients via these providers so tests can override them
through `app.dependency_overrides`.
"""

from app.integrations import (
    EmailClient,
    GA4Client,
    SMSClient,
    get_email_client,
    get_ga4_client,
    get_sms_client,
)


def sms_client_dep() -> SMSClient:
    return get_sms_client()


def email_client_dep() -> EmailClient:
    return get_email_client()


def ga4_client_dep() -> GA4Client:
    return get_ga4_client()
