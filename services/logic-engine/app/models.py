from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class LeadSource(StrEnum):
    FB_AD = "fb_ad"
    GOOGLE_SEARCH = "google_search"
    ORGANIC = "organic"


class LeadStatus(StrEnum):
    NEW = "new"
    CONTACTED = "contacted"
    QUOTED = "quoted"
    BOOKED = "booked"
    COMPLETED = "completed"


class Customer(BaseModel):
    name: str = Field(min_length=1)
    phone: str = Field(min_length=7)
    email: EmailStr


class Vehicle(BaseModel):
    make: str = Field(min_length=1)
    model: str = Field(min_length=1)
    service_needed: str = Field(min_length=1)


class Lead(BaseModel):
    lead_id: UUID
    source: LeadSource
    customer: Customer
    vehicle: Vehicle
    status: LeadStatus
    timestamp: datetime


class StatusUpdate(BaseModel):
    lead_id: UUID
    status: LeadStatus
    updated_at: datetime
