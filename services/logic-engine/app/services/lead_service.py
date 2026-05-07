"""Lead business logic - persistence + outbound automation orchestration."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.logging import get_logger
from app.integrations import EmailClient, SMSClient
from app.models import LeadORM
from app.schemas import Lead, LeadCreate, LeadStatus, LeadStatusUpdate
from app.schemas.lead import can_transition

logger = get_logger(__name__)


class LeadNotFoundError(Exception):
    """Raised when a lead_id is missing from the store."""


class InvalidStatusTransitionError(Exception):
    """Raised when an attempted status transition is not allowed."""


class LeadService:
    """Coordinates lead persistence and downstream automation."""

    def __init__(
        self,
        db: Session,
        sms_client: SMSClient,
        email_client: EmailClient,
    ) -> None:
        self._db = db
        self._sms = sms_client
        self._email = email_client
        self._settings = get_settings()

    # ---------- Reads ----------

    def list_leads(self, limit: int = 200) -> list[Lead]:
        rows = self._db.execute(
            select(LeadORM).order_by(LeadORM.timestamp.desc()).limit(limit)
        ).scalars().all()
        return [r.to_schema() for r in rows]

    def get_lead(self, lead_id: UUID) -> Lead:
        row = self._db.get(LeadORM, lead_id)
        if row is None:
            raise LeadNotFoundError(str(lead_id))
        return row.to_schema()

    # ---------- Writes ----------

    def create_lead(self, payload: LeadCreate) -> Lead:
        """Persist a fresh lead and trigger the new-lead automation."""
        lead = Lead(source=payload.source, customer=payload.customer, vehicle=payload.vehicle)
        row = LeadORM.from_schema(lead)
        self._db.add(row)
        self._db.commit()
        self._db.refresh(row)

        persisted = row.to_schema()
        logger.info("lead.created", lead_id=str(persisted.lead_id), source=persisted.source.value)

        self._fire_new_lead_automation(persisted)
        return persisted

    def update_status(self, payload: LeadStatusUpdate) -> Lead:
        """Move a lead along the funnel and trigger any matching automation."""
        row = self._db.get(LeadORM, payload.lead_id)
        if row is None:
            raise LeadNotFoundError(str(payload.lead_id))

        current = LeadStatus(row.status)
        target = payload.status
        if not can_transition(current, target):
            raise InvalidStatusTransitionError(
                f"{current.value} -> {target.value} is not allowed"
            )

        row.status = target.value
        self._db.commit()
        self._db.refresh(row)

        updated = row.to_schema()
        logger.info(
            "lead.status_updated",
            lead_id=str(updated.lead_id),
            previous=current.value,
            new=target.value,
        )

        if target is LeadStatus.COMPLETED:
            self._fire_review_request(updated)

        return updated

    # ---------- Automation ----------

    def _fire_new_lead_automation(self, lead: Lead) -> None:
        brand = self._settings.sendgrid_from_name
        sms_body = (
            f"Hi {lead.customer.name}, this is {brand}. We got your request for "
            f"{lead.vehicle.service_needed} on your {lead.vehicle.make} {lead.vehicle.model}. "
            "We'll be in touch shortly!"
        )
        email_body = (
            f"<p>Hi {lead.customer.name},</p>"
            f"<p>Thanks for reaching out to <strong>{brand}</strong>. "
            f"We've logged your request for <em>{lead.vehicle.service_needed}</em> on your "
            f"{lead.vehicle.make} {lead.vehicle.model}.</p>"
            "<p>One of our advisors will follow up shortly with a quote.</p>"
        )
        self._sms.send(lead.customer.phone, sms_body)
        self._email.send(
            lead.customer.email,
            f"We got your request - {brand}",
            email_body,
        )

    def _fire_review_request(self, lead: Lead) -> None:
        brand = self._settings.sendgrid_from_name
        body = (
            f"<p>Hi {lead.customer.name},</p>"
            f"<p>Thanks for choosing <strong>{brand}</strong> for your "
            f"{lead.vehicle.service_needed}. If we earned it, we'd love a quick review.</p>"
        )
        self._email.send(
            lead.customer.email,
            f"How did we do? - {brand}",
            body,
        )
        self._sms.send(
            lead.customer.phone,
            f"Hi {lead.customer.name}, thanks for choosing {brand}! "
            "Mind leaving us a quick review?",
        )
