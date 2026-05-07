import logging
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)


def _get_client():
    from twilio.rest import Client
    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


NEW_LEAD_TEMPLATE = (
    "Hi {name}! Thanks for reaching out to {shop_name}. "
    "We received your request for {service} on your {year} {make} {model}. "
    "A service advisor will call you within 30 minutes. "
    "Reply STOP to opt out."
)

REVIEW_REQUEST_TEMPLATE = (
    "Hi {name}, thanks for choosing {shop_name}! "
    "We hope your {service} went great. "
    "Mind leaving us a quick review? {review_link} "
    "Reply STOP to opt out."
)

QUOTE_READY_TEMPLATE = (
    "Hi {name}, your quote from {shop_name} is ready! "
    "Service: {service} — Estimate: ${amount}. "
    "Reply YES to book or call us at {shop_phone}."
)


async def send_new_lead_sms(
    to_number: str,
    customer_name: str,
    service: str,
    vehicle: str,
    shop_name: str = "Auto Service",
    dry_run: bool = False,
) -> dict:
    parts = vehicle.split(" ", 2)
    year = parts[0] if len(parts) > 0 else ""
    make = parts[1] if len(parts) > 1 else ""
    model = parts[2] if len(parts) > 2 else ""

    body = NEW_LEAD_TEMPLATE.format(
        name=customer_name.split()[0],
        shop_name=shop_name,
        service=service or "service",
        year=year,
        make=make,
        model=model,
    )

    return await _send(to_number, body, dry_run)


async def send_review_request_sms(
    to_number: str,
    customer_name: str,
    service: str,
    shop_name: str = "Auto Service",
    review_link: str = "",
    dry_run: bool = False,
) -> dict:
    body = REVIEW_REQUEST_TEMPLATE.format(
        name=customer_name.split()[0],
        shop_name=shop_name,
        service=service or "service",
        review_link=review_link,
    )
    return await _send(to_number, body, dry_run)


async def _send(to_number: str, body: str, dry_run: bool = False) -> dict:
    if dry_run or not settings.TWILIO_ACCOUNT_SID:
        logger.info("[DRY RUN] SMS to %s: %s", to_number, body)
        return {"status": "dry_run", "to": to_number, "body": body}

    try:
        client = _get_client()
        message = client.messages.create(
            body=body,
            from_=settings.TWILIO_FROM_NUMBER,
            to=to_number,
        )
        logger.info("SMS sent to %s | SID: %s", to_number, message.sid)
        return {"status": "sent", "sid": message.sid, "to": to_number}
    except Exception as exc:
        logger.error("SMS failed to %s: %s", to_number, exc)
        return {"status": "error", "error": str(exc), "to": to_number}
