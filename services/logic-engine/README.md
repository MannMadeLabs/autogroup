# Apex Logic Engine (FastAPI)

The Python middleware that wires the public site, the WordPress CMS, and the admin
dashboard together. Owns webhooks, Twilio SMS, SendGrid email, GA4 ingestion, and the
canonical lead store in Postgres.

## Endpoints

| Method | Path                       | Purpose                                                            |
| ------ | -------------------------- | ------------------------------------------------------------------ |
| GET    | `/health`                  | Liveness/readiness                                                 |
| POST   | `/webhook/new-lead`        | Persist new lead, fire Twilio SMS + SendGrid welcome email         |
| POST   | `/webhook/status-update`   | Transition a lead; on `completed` fire SendGrid review request     |
| GET    | `/leads`                   | List leads (admin dashboard Kanban source)                         |
| GET    | `/leads/{lead_id}`         | Fetch a single lead                                                |
| GET    | `/analytics/summary`       | GA4 + funnel rollup for the dashboard analytics widget             |

OpenAPI: `http://localhost:8000/docs`.

## Local development

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp ../../.env.example ../../.env
export $(grep -v '^#' ../../.env | xargs)
uvicorn app.main:app --reload --port 8000
```

## Tests

```bash
pytest
```

Tests stub Twilio/SendGrid/GA4 — no network or credentials needed.
