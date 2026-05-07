import logging

from fastapi import FastAPI

from app.routers import webhooks

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Project Apex Logic Engine",
    description="Webhooks, messaging integrations, and analytics plumbing.",
    version="0.1.0",
)

app.include_router(webhooks.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
