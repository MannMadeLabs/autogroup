"""FastAPI application entrypoint."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.db.session import init_db


@asynccontextmanager
async def lifespan(_app: FastAPI):
    configure_logging()
    log = get_logger("apex.startup")
    settings = get_settings()
    try:
        init_db()
        log.info("db.ready", url_host=settings.postgres_host, db=settings.postgres_db)
    except Exception as exc:
        log.warning("db.unavailable", error=str(exc))
    log.info("app.started", env=settings.apex_env, client=settings.apex_client_slug)
    yield
    log.info("app.stopped")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Apex Logic Engine",
        version=__version__,
        description="Project Apex - webhooks, automation, and analytics aggregation.",
        lifespan=lifespan,
    )

    allowed_origins = {
        settings.apex_public_url,
        settings.apex_admin_url,
        settings.apex_wp_url,
    }
    app.add_middleware(
        CORSMiddleware,
        allow_origins=sorted(o for o in allowed_origins if o),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)
    return app


app = create_app()
