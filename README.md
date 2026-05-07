# Project Apex — Automotive Growth Engine

White-label “product-as-an-agency” stack for automotive service: fast public pages (Next.js), headless WordPress for structured content, a FastAPI logic engine for webhooks and messaging, and PostgreSQL for relational data.

## Repository layout

| Path | Role |
|------|------|
| `apps/web` | Next.js (App Router) public site + starter shop-owner dashboard |
| `services/logic-engine` | FastAPI webhooks (Twilio / SendGrid when keys are present) |
| `wordpress/wp-content/plugins/apex-headless` | WordPress plugin registering CPTs with REST exposure |
| `docker-compose.yml` | Postgres, WordPress + MariaDB, API, web |

## Standard lead payload

All services should accept/produce this JSON shape:

```json
{
  "lead_id": "UUID",
  "source": "fb_ad | google_search | organic",
  "customer": {
    "name": "string",
    "phone": "string",
    "email": "string"
  },
  "vehicle": {
    "make": "string",
    "model": "string",
    "service_needed": "string"
  },
  "status": "new | contacted | quoted | booked | completed",
  "timestamp": "ISO-8601"
}
```

## Quick start (Docker)

1. Copy environment template: `cp .env.example .env` and fill client keys (Twilio, SendGrid, GTM, etc.).
2. `docker compose up --build`
3. Services (defaults): web `http://localhost:3000`, logic engine `http://localhost:8000`, WordPress `http://localhost:8080`, Postgres `localhost:5432`.

## Local development (without Docker)

**Logic engine**

```bash
cd services/logic-engine
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Next.js**

```bash
cd apps/web
cp ../../.env.example ../../.env.local   # optional; see env vars below
npm install
npm run dev
```

Set `LOGIC_ENGINE_URL=http://localhost:8000` for the Next.js server API route that proxies to `/webhook/new-lead`.

## Implemented in this foundation

- `/webhook/new-lead` and `/webhook/status-update` in FastAPI (`completed` triggers review-request SMS path when Twilio is configured).
- Next.js landing form posting to `/api/lead`, which forwards to the logic engine using `LOGIC_ENGINE_URL`.
- GTM bootstrap via `NEXT_PUBLIC_GTM_ID` plus `dataLayer` helpers for CTA events.
- Dashboard stub at `/dashboard` with funnel columns and a live `/health` check against the API.
- WordPress plugin registering `apex_lead`, `apex_vehicle`, and `apex_work_order` CPTs with `show_in_rest` enabled (JWT / ACF flows are follow-ups).

## Branding (“skin”)

Adjust CSS variables in `apps/web/src/app/globals.css` (`--apex-*`) per client deployment; Tailwind arbitrary properties already reference those tokens.
