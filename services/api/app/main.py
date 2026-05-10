import logging
import os
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import engine, get_db
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
def health(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "service": "apex-api", "database": "connected"}


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": "apex-api",
        "docs": "/docs",
        "health": "/health",
    }
