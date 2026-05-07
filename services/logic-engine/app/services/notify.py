import logging

from app.config import settings
from app.models.lead import LeadPayload

logger = logging.getLogger(__name__)


def notify_new_lead(lead: LeadPayload) -> None:
    """
    Trigger outbound SMS + email for a new lead.
    Skips providers when API keys are not configured (local dev).
    """
    body = (
        f"New lead: {lead.customer.name} — {lead.vehicle.make} {lead.vehicle.model} "
        f"({lead.vehicle.service_needed}). Reply from shop line."
    )

    if settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_from_number:
        try:
            from twilio.rest import Client

            client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
            client.messages.create(
                body=body[:1600],
                from_=settings.twilio_from_number,
                to=lead.customer.phone,
            )
            logger.info("Twilio SMS queued for lead_id=%s", lead.lead_id)
        except Exception:
            logger.exception("Twilio send failed for lead_id=%s", lead.lead_id)
    else:
        logger.info("Twilio not configured; skip SMS for lead_id=%s", lead.lead_id)

    if settings.sendgrid_api_key and settings.sendgrid_from_email:
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail

            message = Mail(
                from_email=settings.sendgrid_from_email,
                to_emails=lead.customer.email,
                subject=f"Thanks {lead.customer.name} — we received your request",
                html_content=f"<p>{body}</p>",
            )
            sg = SendGridAPIClient(settings.sendgrid_api_key)
            sg.send(message)
            logger.info("SendGrid email sent for lead_id=%s", lead.lead_id)
        except Exception:
            logger.exception("SendGrid send failed for lead_id=%s", lead.lead_id)
    else:
        logger.info("SendGrid not configured; skip email for lead_id=%s", lead.lead_id)


def notify_review_request(lead: LeadPayload) -> None:
    """Ask for a review when work is marked complete."""
    msg = (
        f"Hi {lead.customer.name}, thanks for choosing us for your "
        f"{lead.vehicle.make} {lead.vehicle.model}. "
        "If you have a moment, we'd love a quick review. Link: <configure>"
    )
    if settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_from_number:
        try:
            from twilio.rest import Client

            client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
            client.messages.create(
                body=msg[:1600],
                from_=settings.twilio_from_number,
                to=lead.customer.phone,
            )
            logger.info("Twilio review SMS for lead_id=%s", lead.lead_id)
        except Exception:
            logger.exception("Twilio review SMS failed lead_id=%s", lead.lead_id)
    else:
        logger.info("Twilio not configured; skip review SMS lead_id=%s", lead.lead_id)
