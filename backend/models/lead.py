from enum import Enum as PyEnum
from datetime import datetime
import uuid

from sqlalchemy import Column, String, DateTime, Enum, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class LeadSource(str, PyEnum):
    fb_ad = "fb_ad"
    google_search = "google_search"
    organic = "organic"
    referral = "referral"
    direct = "direct"


class LeadStatus(str, PyEnum):
    new = "new"
    contacted = "contacted"
    quoted = "quoted"
    booked = "booked"
    completed = "completed"
    lost = "lost"


class Lead(Base):
    __tablename__ = "leads"

    lead_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(Enum(LeadSource), nullable=False, default=LeadSource.organic)
    status = Column(Enum(LeadStatus), nullable=False, default=LeadStatus.new)

    # Customer
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    customer_email = Column(String(255), nullable=True)

    # Vehicle
    vehicle_make = Column(String(100), nullable=True)
    vehicle_model = Column(String(100), nullable=True)
    vehicle_year = Column(String(4), nullable=True)
    service_needed = Column(Text, nullable=True)

    # Attribution
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(255), nullable=True)
    ad_id = Column(String(255), nullable=True)
    ga4_client_id = Column(String(255), nullable=True)

    # Notes / internal
    notes = Column(Text, nullable=True)
    assigned_to = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    events = relationship("LeadEvent", back_populates="lead", cascade="all, delete-orphan")


class LeadEvent(Base):
    __tablename__ = "lead_events"

    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.lead_id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)  # sms_sent, email_sent, status_changed, note_added
    payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    lead = relationship("Lead", back_populates="events")
