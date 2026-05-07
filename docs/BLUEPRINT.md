# Project Apex — Internal Development Blueprint

> Confidential · Agency Asset · 2024

## 1. Vision

Project Apex is a high-performance, white-label marketing ecosystem for the automotive
service industry, sold as a **Product-as-an-Agency**. The first deployment is for our
internal Auto Company and serves as the **Golden Image** for all future client sites.

### Key Objectives
- **Speed** — sub-1s load times on mobile for max conversion.
- **Automation** — eliminate manual follow-ups via Python-driven SMS/Email.
- **Attribution** — track each customer from ad source to invoice.
- **Scalability** — deploy a new client in under 10 minutes via Docker.

## 2. System Architecture

| Layer              | Tech                    | Responsibility                                              |
| ------------------ | ----------------------- | ----------------------------------------------------------- |
| Frontend (Public)  | Next.js / Tailwind      | Landing pages, lead capture, Core Web Vitals                |
| Frontend (Admin)   | React + TypeScript      | Shop Owner Dashboard, CRM-Lite, Kanban funnel               |
| Backend (CMS)      | WordPress (Headless)    | ACF Pro data, JWT auth, REST/GraphQL                        |
| Logic Engine       | Python (FastAPI)        | Webhooks, Twilio/SendGrid, GA4 ingestion                    |
| Infrastructure     | Docker / PostgreSQL     | Containerized deploy, relational storage                    |

## 3. Workstreams

### Role A — Frontend & UX Lead (TS/JS)
- Public site, optimized for Core Web Vitals.
- Lead Management Dashboard:
  - Kanban-style funnel (drag-and-drop status transitions).
  - Analytics widget pulling from the FastAPI Logic Engine.
- GTM data-layer events on every CTA.

### Role B — Backend & WP Architect (PHP)
- Configure WordPress headless: REST + GraphQL.
- Custom Post Types: `Leads`, `Vehicles`, `Work_Orders`.
- Custom WP plugin (`apex-core`) for site-specific logic (ACF Pro required).
- JWT authentication for dashboard access.

### Role C — Automation & Data Engineer (Python)
- FastAPI middleware:
  - `POST /webhook/new-lead` → fire Twilio SMS + SendGrid Email.
  - `POST /webhook/status-update` → fire review request when status flips to `completed`.
- Pipe GA4 conversion data into the dashboard.
- Author the `docker-compose` stack for rapid deployment.

## 4. Plug-and-Play Workflow

1. **Clone** — spin up the Dockerized WP / Python stack.
2. **Key Swap** — inject client API keys (Twilio, Google, Stripe) via `.env`.
3. **Skin** — apply branding via the Tailwind config.
4. **Deploy** — launch on a sub-domain (`portal.clientname.com`).

## 5. Canonical Lead Schema

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

This shape is enforced in code by `services/logic-engine/app/schemas/lead.py` and is the
contract for **every** inter-service message.
