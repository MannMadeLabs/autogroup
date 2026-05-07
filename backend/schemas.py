from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

from models.lead import LeadSource, LeadStatus


# ── Nested schemas ─────────────────────────────────────────────────────────────

class CustomerSchema(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None


class VehicleSchema(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[str] = None
    service_needed: Optional[str] = None


class AttributionSchema(BaseModel):
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    ad_id: Optional[str] = None
    ga4_client_id: Optional[str] = None


# ── Webhook payloads ───────────────────────────────────────────────────────────

class NewLeadPayload(BaseModel):
    """Payload for POST /webhook/new-lead"""
    source: LeadSource = LeadSource.organic
    customer: CustomerSchema
    vehicle: Optional[VehicleSchema] = None
    attribution: Optional[AttributionSchema] = None


class StatusUpdatePayload(BaseModel):
    """Payload for POST /webhook/status-update"""
    lead_id: UUID
    status: LeadStatus
    notes: Optional[str] = None


# ── Lead response ──────────────────────────────────────────────────────────────

class LeadResponse(BaseModel):
    lead_id: UUID
    source: LeadSource
    status: LeadStatus
    customer: CustomerSchema
    vehicle: VehicleSchema
    timestamp: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_lead(cls, lead) -> "LeadResponse":
        return cls(
            lead_id=lead.lead_id,
            source=lead.source,
            status=lead.status,
            customer=CustomerSchema(
                name=lead.customer_name,
                phone=lead.customer_phone,
                email=lead.customer_email,
            ),
            vehicle=VehicleSchema(
                make=lead.vehicle_make,
                model=lead.vehicle_model,
                year=lead.vehicle_year,
                service_needed=lead.service_needed,
            ),
            timestamp=lead.created_at,
        )


class LeadListResponse(BaseModel):
    leads: list[LeadResponse]
    total: int
    page: int
    page_size: int


class LeadUpdateRequest(BaseModel):
    status: Optional[LeadStatus] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None
    customer: Optional[CustomerSchema] = None
    vehicle: Optional[VehicleSchema] = None


# ── Auth ───────────────────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginRequest(BaseModel):
    username: str
    password: str
