"""Schema-level checks for the canonical Lead object."""

import pytest
from pydantic import ValidationError

from app.schemas import Customer, Lead, LeadCreate, LeadSource, LeadStatus, Vehicle
from app.schemas.lead import can_transition


def _payload(**override) -> dict:
    base = {
        "source": "fb_ad",
        "customer": {
            "name": "Maria Gomez",
            "phone": "+1-415-555-0142",
            "email": "maria@example.com",
        },
        "vehicle": {
            "make": "Toyota",
            "model": "Camry",
            "service_needed": "Oil change + tire rotation",
        },
    }
    base.update(override)
    return base


def test_lead_create_accepts_blueprint_payload():
    lead = LeadCreate.model_validate(_payload())
    assert lead.source is LeadSource.FB_AD
    assert lead.customer.name == "Maria Gomez"
    assert lead.vehicle.make == "Toyota"


def test_lead_create_rejects_unknown_source():
    with pytest.raises(ValidationError):
        LeadCreate.model_validate(_payload(source="tiktok"))


def test_lead_create_rejects_extra_fields():
    bad = _payload()
    bad["spam"] = "x"
    with pytest.raises(ValidationError):
        LeadCreate.model_validate(bad)


def test_invalid_email_rejected():
    with pytest.raises(ValidationError):
        Customer(name="X", phone="+15555555555", email="not-an-email")


def test_invalid_phone_rejected():
    with pytest.raises(ValidationError):
        Customer(name="X", phone="abc", email="x@y.com")


def test_lead_defaults():
    lead = Lead(
        source=LeadSource.ORGANIC,
        customer=Customer(name="A", phone="+15555555555", email="a@b.com"),
        vehicle=Vehicle(make="Honda", model="Civic", service_needed="Brakes"),
    )
    assert lead.status is LeadStatus.NEW
    assert lead.lead_id is not None
    assert lead.timestamp is not None


@pytest.mark.parametrize(
    "current,target,ok",
    [
        (LeadStatus.NEW, LeadStatus.CONTACTED, True),
        (LeadStatus.NEW, LeadStatus.BOOKED, True),
        (LeadStatus.QUOTED, LeadStatus.COMPLETED, True),
        (LeadStatus.COMPLETED, LeadStatus.NEW, False),
        (LeadStatus.BOOKED, LeadStatus.NEW, False),
        (LeadStatus.CONTACTED, LeadStatus.CONTACTED, True),  # idempotent
    ],
)
def test_status_transitions(current, target, ok):
    assert can_transition(current, target) is ok
