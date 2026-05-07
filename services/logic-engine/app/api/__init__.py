from fastapi import APIRouter

from app.api import analytics, health, leads, webhooks

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(webhooks.router, prefix="/webhook", tags=["webhooks"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

__all__ = ["api_router"]
