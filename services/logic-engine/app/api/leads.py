"""Read endpoints for the admin dashboard."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import email_client_dep, sms_client_dep
from app.db.session import get_db
from app.integrations import EmailClient, SMSClient
from app.schemas import Lead
from app.services.lead_service import LeadNotFoundError, LeadService

router = APIRouter()


def _service(
    db: Session = Depends(get_db),
    sms: SMSClient = Depends(sms_client_dep),
    email: EmailClient = Depends(email_client_dep),
) -> LeadService:
    return LeadService(db=db, sms_client=sms, email_client=email)


@router.get("", response_model=list[Lead])
def list_leads(
    limit: int = Query(default=200, ge=1, le=1000),
    svc: LeadService = Depends(_service),
) -> list[Lead]:
    return svc.list_leads(limit=limit)


@router.get("/{lead_id}", response_model=Lead)
def get_lead(lead_id: UUID, svc: LeadService = Depends(_service)) -> Lead:
    try:
        return svc.get_lead(lead_id)
    except LeadNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"lead {exc} not found") from exc
