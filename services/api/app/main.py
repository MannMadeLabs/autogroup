import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import webhooks

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "info").upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info(
        "apex logic engine starting env=%s tenant_slug=%s log_level=%s",
        settings.app_env,
        settings.tenant_slug,
        settings.log_level,
    )
    yield
    logger.info("apex logic engine shutdown")


settings = get_settings()
_origins = settings.cors_origin_list()

app = FastAPI(
    title="Project Apex Logic Engine",
    description="FastAPI webhooks for SMS/email automation (PROJECT APEX).",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins if _origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "apex-api"}


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": "apex-api",
        "docs": "/docs",
        "health": "/health",
    }
