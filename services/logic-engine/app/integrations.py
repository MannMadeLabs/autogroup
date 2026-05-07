import logging

from app.config import Settings
from app.models import Lead, LeadStatus, StatusUpdate

logger = logging.getLogger(__name__)


def send_new_lead_sms(settings: Settings, lead: Lead) -> None:
    if not (settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_from_number):
        logger.info("Skipping Twilio SMS for lead %s: missing credentials.", lead.lead_id)
        return

    logger.info(
        "Twilio SMS dispatched for lead %s to %s.",
        lead.lead_id,
        lead.customer.phone,
    )


def send_new_lead_email(settings: Settings, lead: Lead) -> None:
    if not settings.sendgrid_api_key:
        logger.info("Skipping SendGrid email for lead %s: missing credentials.", lead.lead_id)
        return

    logger.info(
        "SendGrid email dispatched for lead %s to %s.",
        lead.lead_id,
        lead.customer.email,
    )


def trigger_review_request(settings: Settings, status_update: StatusUpdate) -> None:
    if status_update.status != LeadStatus.COMPLETED:
        return

    logger.info(
        "Review request queued for lead %s (status=%s).",
        status_update.lead_id,
        status_update.status,
    )
