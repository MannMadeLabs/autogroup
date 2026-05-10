# autogroup

**Project Apex** — automotive growth engine & CRM-lite ([blueprint](./PROJECT-APEX.md)).

**Contributing & CI:** see [CONTRIBUTING.md](./CONTRIBUTING.md).

**Engineering conventions:** [tenant identity, hostnames, DB naming, secrets](./docs/TENANT-AND-INFRA-RULES.md).

**Staging deploy checklist:** [docs/STAGING.md](./docs/STAGING.md).

**Demo vs staging vs production:** [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md).

## Repository layout

| Path | Purpose |
|------|---------|
| `.github/workflows/` | **CI** (Ruff, pytest, ESLint, `tsc`, Next build) |
| `deploy/` | **Tier env templates** (`env.demo|staging|production.example`) |
| `Makefile` | Shortcuts: `make lint-api`, `make lint-web` |
| `CONTRIBUTING.md` | Dev setup & quality gates |
| `docs/` | Tenant rules, **staging checklist** (`STAGING.md`), **environment tiers** (`ENVIRONMENTS.md`) |
| `docker-compose.yml` | Postgres, MariaDB + WordPress (CMS), FastAPI logic engine |
| `services/api/` | Python **FastAPI** — webhooks, **`GET /internal/leads`**, `/health` |
| `apps/web/` | **Next.js** + Tailwind — lead form + **`/leads`** inbox (server-side) |
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

The API container runs **`alembic upgrade head`** on startup so Postgres gets the `leads` table automatically.

**Local API without Docker** (from `services/api` after Postgres is up):

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
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
    "lead_id": "550e8400-e29b-41d4-a716-446655440000",
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

Use the same `lead_id` in both calls (or omit it on `new-lead` and paste the returned id into `status-update`).

If `WEBHOOK_SECRET` is set in `.env`, send header `X-Apex-Secret: <same value>` on webhook requests.

### Internal lead list (API)

Requires **`INTERNAL_API_KEY`** in the API `.env`:

```bash
curl -s http://localhost:8000/internal/leads -H "X-Internal-Key: YOUR_KEY"

curl -s -X PATCH "http://localhost:8000/internal/leads/LEAD_UUID" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Key: YOUR_KEY" \
  -d '{"status":"contacted"}'
```

## Public site + inbox (Next.js)

In one terminal, keep **Docker Compose** (or the API + Postgres) running. Then:

```bash
cd apps/web
cp .env.example .env.local
# Set INTERNAL_API_KEY to match the repo root .env (same string as the API).
npm install
npm run dev
```

| Page | URL |
|------|-----|
| Lead form | http://localhost:3000 |
| Leads **Kanban** (default) | http://localhost:3000/leads |
| Leads **table** | http://localhost:3000/leads?view=table |

The home page posts to **`NEXT_PUBLIC_APEX_API_URL`** (default `http://localhost:8000`). Ensure **`CORS_ORIGINS`** in the API includes `http://localhost:3000` (default in `.env.example`).

## Messaging (Twilio + SendGrid)

When credentials are set in the API `.env`:

- **New lead:** SendGrid email to **`SHOP_NOTIFICATION_EMAIL`** (staff), Twilio SMS acknowledgement to the **customer**.
- **Completed:** Twilio SMS review ask to the customer (loads phone from the DB), optional **`REVIEW_REQUEST_URL`** appended.

Leave keys empty for log-only behaviour.

## Staging

Follow **[docs/STAGING.md](./docs/STAGING.md)** (VPS, Docker Compose, reverse proxy, TLS, env alignment for Next + API).

## Environment

**API (repo root):** copy `.env.example` → `.env`. Set a shared secret in **`INTERNAL_API_KEY`** for `GET /internal/leads`.

**Next.js:** copy `apps/web/.env.example` → **`apps/web/.env.local`** and set the **same** `INTERNAL_API_KEY`, plus `NEXT_PUBLIC_APEX_API_URL` / `APEX_API_URL` if the API is not on `localhost:8000`.

Also documented: **Postgres / `DATABASE_URL`**, **CORS**, **golden-tenant** (`TENANT_ID`, `TENANT_SLUG`), **`SHOP_NOTIFICATION_EMAIL`**, **`REVIEW_REQUEST_URL`**, optional **Twilio / SendGrid**.

## What is implemented vs next

- **Done:** MVP — lead form → Postgres, **Kanban + table** inbox, drag/status updates, **SendGrid + Twilio** integrations when keys are set, staging checklist doc.
- **Next:** JWT auth for `/leads`, WordPress CPT + REST, GA4, hardened staging/prod (see `docs/STAGING.md`).
