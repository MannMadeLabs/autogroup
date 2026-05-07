"""Webhook + lead lifecycle integration tests."""

from __future__ import annotations

PAYLOAD = {
    "source": "google_search",
    "customer": {
        "name": "Maria Gomez",
        "phone": "+1-415-555-0142",
        "email": "maria@example.com",
    },
    "vehicle": {
        "make": "Toyota",
        "model": "Camry",
        "service_needed": "Oil change",
    },
}


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_new_lead_persists_and_fires_automation(client, fake_sms, fake_email):
    resp = client.post("/webhook/new-lead", json=PAYLOAD)
    assert resp.status_code == 201, resp.text

    body = resp.json()
    assert body["status"] == "new"
    assert body["customer"]["email"] == "maria@example.com"
    assert body["lead_id"]

    assert len(fake_sms.sent) == 1
    assert "Maria" in fake_sms.sent[0].body
    assert fake_sms.sent[0].to == "+1-415-555-0142"

    assert len(fake_email.sent) == 1
    assert fake_email.sent[0].to == "maria@example.com"


def test_new_lead_validation_error(client):
    bad = {**PAYLOAD, "source": "tiktok"}
    resp = client.post("/webhook/new-lead", json=bad)
    assert resp.status_code == 422


def test_status_update_completed_triggers_review_request(client, fake_sms, fake_email):
    resp = client.post("/webhook/new-lead", json=PAYLOAD)
    lead_id = resp.json()["lead_id"]
    fake_sms.sent.clear()
    fake_email.sent.clear()

    resp = client.post(
        "/webhook/status-update",
        json={"lead_id": lead_id, "status": "booked"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "booked"

    resp = client.post(
        "/webhook/status-update",
        json={"lead_id": lead_id, "status": "completed"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"

    assert len(fake_email.sent) == 1
    subject_lc = fake_email.sent[0].subject.lower()
    assert "review" in subject_lc or "how did we do" in subject_lc
    assert len(fake_sms.sent) == 1


def test_status_update_invalid_transition_rejected(client):
    resp = client.post("/webhook/new-lead", json=PAYLOAD)
    lead_id = resp.json()["lead_id"]

    resp = client.post(
        "/webhook/status-update",
        json={"lead_id": lead_id, "status": "booked"},
    )
    assert resp.status_code == 200

    resp = client.post(
        "/webhook/status-update",
        json={"lead_id": lead_id, "status": "new"},
    )
    assert resp.status_code == 409


def test_status_update_unknown_lead(client):
    resp = client.post(
        "/webhook/status-update",
        json={"lead_id": "00000000-0000-0000-0000-000000000000", "status": "contacted"},
    )
    assert resp.status_code == 404


def test_list_and_get_leads(client):
    resp = client.post("/webhook/new-lead", json=PAYLOAD)
    lead_id = resp.json()["lead_id"]

    resp = client.get("/leads")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    resp = client.get(f"/leads/{lead_id}")
    assert resp.status_code == 200
    assert resp.json()["lead_id"] == lead_id


def test_analytics_summary(client):
    for _ in range(3):
        client.post("/webhook/new-lead", json=PAYLOAD)

    resp = client.get("/analytics/summary")
    assert resp.status_code == 200
    body = resp.json()
    assert body["leads_total"] == 3
    assert body["funnel"]["new"] == 3
    assert "sessions" in body["ga4"]
    assert "by_source" in body["ga4"]
