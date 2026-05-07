"""Twilio SMS client.

Exposes a `SMSClient` Protocol plus two implementations:

- `TwilioSMSClient` - real Twilio REST client.
- `LoggingSMSClient` - dev/test fallback that just logs and records messages.

The active implementation is chosen by `get_sms_client()` based on whether
Twilio credentials are present.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class SentSMS:
    to: str
    body: str
    sid: str | None = None


class SMSClient(Protocol):
    def send(self, to: str, body: str) -> SentSMS: ...


@dataclass
class LoggingSMSClient:
    """No-op client used when Twilio is not configured (dev / tests)."""

    sent: list[SentSMS] = field(default_factory=list)

    def send(self, to: str, body: str) -> SentSMS:
        msg = SentSMS(to=to, body=body, sid=None)
        self.sent.append(msg)
        logger.info("sms.dryrun.sent", to=to, body=body)
        return msg


class TwilioSMSClient:
    def __init__(self, account_sid: str, auth_token: str, from_number: str) -> None:
        from twilio.rest import Client

        self._client = Client(account_sid, auth_token)
        self._from = from_number

    def send(self, to: str, body: str) -> SentSMS:
        msg = self._client.messages.create(to=to, from_=self._from, body=body)
        logger.info("sms.sent", to=to, sid=msg.sid)
        return SentSMS(to=to, body=body, sid=msg.sid)


def get_sms_client() -> SMSClient:
    settings = get_settings()
    if settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_from_number:
        return TwilioSMSClient(
            settings.twilio_account_sid,
            settings.twilio_auth_token,
            settings.twilio_from_number,
        )
    logger.warning("sms.fallback.logging_client", reason="twilio creds missing")
    return LoggingSMSClient()
