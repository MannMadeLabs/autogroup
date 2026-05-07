"""Analytics rollup endpoint - powers the dashboard widget."""

from __future__ import annotations

from collections import Counter

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import ga4_client_dep
from app.db.session import get_db
from app.integrations import GA4Client
from app.models import LeadORM

router = APIRouter()


class FunnelCounts(BaseModel):
    new: int = 0
    contacted: int = 0
    quoted: int = 0
    booked: int = 0
    completed: int = 0


class GA4SummaryOut(BaseModel):
    property_id: str
    sessions: int
    conversions: int
    conversion_rate: float
    by_source: dict[str, int]


class AnalyticsSummary(BaseModel):
    funnel: FunnelCounts
    leads_total: int
    ga4: GA4SummaryOut


@router.get("/summary", response_model=AnalyticsSummary)
def summary(
    days: int = Query(default=7, ge=1, le=90),
    db: Session = Depends(get_db),
    ga4: GA4Client = Depends(ga4_client_dep),
) -> AnalyticsSummary:
    rows = db.query(LeadORM.status).all()
    counts = Counter(r[0] for r in rows)
    funnel = FunnelCounts(
        new=counts.get("new", 0),
        contacted=counts.get("contacted", 0),
        quoted=counts.get("quoted", 0),
        booked=counts.get("booked", 0),
        completed=counts.get("completed", 0),
    )

    ga = ga4.summary(days=days)
    return AnalyticsSummary(
        funnel=funnel,
        leads_total=sum(counts.values()),
        ga4=GA4SummaryOut(
            property_id=ga.property_id,
            sessions=ga.sessions,
            conversions=ga.conversions,
            conversion_rate=ga.conversion_rate,
            by_source=ga.by_source,
        ),
    )
