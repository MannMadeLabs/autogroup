"""External service integrations (Twilio, SendGrid, GA4).

All integrations follow the same protocol-based pattern so they can be swapped
for in-memory fakes during testing without monkeypatching network libraries.
"""

from app.integrations.ga4 import GA4Client, GA4Summary, get_ga4_client
from app.integrations.sendgrid_client import EmailClient, get_email_client
from app.integrations.twilio_client import SMSClient, get_sms_client

__all__ = [
    "EmailClient",
    "GA4Client",
    "GA4Summary",
    "SMSClient",
    "get_email_client",
    "get_ga4_client",
    "get_sms_client",
]
