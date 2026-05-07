import logging
from typing import Any

import httpx

from app.config import settings
from app.models import Lead

logger = logging.getLogger(__name__)


async def send_sms(to_number: str, body: str) -> bool:
    if not (
        settings.twilio_account_sid
        and settings.twilio_auth_token
        and settings.twilio_from_number
    ):
        logger.info("Twilio credentials missing, skipping SMS send.")
        return False

    url = (
        f"https://api.twilio.com/2010-04-01/Accounts/"
        f"{settings.twilio_account_sid}/Messages.json"
    )
    data: dict[str, Any] = {
        "To": to_number,
        "From": settings.twilio_from_number,
        "Body": body,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            url, data=data, auth=(settings.twilio_account_sid, settings.twilio_auth_token)
        )
        response.raise_for_status()
    return True


async def send_email(to_email: str, subject: str, content: str) -> bool:
    if not settings.sendgrid_api_key:
        logger.info("SendGrid API key missing, skipping email send.")
        return False

    payload = {
        "personalizations": [{"to": [{"email": to_email}]}],
        "from": {"email": settings.sendgrid_from_email},
        "subject": subject,
        "content": [{"type": "text/plain", "value": content}],
    }

    headers = {
        "Authorization": f"Bearer {settings.sendgrid_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            "https://api.sendgrid.com/v3/mail/send", json=payload, headers=headers
        )
        response.raise_for_status()
    return True


async def notify_new_lead(lead: Lead) -> dict[str, bool]:
    sms_body = (
        f"Thanks {lead.customer.name}, we received your request for "
        f"{lead.vehicle.service_needed} on your {lead.vehicle.make} {lead.vehicle.model}."
    )
    email_body = (
        f"Hi {lead.customer.name},\n\n"
        "Your service request is in our queue. A team member will contact you shortly.\n\n"
        f"Lead ID: {lead.lead_id}\n"
    )

    sms_sent = await send_sms(lead.customer.phone, sms_body)
    email_sent = await send_email(
        lead.customer.email, "We received your service request", email_body
    )
    return {"sms_sent": sms_sent, "email_sent": email_sent}


async def send_review_request(lead: Lead) -> dict[str, bool]:
    review_url = f"{settings.app_base_url}/review/{lead.lead_id}"
    sms_body = (
        f"Thanks for choosing us, {lead.customer.name}! "
        f"We'd love your feedback: {review_url}"
    )
    email_body = (
        f"Hi {lead.customer.name},\n\n"
        "Thanks for trusting us with your vehicle. "
        "Please leave a quick review using this link:\n"
        f"{review_url}\n"
    )

    sms_sent = await send_sms(lead.customer.phone, sms_body)
    email_sent = await send_email(lead.customer.email, "How did we do?", email_body)
    return {"sms_sent": sms_sent, "email_sent": email_sent}
