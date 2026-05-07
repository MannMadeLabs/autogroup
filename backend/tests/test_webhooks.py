import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch

from main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_new_lead_webhook(mock_db):
    payload = {
        "source": "fb_ad",
        "customer": {
            "name": "Jane Smith",
            "phone": "+15551234567",
            "email": "jane@example.com",
        },
        "vehicle": {
            "make": "Toyota",
            "model": "Camry",
            "year": "2021",
            "service_needed": "Oil Change",
        },
        "attribution": {
            "utm_source": "facebook",
            "utm_medium": "cpc",
            "utm_campaign": "spring_promo",
        },
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/webhook/new-lead", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["customer"]["name"] == "Jane Smith"
    assert data["status"] == "new"
    assert "lead_id" in data
