# Project Apex

> High-performance, white-label marketing ecosystem for the automotive service industry.
> Product-as-an-Agency. The **Auto Company** deployment is the Golden Image for all future clients.

## Objectives

- **Speed** — sub-1s mobile load on the public site (Core Web Vitals first).
- **Automation** — Python-driven SMS (Twilio) + Email (SendGrid) follow-ups.
- **Attribution** — every customer tracked from ad source to invoice.
- **Scalability** — Docker Compose, deployable to a new sub-domain in under 10 minutes.

## Architecture

| Layer              | Technology              | Responsibility                                                   |
| ------------------ | ----------------------- | ---------------------------------------------------------------- |
| Frontend (Public)  | Next.js / Tailwind CSS  | Landing pages & lead capture                                     |
| Frontend (Admin)   | React + TypeScript      | "Shop Owner" Dashboard / CRM-Lite                                |
| Backend (CMS)      | WordPress (Headless)    | ACF data, user auth, REST/GraphQL endpoints                      |
| Logic Engine       | Python (FastAPI)        | Webhooks, Twilio/SendGrid, GA4 ingestion                         |
| Infrastructure     | Docker / PostgreSQL     | Containerized deployment & relational storage                    |

```
┌───────────────────┐      ┌──────────────────┐
│  Next.js Public   │ ───▶ │   FastAPI Logic  │ ◀─── Twilio / SendGrid / GA4
│   (Tailwind)      │      │      Engine      │
└───────────────────┘      └────────┬─────────┘
        ▲                           │
        │                           ▼
┌───────────────────┐      ┌──────────────────┐
│  Admin Dashboard  │ ───▶ │     Postgres     │
│   (React + TS)    │      └──────────────────┘
└───────────────────┘
        ▲
        │
┌───────────────────┐
│  WordPress (HL)   │  ACF Pro · CPTs · JWT
└───────────────────┘
```

## Repo Layout

```
project-apex/
├── apps/
│   ├── public-site/         # Next.js + Tailwind (Role A)
│   └── admin-dashboard/     # React + TS Kanban CRM (Role A)
├── services/
│   ├── logic-engine/        # FastAPI + SQLAlchemy + Twilio/SendGrid/GA4 (Role C)
│   └── wordpress/           # WP container config + apex-core plugin (Role B)
├── infra/
│   └── docker/              # Per-service Dockerfiles
├── docs/                    # Blueprint, runbook, plug-and-play protocol
├── docker-compose.yml       # Full stack orchestrator
├── .env.example             # Master env template
└── README.md
```

## Quick Start

```bash
cp .env.example .env                 # 1. Provision env
docker compose up --build            # 2. Bring up the stack
```

Once up:

| Service           | URL                       |
| ----------------- | ------------------------- |
| Public site       | http://localhost:3000     |
| Admin dashboard   | http://localhost:3001     |
| FastAPI docs      | http://localhost:8000/docs |
| WordPress admin   | http://localhost:8080/wp-admin |

## Plug-and-Play Protocol (new client)

1. **Clone** this repo to `clientname-apex`.
2. **Key Swap** — populate `.env` with the client's Twilio / SendGrid / GA4 / Stripe keys.
3. **Skin** — update `apps/public-site/tailwind.config.ts` brand tokens and `NEXT_PUBLIC_BRAND_NAME`.
4. **Deploy** — point `portal.clientname.com` at the host running `docker compose up`.

## Lead Object (canonical schema)

All services exchange the [`Lead`](services/logic-engine/app/schemas/lead.py) shape:

```json
{
  "lead_id": "UUID",
  "source": "fb_ad | google_search | organic",
  "customer": { "name": "string", "phone": "string", "email": "string" },
  "vehicle":  { "make": "string", "model": "string", "service_needed": "string" },
  "status":   "new | contacted | quoted | booked | completed",
  "timestamp": "ISO-8601"
}
```

## Workstreams

- **Role A — Frontend / UX (TS/JS)** — `apps/public-site`, `apps/admin-dashboard`
- **Role B — WP Architect (PHP)** — `services/wordpress/plugin-apex-core`
- **Role C — Automation / Data (Python)** — `services/logic-engine`

See [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md) for the full product brief.
