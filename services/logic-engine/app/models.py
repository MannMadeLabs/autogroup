from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


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


class LeadStatusUpdate(BaseModel):
    lead_id: UUID
    status: LeadStatus
    customer: Customer
    timestamp: datetime
