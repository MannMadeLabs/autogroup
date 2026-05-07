from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from models import Lead, LeadStatus, LeadSource
from schemas import LeadResponse, LeadListResponse, LeadUpdateRequest
from services import get_db
from auth import get_current_user

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.get("", response_model=LeadListResponse)
async def list_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    status: Optional[LeadStatus] = None,
    source: Optional[LeadSource] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    query = select(Lead).order_by(Lead.created_at.desc())

    if status:
        query = query.where(Lead.status == status)
    if source:
        query = query.where(Lead.source == source)
    if search:
        term = f"%{search}%"
        query = query.where(
            Lead.customer_name.ilike(term)
            | Lead.customer_phone.ilike(term)
            | Lead.customer_email.ilike(term)
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    result = await db.execute(query)
    leads = result.scalars().all()

    return LeadListResponse(
        leads=[LeadResponse.from_orm_lead(l) for l in leads],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/kanban", response_model=dict)
async def kanban_board(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    """Returns leads grouped by status for the Kanban board."""
    result = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    leads = result.scalars().all()

    board = {s.value: [] for s in LeadStatus}
    for lead in leads:
        board[lead.status.value].append(LeadResponse.from_orm_lead(lead).model_dump())

    return board


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    result = await db.execute(select(Lead).where(Lead.lead_id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse.from_orm_lead(lead)


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: UUID,
    body: LeadUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    result = await db.execute(select(Lead).where(Lead.lead_id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if body.status is not None:
        lead.status = body.status
    if body.notes is not None:
        lead.notes = body.notes
    if body.assigned_to is not None:
        lead.assigned_to = body.assigned_to
    if body.customer:
        lead.customer_name = body.customer.name
        lead.customer_phone = body.customer.phone
        if body.customer.email:
            lead.customer_email = body.customer.email
    if body.vehicle:
        if body.vehicle.make:
            lead.vehicle_make = body.vehicle.make
        if body.vehicle.model:
            lead.vehicle_model = body.vehicle.model
        if body.vehicle.year:
            lead.vehicle_year = body.vehicle.year
        if body.vehicle.service_needed:
            lead.service_needed = body.vehicle.service_needed

    await db.commit()
    await db.refresh(lead)
    return LeadResponse.from_orm_lead(lead)


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead(
    lead_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    result = await db.execute(select(Lead).where(Lead.lead_id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await db.delete(lead)
    await db.commit()
