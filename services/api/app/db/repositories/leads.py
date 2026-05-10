from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Settings
from app.db.models.lead import Lead
from app.models.lead import LeadRecord, LeadStatus


def _tenant_uuid(settings: Settings) -> UUID | None:
    if not settings.tenant_id or not settings.tenant_id.strip():
        return None
    return UUID(settings.tenant_id.strip())


def lead_row_from_record(record: LeadRecord, settings: Settings) -> Lead:
    return Lead(
        id=record.lead_id,
        tenant_id=_tenant_uuid(settings),
        tenant_slug=settings.tenant_slug,
        source=record.source.value,
        status=record.status.value,
        customer_name=record.customer.name,
        customer_phone=record.customer.phone,
        customer_email=record.customer.email,
        vehicle_make=record.vehicle.make,
        vehicle_model=record.vehicle.model,
        vehicle_service_needed=record.vehicle.service_needed,
        lead_timestamp=record.timestamp,
    )


def create_lead(db: Session, record: LeadRecord, settings: Settings) -> Lead:
    row = lead_row_from_record(record, settings)
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def update_lead_status(
    db: Session,
    lead_id: UUID,
    status: LeadStatus,
    settings: Settings,
) -> Lead | None:
    row = db.get(Lead, lead_id)
    if row is None:
        return None
    if row.tenant_slug != settings.tenant_slug:
        return None
    row.status = status.value
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return row


def list_leads_for_tenant(
    db: Session,
    settings: Settings,
    *,
    limit: int = 50,
    offset: int = 0,
) -> list[Lead]:
    stmt = (
        select(Lead)
        .where(Lead.tenant_slug == settings.tenant_slug)
        .order_by(Lead.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())
