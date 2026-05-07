"""SQLAlchemy ORM model for the Lead table.

Stored fields are flat (denormalised) for read-fast dashboard queries; the JSON
shape on the wire is reconstructed in the schema layer.
"""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.schemas.lead import Customer, Lead, LeadSource, LeadStatus, Vehicle


def _utcnow() -> datetime:
    return datetime.now(UTC)


class LeadORM(Base):
    __tablename__ = "leads"

    lead_id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    source: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default=LeadStatus.NEW.value)

    customer_name: Mapped[str] = mapped_column(String(120), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(32), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(255), nullable=False)

    vehicle_make: Mapped[str] = mapped_column(String(60), nullable=False)
    vehicle_model: Mapped[str] = mapped_column(String(60), nullable=False)
    vehicle_service_needed: Mapped[str] = mapped_column(String(200), nullable=False)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )

    def to_schema(self) -> Lead:
        return Lead(
            lead_id=self.lead_id,
            source=LeadSource(self.source),
            customer=Customer(
                name=self.customer_name,
                phone=self.customer_phone,
                email=self.customer_email,
            ),
            vehicle=Vehicle(
                make=self.vehicle_make,
                model=self.vehicle_model,
                service_needed=self.vehicle_service_needed,
            ),
            status=LeadStatus(self.status),
            timestamp=self.timestamp,
        )

    @classmethod
    def from_schema(cls, lead: Lead) -> LeadORM:
        return cls(
            lead_id=lead.lead_id,
            source=lead.source.value,
            status=lead.status.value,
            customer_name=lead.customer.name,
            customer_phone=lead.customer.phone,
            customer_email=lead.customer.email,
            vehicle_make=lead.vehicle.make,
            vehicle_model=lead.vehicle.model,
            vehicle_service_needed=lead.vehicle.service_needed,
            timestamp=lead.timestamp,
        )
