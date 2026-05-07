import logging
import httpx
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)

GA4_MP_ENDPOINT = "https://www.google-analytics.com/mp/collect"


async def fire_ga4_event(
    event_name: str,
    params: dict,
    client_id: Optional[str] = None,
) -> dict:
    """Send a server-side event to GA4 Measurement Protocol."""
    if not settings.GA4_MEASUREMENT_ID or not settings.GA4_API_SECRET:
        logger.info("[DRY RUN] GA4 event '%s': %s", event_name, params)
        return {"status": "dry_run", "event": event_name}

    payload = {
        "client_id": client_id or "server-side",
        "events": [{"name": event_name, "params": params}],
    }
    url = (
        f"{GA4_MP_ENDPOINT}"
        f"?measurement_id={settings.GA4_MEASUREMENT_ID}"
        f"&api_secret={settings.GA4_API_SECRET}"
    )

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(url, json=payload)
            logger.info("GA4 event '%s' sent | Status: %s", event_name, response.status_code)
            return {"status": "sent", "event": event_name, "http_status": response.status_code}
    except Exception as exc:
        logger.error("GA4 event '%s' failed: %s", event_name, exc)
        return {"status": "error", "event": event_name, "error": str(exc)}


async def get_ga4_conversion_report(days: int = 30) -> dict:
    """
    Pull conversion data from GA4 Data API for the admin dashboard.
    Requires google-analytics-data SDK and a service account.
    """
    if not settings.GA4_PROPERTY_ID:
        return {"status": "not_configured", "data": []}

    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import (
            RunReportRequest,
            Dimension,
            Metric,
            DateRange,
        )

        client = BetaAnalyticsDataClient()
        request = RunReportRequest(
            property=settings.GA4_PROPERTY_ID,
            dimensions=[Dimension(name="sessionDefaultChannelGrouping")],
            metrics=[
                Metric(name="sessions"),
                Metric(name="conversions"),
                Metric(name="totalRevenue"),
            ],
            date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
        )
        response = client.run_report(request)

        rows = []
        for row in response.rows:
            rows.append({
                "channel": row.dimension_values[0].value,
                "sessions": int(row.metric_values[0].value),
                "conversions": int(row.metric_values[1].value),
                "revenue": float(row.metric_values[2].value),
            })

        return {"status": "ok", "data": rows, "days": days}
    except Exception as exc:
        logger.error("GA4 report failed: %s", exc)
        return {"status": "error", "error": str(exc), "data": []}
