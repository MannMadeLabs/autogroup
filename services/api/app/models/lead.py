from datetime import datetime, timezone
from enum import Enum
from uuid import UUID, uuid4

from pydantic import BaseModel


class LeadSource(str, Enum):
    fb_ad = "fb_ad"
    google_search = "google_search"
    organic = "organic"


class LeadStatus(str, Enum):
    new = "new"
    contacted = "contacted"
    quoted = "quoted"
    booked = "booked"
    completed = "completed"


class Customer(BaseModel):
    name: str
    phone: str
    email: str


class Vehicle(BaseModel):
    make: str
    model: str
    service_needed: str


class NewLeadPayload(BaseModel):
    """Inbound body for POST /webhook/new-lead (PROJECT APEX section 5)."""

    lead_id: UUID | None = None
    source: LeadSource
    customer: Customer
    vehicle: Vehicle
    status: LeadStatus = LeadStatus.new
    timestamp: datetime | None = None

    def normalized_timestamp(self) -> datetime:
        ts = self.timestamp or datetime.now(timezone.utc)
        if ts.tzinfo is None:
            return ts.replace(tzinfo=timezone.utc)
        return ts


class LeadRecord(BaseModel):
    """Fully resolved lead after applying defaults (canonical wire shape)."""

    lead_id: UUID
    source: LeadSource
    customer: Customer
    vehicle: Vehicle
    status: LeadStatus
    timestamp: datetime


class StatusUpdatePayload(BaseModel):
    lead_id: UUID
    status: LeadStatus
    timestamp: datetime | None = None

    def normalized_timestamp(self) -> datetime:
        ts = self.timestamp or datetime.now(timezone.utc)
        if ts.tzinfo is None:
            return ts.replace(tzinfo=timezone.utc)
        return ts


def resolve_new_lead(payload: NewLeadPayload) -> LeadRecord:
    lid = payload.lead_id or uuid4()
    ts = payload.normalized_timestamp()
    return LeadRecord(
        lead_id=lid,
        source=payload.source,
        customer=payload.customer,
        vehicle=payload.vehicle,
        status=payload.status,
        timestamp=ts,
    )
