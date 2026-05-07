"""Liveness / readiness endpoint."""

from fastapi import APIRouter

from app import __version__

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "apex-logic-engine", "version": __version__}
