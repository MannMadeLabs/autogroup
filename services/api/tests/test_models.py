from app.models.lead import Customer, LeadSource, NewLeadPayload, Vehicle, resolve_new_lead


def test_resolve_new_lead_applies_defaults() -> None:
    payload = NewLeadPayload(
        source=LeadSource.organic,
        customer=Customer(name="Alex", phone="+15555550100", email="alex@example.com"),
        vehicle=Vehicle(make="Toyota", model="Camry", service_needed="Oil change"),
    )
    record = resolve_new_lead(payload)
    assert record.lead_id is not None
    assert record.source == LeadSource.organic
    assert record.customer.name == "Alex"
