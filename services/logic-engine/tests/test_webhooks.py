from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_webhook_new_lead() -> None:
    payload = {
        "lead_id": str(uuid4()),
        "source": "fb_ad",
        "customer": {"name": "Alex Driver", "phone": "+15551234567", "email": "alex@example.com"},
        "vehicle": {"make": "Toyota", "model": "Camry", "service_needed": "Brake Inspection"},
        "status": "new",
        "timestamp": "2026-05-07T20:00:00Z",
    }
    response = client.post("/webhook/new-lead", json=payload)
    assert response.status_code == 200
    assert response.json()["result"] == "processed"


def test_webhook_status_update() -> None:
    payload = {
        "lead_id": str(uuid4()),
        "status": "completed",
        "updated_at": "2026-05-07T20:01:00Z",
    }
    response = client.post("/webhook/status-update", json=payload)
    assert response.status_code == 200
    assert response.json()["result"] == "processed"
