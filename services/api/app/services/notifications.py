import logging
from uuid import UUID

from app.config import Settings
from app.models.lead import LeadRecord

logger = logging.getLogger(__name__)


def _twilio_send_sms(settings: Settings, to_phone: str, body: str) -> None:
    from twilio.base.exceptions import TwilioRestException
    from twilio.rest import Client

    client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
    try:
        msg = client.messages.create(
            to=to_phone.strip(),
            from_=settings.twilio_from_number,
            body=body,
        )
        logger.info("twilio SMS queued sid=%s to=%s", msg.sid, to_phone)
    except TwilioRestException as exc:
        logger.exception("twilio SMS failed: %s", exc)


def _sendgrid_send_mail(
    settings: Settings,
    *,
    to_email: str,
    subject: str,
    html_body: str,
    plain_body: str,
) -> None:
    from python_http_client.exceptions import HTTPError
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail

    message = Mail(
        from_email=settings.sendgrid_from_email,
        to_emails=to_email.strip(),
        subject=subject,
        plain_text_content=plain_body,
        html_content=html_body,
    )
    try:
        sg = SendGridAPIClient(settings.sendgrid_api_key)
        sg.send(message)
        logger.info("sendgrid mail sent to=%s subject=%s", to_email, subject)
    except HTTPError as exc:
        logger.exception("sendgrid request failed: %s", exc)


def notify_new_lead(lead: LeadRecord, settings: Settings) -> None:
    """Staff email (SendGrid) + customer SMS acknowledgement (Twilio) when configured."""
    logger.info(
        "new_lead lead_id=%s source=%s customer=%s",
        lead.lead_id,
        lead.source.value,
        lead.customer.name,
    )

    if (
        settings.sendgrid_api_key
        and settings.sendgrid_from_email
        and settings.shop_notification_email
    ):
        subject = f"New lead: {lead.customer.name}"
        plain = (
            f"Lead ID: {lead.lead_id}\n"
            f"Source: {lead.source.value}\n"
            f"Customer: {lead.customer.name} · {lead.customer.phone} · {lead.customer.email}\n"
            f"Vehicle: {lead.vehicle.make} {lead.vehicle.model}\n"
            f"Service: {lead.vehicle.service_needed}\n"
        )
        html = (
            f"<p><strong>New lead</strong> ({lead.lead_id})</p>"
            f"<ul>"
            f"<li><strong>Source:</strong> {lead.source.value}</li>"
            f"<li><strong>Customer:</strong> {lead.customer.name} — "
            f'<a href="tel:{lead.customer.phone}">{lead.customer.phone}</a> — '
            f'<a href="mailto:{lead.customer.email}">{lead.customer.email}</a></li>'
            f"<li><strong>Vehicle:</strong> {lead.vehicle.make} {lead.vehicle.model}</li>"
            f"<li><strong>Service:</strong> {lead.vehicle.service_needed}</li>"
            f"</ul>"
        )
        _sendgrid_send_mail(
            settings,
            to_email=settings.shop_notification_email,
            subject=subject,
            html_body=html,
            plain_body=plain,
        )
    elif settings.sendgrid_api_key and not settings.shop_notification_email:
        logger.warning(
            "sendgrid configured but SHOP_NOTIFICATION_EMAIL is empty — skipping staff email",
        )

    if (
        settings.twilio_account_sid
        and settings.twilio_auth_token
        and settings.twilio_from_number
    ):
        sms_body = (
            f"Hi {lead.customer.name}, we received your service request for "
            f"{lead.vehicle.make} {lead.vehicle.model} and will reach out shortly."
        )
        try:
            _twilio_send_sms(settings, lead.customer.phone, sms_body)
        except Exception:
            logger.exception("twilio customer SMS failed")
    else:
        logger.debug("twilio: skipping customer SMS (credentials not configured)")


def notify_review_request(lead_id: UUID, settings: Settings) -> None:
    """Ask for a review when work is completed — SMS to customer if Twilio configured."""
    from app.db.models.lead import Lead
    from app.db.session import SessionLocal

    logger.info("review_request lead_id=%s", lead_id)

    link = (settings.review_request_url or "").strip()
    body = (
        "Thanks for choosing us! If you have a moment, we'd love a quick review."
        + (f" {link}" if link else "")
    )

    db = SessionLocal()
    try:
        row = db.get(Lead, lead_id)
        if row is None:
            logger.warning("review_request: lead %s not found", lead_id)
            return
        if row.tenant_slug != settings.tenant_slug:
            logger.warning("review_request: tenant mismatch for lead %s", lead_id)
            return

        if (
            settings.twilio_account_sid
            and settings.twilio_auth_token
            and settings.twilio_from_number
        ):
            _twilio_send_sms(settings, row.customer_phone, body)
        else:
            logger.debug(
                "twilio: skipping review SMS (credentials not configured); template=%s",
                body,
            )
    finally:
        db.close()
