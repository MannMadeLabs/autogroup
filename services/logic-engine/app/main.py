from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.integrations import (
    send_new_lead_email,
    send_new_lead_sms,
    trigger_review_request,
)
from app.models import Lead, StatusUpdate

settings = get_settings()

app = FastAPI(
    title="Project Apex Logic Engine",
    version="0.1.0",
    description="Webhook automation middleware for SMS, email, and attribution flows.",
)

allowed_origins = [origin.strip() for origin in settings.logic_engine_allowed_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "logic-engine"}


@app.post("/webhook/new-lead")
def webhook_new_lead(lead: Lead) -> dict[str, str]:
    send_new_lead_sms(settings, lead)
    send_new_lead_email(settings, lead)
    return {"result": "processed", "lead_id": str(lead.lead_id)}


@app.post("/webhook/status-update")
def webhook_status_update(status_update: StatusUpdate) -> dict[str, str]:
    trigger_review_request(settings, status_update)
    return {"result": "processed", "lead_id": str(status_update.lead_id)}


@app.get("/analytics/conversions")
def analytics_conversions() -> dict[str, int]:
    # Placeholder GA4 projection until live API wiring is implemented.
    return {"new": 24, "quoted": 11, "booked": 7, "completed": 5}
