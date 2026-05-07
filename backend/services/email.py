import logging
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)

NEW_LEAD_HTML = """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#1a1a1a;">New Service Request</h2>
  <p>Hi <strong>{name}</strong>,</p>
  <p>Thanks for reaching out to <strong>{shop_name}</strong>!</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Service</td>
        <td style="padding:8px;">{service}</td></tr>
    <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Vehicle</td>
        <td style="padding:8px;">{vehicle}</td></tr>
    <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Request ID</td>
        <td style="padding:8px;font-family:monospace;">{lead_id}</td></tr>
  </table>
  <p>A service advisor will contact you within 30 minutes to confirm your appointment.</p>
  <p style="color:#666;font-size:12px;">© {shop_name}</p>
</div>
"""

REVIEW_REQUEST_HTML = """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#1a1a1a;">How did we do?</h2>
  <p>Hi <strong>{name}</strong>,</p>
  <p>Thank you for trusting <strong>{shop_name}</strong> with your vehicle!</p>
  <p>Your feedback means the world to us and helps other drivers find trustworthy service.</p>
  <a href="{review_link}" style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#fff;
     text-decoration:none;border-radius:6px;font-weight:bold;margin:16px 0;">
    Leave a Review ⭐
  </a>
  <p style="color:#666;font-size:12px;">© {shop_name}</p>
</div>
"""


async def send_new_lead_email(
    to_email: str,
    customer_name: str,
    service: str,
    vehicle: str,
    lead_id: str,
    shop_name: str = "Auto Service",
    dry_run: bool = False,
) -> dict:
    subject = f"Your Service Request — {service or 'Auto Service'}"
    html = NEW_LEAD_HTML.format(
        name=customer_name,
        shop_name=shop_name,
        service=service or "General Service",
        vehicle=vehicle or "Your Vehicle",
        lead_id=lead_id,
    )
    return await _send(to_email, subject, html, dry_run)


async def send_review_request_email(
    to_email: str,
    customer_name: str,
    shop_name: str = "Auto Service",
    review_link: str = "",
    dry_run: bool = False,
) -> dict:
    subject = f"How was your experience at {shop_name}?"
    html = REVIEW_REQUEST_HTML.format(
        name=customer_name,
        shop_name=shop_name,
        review_link=review_link or "#",
    )
    return await _send(to_email, subject, html, dry_run)


async def _send(to_email: str, subject: str, html: str, dry_run: bool = False) -> dict:
    if dry_run or not settings.SENDGRID_API_KEY:
        logger.info("[DRY RUN] Email to %s | Subject: %s", to_email, subject)
        return {"status": "dry_run", "to": to_email, "subject": subject}

    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail

        message = Mail(
            from_email=(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME),
            to_emails=to_email,
            subject=subject,
            html_content=html,
        )
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info("Email sent to %s | Status: %s", to_email, response.status_code)
        return {"status": "sent", "status_code": response.status_code, "to": to_email}
    except Exception as exc:
        logger.error("Email failed to %s: %s", to_email, exc)
        return {"status": "error", "error": str(exc), "to": to_email}
