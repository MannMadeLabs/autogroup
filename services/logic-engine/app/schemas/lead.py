"""Canonical Lead schema - the contract for every inter-service message.

Mirrors the JSON shape from the Project Apex blueprint (section 5):

    {
      "lead_id": "UUID",
      "source": "fb_ad | google_search | organic",
      "customer": { "name", "phone", "email" },
      "vehicle":  { "make", "model", "service_needed" },
      "status":   "new | contacted | quoted | booked | completed",
      "timestamp": "ISO-8601"
    }
"""

from __future__ import annotations

import re
from datetime import UTC, datetime
from enum import Enum
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


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


# Allowed forward transitions. A lead can never go backwards.
_ALLOWED_TRANSITIONS: dict[LeadStatus, set[LeadStatus]] = {
    LeadStatus.NEW: {LeadStatus.CONTACTED, LeadStatus.QUOTED, LeadStatus.BOOKED},
    LeadStatus.CONTACTED: {LeadStatus.QUOTED, LeadStatus.BOOKED, LeadStatus.COMPLETED},
    LeadStatus.QUOTED: {LeadStatus.BOOKED, LeadStatus.COMPLETED},
    LeadStatus.BOOKED: {LeadStatus.COMPLETED},
    LeadStatus.COMPLETED: set(),
}


def can_transition(current: LeadStatus, target: LeadStatus) -> bool:
    """Return True if the status transition is permitted."""
    if current == target:
        return True
    return target in _ALLOWED_TRANSITIONS.get(current, set())


_PHONE_RE = re.compile(r"^\+?[0-9\-\s().]{7,20}$")


class Customer(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=7, max_length=32)
    email: EmailStr

    @field_validator("phone")
    @classmethod
    def _phone_shape(cls, v: str) -> str:
        if not _PHONE_RE.match(v):
            raise ValueError("phone must be a valid phone number")
        return v


class Vehicle(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    make: str = Field(min_length=1, max_length=60)
    model: str = Field(min_length=1, max_length=60)
    service_needed: str = Field(min_length=1, max_length=200)


class LeadCreate(BaseModel):
    """Payload posted by the public site / WordPress to /webhook/new-lead."""

    model_config = ConfigDict(extra="forbid")

    source: LeadSource
    customer: Customer
    vehicle: Vehicle


class Lead(BaseModel):
    """Persisted lead - canonical wire format used by the dashboard."""

    model_config = ConfigDict(extra="forbid", from_attributes=True)

    lead_id: UUID = Field(default_factory=uuid4)
    source: LeadSource
    customer: Customer
    vehicle: Vehicle
    status: LeadStatus = LeadStatus.NEW
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))


class LeadStatusUpdate(BaseModel):
    """Payload posted by the dashboard / WordPress to /webhook/status-update."""

    model_config = ConfigDict(extra="forbid")

    lead_id: UUID
    status: LeadStatus
