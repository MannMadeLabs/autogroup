import hmac
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.repositories.leads import create_lead, update_lead_status
from app.db.session import get_db
from app.models.lead import (
    LeadRecord,
    LeadStatus,
    NewLeadPayload,
    StatusUpdatePayload,
    resolve_new_lead,
)
from app.services.notifications import notify_new_lead, notify_review_request

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook", tags=["webhooks"])


def _secrets_match(provided: str, expected: str) -> bool:
    if len(provided) != len(expected):
        return False
    return hmac.compare_digest(provided.encode(), expected.encode())


def require_webhook_secret(
    settings: Annotated[Settings, Depends(get_settings)],
    x_apex_secret: Annotated[str | None, Header(alias="X-Apex-Secret")] = None,
) -> None:
    secret = settings.webhook_secret
    if not secret:
        return
    if x_apex_secret is None:
        raise HTTPException(status_code=401, detail="Missing X-Apex-Secret header")
    if not _secrets_match(x_apex_secret, secret):
        raise HTTPException(status_code=401, detail="Invalid webhook secret")


class NewLeadResponse(BaseModel):
    accepted: bool
    lead_id: str


class StatusUpdateResponse(BaseModel):
    accepted: bool
    lead_id: str
    review_triggered: bool


@router.post("/new-lead", response_model=NewLeadResponse)
def webhook_new_lead(
    payload: NewLeadPayload,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[None, Depends(require_webhook_secret)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> NewLeadResponse:
    lead: LeadRecord = resolve_new_lead(payload)
    try:
        create_lead(db, lead, settings)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Lead already exists") from None

    notify_new_lead(lead, settings)
    return NewLeadResponse(accepted=True, lead_id=str(lead.lead_id))


@router.post("/status-update", response_model=StatusUpdateResponse)
def webhook_status_update(
    payload: StatusUpdatePayload,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[None, Depends(require_webhook_secret)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> StatusUpdateResponse:
    row = update_lead_status(db, payload.lead_id, payload.status, settings)
    if row is None:
        raise HTTPException(status_code=404, detail="Lead not found")

    review_triggered = payload.status == LeadStatus.completed
    if review_triggered:
        notify_review_request(payload.lead_id, settings)
    else:
        logger.info(
            "status_update lead_id=%s status=%s",
            payload.lead_id,
            payload.status.value,
        )
    return StatusUpdateResponse(
        accepted=True,
        lead_id=str(payload.lead_id),
        review_triggered=review_triggered,
    )
