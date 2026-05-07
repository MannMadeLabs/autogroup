"""Google Analytics 4 client.

When credentials and `google-analytics-data` are available we pull conversion
counts via the Data API. Otherwise we serve a deterministic stub so the admin
dashboard's analytics widget always has something to render.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class GA4Summary:
    property_id: str
    sessions: int
    conversions: int
    conversion_rate: float
    by_source: dict[str, int]


class GA4Client(Protocol):
    def summary(self, days: int = 7) -> GA4Summary: ...


class StubGA4Client:
    """Deterministic fixture used until GA4 credentials land in `.env`."""

    def summary(self, days: int = 7) -> GA4Summary:
        sessions = 1240 * max(days, 1) // 7
        conversions = 38 * max(days, 1) // 7
        rate = round(conversions / sessions, 4) if sessions else 0.0
        return GA4Summary(
            property_id="stub",
            sessions=sessions,
            conversions=conversions,
            conversion_rate=rate,
            by_source={"fb_ad": 14, "google_search": 19, "organic": 5},
        )


class GoogleGA4Client:
    """Real GA4 Data API client - lazy-imports `google-analytics-data`."""

    def __init__(self, property_id: str, service_account_path: str) -> None:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.oauth2 import service_account

        creds = service_account.Credentials.from_service_account_file(service_account_path)
        self._client = BetaAnalyticsDataClient(credentials=creds)
        self._property_id = property_id

    def summary(self, days: int = 7) -> GA4Summary:
        from google.analytics.data_v1beta.types import (
            DateRange,
            Dimension,
            Metric,
            RunReportRequest,
        )

        request = RunReportRequest(
            property=f"properties/{self._property_id}",
            dimensions=[Dimension(name="sessionSource")],
            metrics=[Metric(name="sessions"), Metric(name="conversions")],
            date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
        )
        resp = self._client.run_report(request)

        sessions = 0
        conversions = 0
        by_source: dict[str, int] = {}
        for row in resp.rows:
            source = row.dimension_values[0].value
            s = int(row.metric_values[0].value)
            c = int(row.metric_values[1].value)
            sessions += s
            conversions += c
            by_source[source] = by_source.get(source, 0) + c

        rate = round(conversions / sessions, 4) if sessions else 0.0
        return GA4Summary(
            property_id=self._property_id,
            sessions=sessions,
            conversions=conversions,
            conversion_rate=rate,
            by_source=by_source,
        )


def get_ga4_client() -> GA4Client:
    settings = get_settings()
    if settings.ga4_property_id and settings.ga4_service_account_json:
        try:
            return GoogleGA4Client(
                settings.ga4_property_id, settings.ga4_service_account_json
            )
        except Exception as exc:  # pragma: no cover - defensive fallback
            logger.warning("ga4.real_client_unavailable", error=str(exc))
    return StubGA4Client()
