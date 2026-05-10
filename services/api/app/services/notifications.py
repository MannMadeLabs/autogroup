import logging
from uuid import UUID

from app.config import Settings
from app.models.lead import LeadRecord, LeadStatus

logger = logging.getLogger(__name__)


def notify_new_lead(lead: LeadRecord, settings: Settings) -> None:
    """SMS + email on new lead; logs only until Twilio/SendGrid keys are set."""
    logger.info(
        "new_lead lead_id=%s source=%s customer=%s",
        lead.lead_id,
        lead.source.value,
        lead.customer.name,
    )
    if settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_from_number:
        logger.info("twilio: would send SMS for lead_id=%s (integration pending)", lead.lead_id)
    else:
        logger.debug("twilio: skipping SMS (credentials not configured)")

    if settings.sendgrid_api_key and settings.sendgrid_from_email:
        logger.info(
            "sendgrid: would send email for lead_id=%s (integration pending)",
            lead.lead_id,
        )
    else:
        logger.debug("sendgrid: skipping email (credentials not configured)")


def notify_review_request(lead_id: UUID, settings: Settings) -> None:
    """Triggered when status moves to completed."""
    logger.info(
        "review_request lead_id=%s (stub — wire Twilio/SendGrid templates next)",
        lead_id,
    )
