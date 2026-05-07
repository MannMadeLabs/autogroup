"""SendGrid email client - same protocol pattern as the SMS client."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class SentEmail:
    to: str
    subject: str
    body: str
    status_code: int | None = None


class EmailClient(Protocol):
    def send(self, to: str, subject: str, body: str) -> SentEmail: ...


@dataclass
class LoggingEmailClient:
    """Dev / test fallback. Records every email."""

    sent: list[SentEmail] = field(default_factory=list)

    def send(self, to: str, subject: str, body: str) -> SentEmail:
        msg = SentEmail(to=to, subject=subject, body=body, status_code=202)
        self.sent.append(msg)
        logger.info("email.dryrun.sent", to=to, subject=subject)
        return msg


class SendGridEmailClient:
    def __init__(self, api_key: str, from_email: str, from_name: str) -> None:
        from sendgrid import SendGridAPIClient

        self._client = SendGridAPIClient(api_key)
        self._from_email = from_email
        self._from_name = from_name

    def send(self, to: str, subject: str, body: str) -> SentEmail:
        from sendgrid.helpers.mail import Mail

        message = Mail(
            from_email=(self._from_email, self._from_name),
            to_emails=to,
            subject=subject,
            html_content=body,
        )
        resp = self._client.send(message)
        logger.info("email.sent", to=to, subject=subject, status_code=resp.status_code)
        return SentEmail(to=to, subject=subject, body=body, status_code=resp.status_code)


def get_email_client() -> EmailClient:
    settings = get_settings()
    if settings.sendgrid_api_key:
        return SendGridEmailClient(
            settings.sendgrid_api_key,
            settings.sendgrid_from_email,
            settings.sendgrid_from_name,
        )
    logger.warning("email.fallback.logging_client", reason="sendgrid api key missing")
    return LoggingEmailClient()
