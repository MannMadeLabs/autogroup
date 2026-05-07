"""SQLAlchemy 2.x session factory + dependency.

Defaults to Postgres via DATABASE_URL but accepts an in-memory SQLite override
through the APEX_DATABASE_URL_OVERRIDE env var (used by the test suite).
"""

from __future__ import annotations

import os
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


def _build_engine() -> Engine:
    override = os.getenv("APEX_DATABASE_URL_OVERRIDE")
    if override:
        if override.startswith("sqlite"):
            return create_engine(
                override,
                future=True,
                connect_args={"check_same_thread": False},
                poolclass=StaticPool,
            )
        return create_engine(override, future=True)
    return create_engine(get_settings().database_url, future=True, pool_pre_ping=True)


engine: Engine = _build_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def init_db() -> None:
    """Create tables. Alembic owns this in production; this is for dev/tests."""
    from app.models import lead as _lead  # noqa: F401  (register models)

    Base.metadata.create_all(bind=engine)


def get_db() -> Iterator[Session]:
    """FastAPI dependency yielding a scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
