from datetime import datetime, timezone
from enum import Enum
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class LeadSource(str, Enum):
    FB_AD = "fb_ad"
    GOOGLE_SEARCH = "google_search"
    ORGANIC = "organic"


class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUOTED = "quoted"
    BOOKED = "booked"
    COMPLETED = "completed"


class Customer(BaseModel):
    name: str
    phone: str
    email: EmailStr


class Vehicle(BaseModel):
    make: str
    model: str
    service_needed: str


class LeadPayload(BaseModel):
    """Standardized JSON structure for communication between services."""

    lead_id: UUID
    source: LeadSource
    customer: Customer
    vehicle: Vehicle
    status: LeadStatus
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
