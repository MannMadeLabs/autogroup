import hmac
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models.lead import Lead
from app.db.repositories.leads import list_leads_for_tenant, update_lead_status
from app.db.session import get_db
from app.models.lead import LeadStatus
from app.services.notifications import notify_review_request

router = APIRouter(prefix="/internal", tags=["internal"])


def _constant_time_match(provided: str, expected: str) -> bool:
    if len(provided) != len(expected):
        return False
    return hmac.compare_digest(provided.encode(), expected.encode())


def require_internal_api_key(
    settings: Annotated[Settings, Depends(get_settings)],
    x_internal_key: Annotated[str | None, Header(alias="X-Internal-Key")] = None,
) -> None:
    secret = settings.internal_api_key
    if not secret:
        raise HTTPException(
            status_code=503,
            detail="INTERNAL_API_KEY is not configured on the API server",
        )
    if x_internal_key is None:
        raise HTTPException(status_code=401, detail="Missing X-Internal-Key header")
    if not _constant_time_match(x_internal_key, secret):
        raise HTTPException(status_code=401, detail="Invalid internal API key")


class LeadListItem(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    lead_id: UUID
    tenant_slug: str
    source: str
    status: str
    customer_name: str
    customer_phone: str
    customer_email: str
    vehicle_make: str
    vehicle_model: str
    vehicle_service_needed: str
    lead_timestamp: str
    created_at: str
    updated_at: str


class LeadListResponse(BaseModel):
    leads: list[LeadListItem]


class LeadStatusPatchBody(BaseModel):
    status: LeadStatus


def _serialize_row(row: Lead) -> LeadListItem:
    return LeadListItem(
        lead_id=row.id,
        tenant_slug=row.tenant_slug,
        source=row.source,
        status=row.status,
        customer_name=row.customer_name,
        customer_phone=row.customer_phone,
        customer_email=row.customer_email,
        vehicle_make=row.vehicle_make,
        vehicle_model=row.vehicle_model,
        vehicle_service_needed=row.vehicle_service_needed,
        lead_timestamp=row.lead_timestamp.isoformat(),
        created_at=row.created_at.isoformat(),
        updated_at=row.updated_at.isoformat(),
    )


@router.get("/leads", response_model=LeadListResponse)
def internal_list_leads(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
    settings: Annotated[Settings, Depends(get_settings)],
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> LeadListResponse:
    rows = list_leads_for_tenant(db, settings, limit=limit, offset=offset)
    return LeadListResponse(leads=[_serialize_row(r) for r in rows])


@router.patch("/leads/{lead_id}", response_model=LeadListItem)
def internal_patch_lead_status(
    lead_id: UUID,
    body: LeadStatusPatchBody,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> LeadListItem:
    row = update_lead_status(db, lead_id, body.status, settings)
    if row is None:
        raise HTTPException(status_code=404, detail="Lead not found")

    if body.status == LeadStatus.completed:
        notify_review_request(lead_id, settings)

    return _serialize_row(row)
