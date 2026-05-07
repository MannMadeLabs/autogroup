import logging

from fastapi import FastAPI, HTTPException

from app.config import settings
from app.models import Lead, LeadStatus, LeadStatusUpdate
from app.notifications import notify_new_lead, send_review_request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name)


@app.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


@app.post("/webhook/new-lead")
async def new_lead_webhook(lead: Lead) -> dict[str, object]:
    try:
        delivery_result = await notify_new_lead(lead)
    except Exception as exc:  # pragma: no cover - external API handling
        logger.exception("Failed processing new lead webhook")
        raise HTTPException(status_code=502, detail="Notification delivery failed") from exc

    return {
        "lead_id": str(lead.lead_id),
        "accepted": True,
        "source": lead.source.value,
        "delivery": delivery_result,
    }


@app.post("/webhook/status-update")
async def status_update_webhook(update: LeadStatusUpdate) -> dict[str, object]:
    if update.status != LeadStatus.completed:
        return {
            "lead_id": str(update.lead_id),
            "accepted": True,
            "action": "no-op",
            "reason": "Review request triggers only when status is completed.",
        }

    completed_lead = Lead(
        lead_id=update.lead_id,
        source="organic",
        customer=update.customer,
        vehicle={"make": "unknown", "model": "unknown", "service_needed": "unknown"},
        status=LeadStatus.completed,
        timestamp=update.timestamp,
    )

    try:
        delivery_result = await send_review_request(completed_lead)
    except Exception as exc:  # pragma: no cover - external API handling
        logger.exception("Failed processing status update webhook")
        raise HTTPException(status_code=502, detail="Review notification failed") from exc

    return {
        "lead_id": str(update.lead_id),
        "accepted": True,
        "action": "review_request_sent",
        "delivery": delivery_result,
    }
