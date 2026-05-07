from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from datetime import datetime, timedelta

from models import Lead, LeadStatus, LeadSource
from services import get_db, get_ga4_conversion_report
from auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def dashboard_summary(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    """Core metrics for the admin dashboard widget."""
    since = datetime.utcnow() - timedelta(days=days)

    # Total leads in period
    total_q = await db.execute(
        select(func.count(Lead.lead_id)).where(Lead.created_at >= since)
    )
    total_leads = total_q.scalar()

    # Leads by status
    status_q = await db.execute(
        select(Lead.status, func.count(Lead.lead_id))
        .where(Lead.created_at >= since)
        .group_by(Lead.status)
    )
    by_status = {row[0].value: row[1] for row in status_q.all()}

    # Leads by source
    source_q = await db.execute(
        select(Lead.source, func.count(Lead.lead_id))
        .where(Lead.created_at >= since)
        .group_by(Lead.source)
    )
    by_source = {row[0].value: row[1] for row in source_q.all()}

    # Daily trend (last `days` days)
    trend_q = await db.execute(
        select(
            func.date_trunc("day", Lead.created_at).label("day"),
            func.count(Lead.lead_id).label("count"),
        )
        .where(Lead.created_at >= since)
        .group_by(text("day"))
        .order_by(text("day"))
    )
    daily_trend = [
        {"date": str(row.day.date()), "count": row.count}
        for row in trend_q.all()
    ]

    # Conversion rate: booked+completed / total
    converted = by_status.get("booked", 0) + by_status.get("completed", 0)
    conversion_rate = round(converted / total_leads * 100, 1) if total_leads else 0

    return {
        "period_days": days,
        "total_leads": total_leads,
        "conversion_rate": conversion_rate,
        "by_status": by_status,
        "by_source": by_source,
        "daily_trend": daily_trend,
    }


@router.get("/ga4")
async def ga4_report(
    days: int = Query(30, ge=1, le=365),
    _: dict = Depends(get_current_user),
):
    """Pull GA4 conversion data and pipe to the dashboard."""
    return await get_ga4_conversion_report(days=days)
