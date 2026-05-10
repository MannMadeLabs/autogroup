import logging
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import engine, get_db
from app.routers import internal, webhooks

_settings = get_settings()

logging.basicConfig(
    level=_settings.log_level.upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

_origins = _settings.cors_origin_list()

if _settings.app_env == "production" and not _origins:
    raise RuntimeError(
        "CORS_ORIGINS must list at least one browser origin in production "
        "(comma-separated HTTPS URLs, e.g. https://www.example.com)."
    )

_docs_enabled = _settings.app_env != "production"


def _cors_allow_origins() -> list[str]:
    if _origins:
        return _origins
    if _settings.app_env == "production":
        return []
    return ["*"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "apex logic engine starting env=%s tenant_slug=%s log_level=%s",
        _settings.app_env,
        _settings.tenant_slug,
        _settings.log_level,
    )
    yield
    engine.dispose()
    logger.info("apex logic engine shutdown")


app = FastAPI(
    title="Project Apex Logic Engine",
    description="FastAPI webhooks for SMS/email automation (PROJECT APEX).",
    lifespan=lifespan,
    openapi_url="/openapi.json" if _docs_enabled else None,
    docs_url="/docs" if _docs_enabled else None,
    redoc_url="/redoc" if _docs_enabled else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router)
app.include_router(internal.router)


@app.get("/health")
def health(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "service": "apex-api", "database": "connected"}


@app.get("/")
async def root() -> dict[str, str]:
    if _settings.app_env == "production":
        return {"service": "apex-api", "health": "/health"}
    return {
        "service": "apex-api",
        "docs": "/docs",
        "health": "/health",
        "internal_leads": "/internal/leads",
    }
