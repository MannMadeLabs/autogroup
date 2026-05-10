# autogroup

**Project Apex** — automotive growth engine & CRM-lite ([blueprint](./PROJECT-APEX.md)).

## Repository layout

| Path | Purpose |
|------|---------|
| `docker-compose.yml` | Postgres, MariaDB + WordPress (CMS), FastAPI logic engine |
| `services/api/` | Python **FastAPI** — `/webhook/new-lead`, `/webhook/status-update`, `/health` |
| `apps/web/` | **Next.js** + Tailwind — public marketing / lead capture (shell) |
| `packages/schemas/` | Shared **lead JSON Schema** (`lead.schema.json`) |

## Prerequisites

- **Docker** + Docker Compose (recommended for the full stack)
- **Node.js 20+** and npm — for `apps/web` local dev
- **Python 3.12+** — optional; otherwise run the API only via Docker

## Quick start (Docker)

From the repo root:

```bash
cp .env.example .env
docker compose up --build
```

Then:

| Service | URL |
|---------|-----|
| FastAPI | http://localhost:8000 — [OpenAPI docs](http://localhost:8000/docs) |
| WordPress | http://localhost:8080 |
| Postgres | `localhost:5432` (user/db/password default `apex` / see `.env.example`) |

### Try the webhooks

```bash
curl -s http://localhost:8000/health

curl -s -X POST http://localhost:8000/webhook/new-lead \
  -H "Content-Type: application/json" \
  -d '{
    "source": "organic",
    "customer": { "name": "Test User", "phone": "+15555550100", "email": "test@example.com" },
    "vehicle": { "make": "Honda", "model": "Civic", "service_needed": "Oil change" }
  }'

curl -s -X POST http://localhost:8000/webhook/status-update \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed"
  }'
```

If `WEBHOOK_SECRET` is set in `.env`, send header `X-Apex-Secret: <same value>` on webhook requests.

## Public site (Next.js)

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000 — wire forms to `POST /webhook/new-lead` when ready.

## Environment

Copy `.env.example` to `.env`. Twilio and SendGrid are optional for development; without keys the API logs actions only.

## What is implemented vs next

- **Done:** Compose stack, FastAPI endpoints matching PROJECT APEX section 5, optional webhook secret, stub notifications.
- **Next:** Persist leads (Postgres), real Twilio/SendGrid, WordPress CPT + REST, dashboard app, GA4.
