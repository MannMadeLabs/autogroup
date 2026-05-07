import logging

from fastapi import APIRouter, status

from app.models.lead import LeadPayload, LeadStatus
from app.services.notify import notify_new_lead, notify_review_request

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook", tags=["webhooks"])


@router.post("/new-lead", status_code=status.HTTP_202_ACCEPTED)
def new_lead(payload: LeadPayload) -> dict:
    """Triggers Twilio SMS and SendGrid email when a lead is captured."""
    logger.info(
        "new-lead webhook lead_id=%s source=%s status=%s",
        payload.lead_id,
        payload.source,
        payload.status,
    )
    notify_new_lead(payload)
    return {"accepted": True, "lead_id": str(payload.lead_id)}


@router.post("/status-update", status_code=status.HTTP_202_ACCEPTED)
def status_update(payload: LeadPayload) -> dict:
    """Triggers review request when status transitions to completed."""
    logger.info(
        "status-update webhook lead_id=%s status=%s",
        payload.lead_id,
        payload.status,
    )
    if payload.status == LeadStatus.COMPLETED:
        notify_review_request(payload)
    return {"accepted": True, "lead_id": str(payload.lead_id)}
