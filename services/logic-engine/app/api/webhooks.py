"""Webhook endpoints called by the public site, WordPress, and the dashboard."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import email_client_dep, sms_client_dep
from app.db.session import get_db
from app.integrations import EmailClient, SMSClient
from app.schemas import Lead, LeadCreate, LeadStatusUpdate
from app.services.lead_service import (
    InvalidStatusTransitionError,
    LeadNotFoundError,
    LeadService,
)

router = APIRouter()


def _service(
    db: Session = Depends(get_db),
    sms: SMSClient = Depends(sms_client_dep),
    email: EmailClient = Depends(email_client_dep),
) -> LeadService:
    return LeadService(db=db, sms_client=sms, email_client=email)


@router.post(
    "/new-lead",
    response_model=Lead,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest a new lead and fire SMS + email automation",
)
def new_lead(payload: LeadCreate, svc: LeadService = Depends(_service)) -> Lead:
    return svc.create_lead(payload)


@router.post(
    "/status-update",
    response_model=Lead,
    summary="Transition a lead through the funnel; fires review request on 'completed'",
)
def status_update(payload: LeadStatusUpdate, svc: LeadService = Depends(_service)) -> Lead:
    try:
        return svc.update_status(payload)
    except LeadNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"lead {exc} not found") from exc
    except InvalidStatusTransitionError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
