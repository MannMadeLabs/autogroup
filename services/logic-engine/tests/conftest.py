"""Pytest config: in-memory SQLite + fake integration clients."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest

# Force SQLite override BEFORE any app import so the engine binds correctly.
os.environ["APEX_DATABASE_URL_OVERRIDE"] = "sqlite+pysqlite:///:memory:"

# Make `app` importable when pytest is invoked from the service root.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from app.api.deps import email_client_dep, sms_client_dep  # noqa: E402
from app.db.session import Base, engine  # noqa: E402
from app.integrations.sendgrid_client import LoggingEmailClient  # noqa: E402
from app.integrations.twilio_client import LoggingSMSClient  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def _reset_schema():
    """Drop & recreate the schema for every test - SQLite is in-memory but the
    connection persists, so a clean slate each run keeps tests isolated."""
    from app.models import lead as _lead  # noqa: F401

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def fake_sms() -> LoggingSMSClient:
    return LoggingSMSClient()


@pytest.fixture
def fake_email() -> LoggingEmailClient:
    return LoggingEmailClient()


@pytest.fixture
def client(fake_sms: LoggingSMSClient, fake_email: LoggingEmailClient) -> TestClient:
    app.dependency_overrides[sms_client_dep] = lambda: fake_sms
    app.dependency_overrides[email_client_dep] = lambda: fake_email
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
