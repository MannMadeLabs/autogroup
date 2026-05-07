import logging
import asyncio
from uuid import UUID

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import Lead, LeadEvent, LeadStatus
from schemas import NewLeadPayload, StatusUpdatePayload, LeadResponse
from services import (
    send_new_lead_sms,
    send_new_lead_email,
    send_review_request_sms,
    send_review_request_email,
    fire_ga4_event,
    get_db,
)
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhook", tags=["Webhooks"])


# ── /webhook/new-lead ──────────────────────────────────────────────────────────

@router.post("/new-lead", status_code=status.HTTP_201_CREATED, response_model=LeadResponse)
async def new_lead_webhook(
    payload: NewLeadPayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Receives a new lead from any source (landing page form, Facebook Lead Ad, etc.).
    1. Persists the lead to PostgreSQL.
    2. Fires background tasks: SMS via Twilio, Email via SendGrid, GA4 event.
    """
    attr = payload.attribution or {}

    lead = Lead(
        source=payload.source,
        status=LeadStatus.new,
        customer_name=payload.customer.name,
        customer_phone=payload.customer.phone,
        customer_email=payload.customer.email,
        vehicle_make=payload.vehicle.make if payload.vehicle else None,
        vehicle_model=payload.vehicle.model if payload.vehicle else None,
        vehicle_year=payload.vehicle.year if payload.vehicle else None,
        service_needed=payload.vehicle.service_needed if payload.vehicle else None,
        utm_source=getattr(attr, "utm_source", None),
        utm_medium=getattr(attr, "utm_medium", None),
        utm_campaign=getattr(attr, "utm_campaign", None),
        ad_id=getattr(attr, "ad_id", None),
        ga4_client_id=getattr(attr, "ga4_client_id", None),
    )
    db.add(lead)
    await db.flush()  # get lead_id before background tasks

    event = LeadEvent(
        lead_id=lead.lead_id,
        event_type="lead_created",
        payload=f"Source: {payload.source}",
    )
    db.add(event)
    await db.commit()
    await db.refresh(lead)

    vehicle_str = " ".join(filter(None, [
        lead.vehicle_year, lead.vehicle_make, lead.vehicle_model
    ])) or "your vehicle"

    background_tasks.add_task(
        _run_new_lead_notifications,
        lead_id=str(lead.lead_id),
        customer_name=lead.customer_name,
        customer_phone=lead.customer_phone,
        customer_email=lead.customer_email or "",
        service=lead.service_needed or "General Service",
        vehicle=vehicle_str,
        ga4_client_id=lead.ga4_client_id,
        source=str(lead.source),
    )

    logger.info("New lead created: %s | %s | %s", lead.lead_id, lead.customer_name, lead.source)
    return LeadResponse.from_orm_lead(lead)


async def _run_new_lead_notifications(
    lead_id: str,
    customer_name: str,
    customer_phone: str,
    customer_email: str,
    service: str,
    vehicle: str,
    ga4_client_id: str | None,
    source: str,
) -> None:
    results = await asyncio.gather(
        send_new_lead_sms(
            to_number=customer_phone,
            customer_name=customer_name,
            service=service,
            vehicle=vehicle,
            shop_name=settings.SHOP_NAME,
        ),
        send_new_lead_email(
            to_email=customer_email,
            customer_name=customer_name,
            service=service,
            vehicle=vehicle,
            lead_id=lead_id,
            shop_name=settings.SHOP_NAME,
        ) if customer_email else asyncio.sleep(0),
        fire_ga4_event(
            event_name="generate_lead",
            params={
                "source": source,
                "service": service,
                "vehicle": vehicle,
                "lead_id": lead_id,
            },
            client_id=ga4_client_id,
        ),
        return_exceptions=True,
    )
    logger.info("Lead %s notifications dispatched: %s", lead_id, results)


# ── /webhook/status-update ─────────────────────────────────────────────────────

@router.post("/status-update", response_model=LeadResponse)
async def status_update_webhook(
    payload: StatusUpdatePayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Updates lead status. When status becomes 'completed', fires a review request
    via SMS and Email.
    """
    result = await db.execute(select(Lead).where(Lead.lead_id == payload.lead_id))
    lead = result.scalar_one_or_none()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    previous_status = lead.status
    lead.status = payload.status
    if payload.notes:
        lead.notes = (lead.notes or "") + f"\n[{lead.status}] {payload.notes}"

    event = LeadEvent(
        lead_id=lead.lead_id,
        event_type="status_changed",
        payload=f"{previous_status} → {payload.status}",
    )
    db.add(event)
    await db.commit()
    await db.refresh(lead)

    if payload.status == LeadStatus.completed:
        vehicle_str = " ".join(filter(None, [
            lead.vehicle_year, lead.vehicle_make, lead.vehicle_model
        ])) or "your vehicle"
        background_tasks.add_task(
            _run_review_request,
            customer_name=lead.customer_name,
            customer_phone=lead.customer_phone,
            customer_email=lead.customer_email or "",
            service=lead.service_needed or "service",
        )
        background_tasks.add_task(
            fire_ga4_event,
            event_name="job_completed",
            params={
                "lead_id": str(lead.lead_id),
                "service": lead.service_needed or "",
                "source": str(lead.source),
            },
            client_id=lead.ga4_client_id,
        )

    logger.info(
        "Lead %s status: %s → %s",
        lead.lead_id, previous_status, payload.status,
    )
    return LeadResponse.from_orm_lead(lead)


async def _run_review_request(
    customer_name: str,
    customer_phone: str,
    customer_email: str,
    service: str,
) -> None:
    await asyncio.gather(
        send_review_request_sms(
            to_number=customer_phone,
            customer_name=customer_name,
            service=service,
            shop_name=settings.SHOP_NAME,
            review_link=settings.SHOP_REVIEW_LINK,
        ),
        send_review_request_email(
            to_email=customer_email,
            customer_name=customer_name,
            shop_name=settings.SHOP_NAME,
            review_link=settings.SHOP_REVIEW_LINK,
        ) if customer_email else asyncio.sleep(0),
        return_exceptions=True,
    )
