# Project Apex — Automotive Growth Engine & CRM-Lite

A high-performance, white-label marketing ecosystem for the automotive service industry.  
**"Product-as-an-Agency"** — deploy a complete lead generation + CRM stack for a new client in under 10 minutes.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOCKER COMPOSE                           │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐  │
│  │   Next.js    │   │  React Admin │   │  FastAPI Backend  │  │
│  │  :3000       │   │  :3001       │   │  :8000            │  │
│  │  Public Site │   │  CRM Dash    │   │  Logic Engine     │  │
│  └──────┬───────┘   └──────┬───────┘   └────────┬──────────┘  │
│         │                  │                     │              │
│         └──────────────────┴──────────┬──────────┘             │
│                                       │                         │
│                    ┌──────────────────┴──────────────────┐      │
│                    │          PostgreSQL :5432            │      │
│                    └─────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  WordPress (Headless) :8080  +  MySQL :3306           │      │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Port | Responsibility |
|---|---|---|---|
| Public Site | Next.js 14 + Tailwind | 3000 | Landing pages, lead capture form, GTM events |
| Admin Dashboard | React + TypeScript + Vite | 3001 | Kanban CRM board, analytics charts, lead management |
| Logic Engine | Python FastAPI | 8000 | Webhooks, Twilio SMS, SendGrid Email, GA4, JWT Auth |
| Headless CMS | WordPress 6 (API-only) | 8080 | Content management, CPTs, WP REST API |
| Database (leads) | PostgreSQL 16 | 5432 | Leads, events, work orders, users |
| Database (WP) | MySQL 8 | 3306 | WordPress data store |

---

## Quick Start

### 1. Clone & Configure

```bash
git clone <repo-url>
cd project-apex
cp .env.example .env
# Edit .env with your API keys
```

### 2. Launch the Stack

```bash
docker compose up -d --build
```

All services start in the correct dependency order. The database is initialised automatically with seed data.

### 3. Access

| Service | URL | Default Credentials |
|---|---|---|
| Public Site | http://localhost:3000 | — |
| Admin Dashboard | http://localhost:3001 | admin / apex_admin_2024 |
| FastAPI Docs | http://localhost:8000/docs | (JWT required for protected routes) |
| WordPress Admin | http://localhost:8080/wp-admin | (set during WP setup) |

---

## Project Structure

```
project-apex/
├── backend/                    # FastAPI Logic Engine (Python)
│   ├── main.py                 # App entry point + lifespan
│   ├── config.py               # Pydantic settings (reads .env)
│   ├── auth.py                 # JWT auth utilities
│   ├── schemas.py              # Pydantic request/response models
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── base.py
│   │   └── lead.py             # Lead + LeadEvent models
│   ├── routes/
│   │   ├── webhooks.py         # POST /webhook/new-lead, /webhook/status-update
│   │   ├── leads.py            # CRUD + /leads/kanban
│   │   ├── analytics.py        # GET /analytics/dashboard + /analytics/ga4
│   │   └── auth.py             # POST /auth/login
│   ├── services/
│   │   ├── sms.py              # Twilio integration
│   │   ├── email.py            # SendGrid integration
│   │   ├── ga4.py              # GA4 Measurement Protocol + Data API
│   │   └── database.py         # Async SQLAlchemy session
│   └── tests/
│       ├── conftest.py         # In-memory SQLite test fixtures
│       └── test_webhooks.py
│
├── frontend/                   # Next.js 14 Public Site
│   └── src/
│       ├── app/
│       │   ├── layout.tsx      # Root layout + GTM script injection
│       │   ├── globals.css
│       │   └── page.tsx        # Landing page (hero, services, reviews, CTA)
│       ├── components/
│       │   ├── LeadCaptureForm.tsx   # RTF + Zod validated lead form
│       │   └── GTMScript.tsx         # GTM/dataLayer injection
│       └── lib/
│           ├── api.ts          # submitLead(), getUtmParams()
│           └── gtm.ts          # pushDataLayer(), trackLeadSubmit()
│
├── admin/                      # React + TypeScript Admin Dashboard
│   └── src/
│       ├── main.tsx            # React Router + React Query bootstrap
│       ├── types/index.ts      # Shared TypeScript interfaces
│       ├── lib/
│       │   ├── api.ts          # Axios client with JWT interceptor
│       │   └── auth.ts         # Token management
│       ├── components/
│       │   ├── layout/         # Sidebar, AppLayout (auth guard)
│       │   ├── kanban/         # KanbanColumn, KanbanCard (dnd-kit)
│       │   └── charts/         # LeadTrendChart, SourcePieChart (Recharts)
│       └── pages/
│           ├── LoginPage.tsx
│           ├── DashboardPage.tsx     # KPI cards + charts
│           ├── KanbanPage.tsx        # Drag-and-drop pipeline board
│           ├── LeadsPage.tsx         # Filterable + paginated table
│           ├── LeadDetailPage.tsx    # Full lead view + status update
│           ├── AnalyticsPage.tsx     # Attribution analytics
│           └── SettingsPage.tsx
│
├── wordpress/
│   ├── plugins/apex-core/      # Core WP plugin
│   │   ├── apex-core.php       # Plugin bootstrap
│   │   └── includes/
│   │       ├── class-cpts.php        # CPTs: Lead, Vehicle, Work_Order
│   │       ├── class-rest-api.php    # Custom REST routes
│   │       ├── class-cors.php        # CORS headers for headless
│   │       └── class-jwt-auth.php    # JWT token endpoint
│   └── themes/apex-headless/   # Minimal headless theme
│
├── database/
│   └── init.sql                # PostgreSQL DDL + seed data
│
├── nginx/
│   └── wp.conf                 # Nginx → PHP-FPM config for WordPress
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Lead Data Schema

All services communicate using this standardised JSON structure:

```json
{
  "lead_id": "UUID",
  "source": "fb_ad | google_search | organic | referral | direct",
  "customer": {
    "name": "string",
    "phone": "string",
    "email": "string"
  },
  "vehicle": {
    "make": "string",
    "model": "string",
    "year": "string",
    "service_needed": "string"
  },
  "status": "new | contacted | quoted | booked | completed | lost",
  "timestamp": "ISO-8601"
}
```

---

## API Reference

### Webhook Endpoints (no auth required — secure via network layer)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/webhook/new-lead` | Ingest a new lead; fires SMS + Email + GA4 |
| `POST` | `/webhook/status-update` | Update lead status; fires review request on `completed` |

### Authenticated Endpoints (JWT Bearer)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Get JWT token |
| `GET` | `/leads` | Paginated lead list with filters |
| `GET` | `/leads/kanban` | Leads grouped by status for board |
| `GET` | `/leads/{id}` | Single lead detail |
| `PATCH` | `/leads/{id}` | Update lead fields |
| `DELETE` | `/leads/{id}` | Delete lead |
| `GET` | `/analytics/dashboard` | KPI summary + trend data |
| `GET` | `/analytics/ga4` | GA4 conversion data |

Full interactive docs: **http://localhost:8000/docs**

---

## Automation Flows

### New Lead Flow
```
Form Submit → POST /webhook/new-lead
                ├── Save to PostgreSQL
                ├── [background] Twilio SMS → customer
                ├── [background] SendGrid Email → customer
                └── [background] GA4 event: generate_lead
```

### Job Completion Flow
```
Advisor marks "Completed" → POST /webhook/status-update
                               ├── Update lead status
                               ├── [background] Twilio SMS review request
                               ├── [background] SendGrid Email review request
                               └── [background] GA4 event: job_completed
```

---

## "Plug & Play" New Client Deployment

1. **Clone** this repo to a new directory or server
2. **Key Swap** — copy `.env.example` to `.env` and inject client's API keys:
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
   - `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
   - `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`
   - `NEXT_PUBLIC_GTM_ID`
3. **Skin** — update `SHOP_NAME`, `SHOP_PHONE`, `SHOP_REVIEW_LINK` in `.env`; customise Tailwind brand colours in `frontend/tailwind.config.ts` and `admin/tailwind.config.ts`
4. **Deploy** — `docker compose up -d --build` → point DNS to `portal.clientname.com`

Total time: **< 10 minutes** on a pre-provisioned VPS.

---

## Development

### Backend (Python)

```bash
cd backend
pip install -r requirements.txt
# Set DATABASE_URL in .env (or export it)
uvicorn main:app --reload
```

### Tests

```bash
cd backend
pip install aiosqlite pytest-asyncio
pytest tests/ -v
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

### Admin Dashboard (React)

```bash
cd admin
npm install
npm run dev       # http://localhost:3001
```

---

## Environment Variables

See [`.env.example`](.env.example) for the complete annotated list.  
Required at minimum to enable automation:

| Variable | Purpose |
|---|---|
| `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM_NUMBER` | SMS notifications |
| `SENDGRID_API_KEY` | Email notifications |
| `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` | Server-side GA4 events |
| `SECRET_KEY` | JWT signing (generate with `openssl rand -hex 32`) |

If any integration key is absent, that service runs in **dry-run mode** (logs the action, no external call) — the stack boots and functions without any third-party credentials.

---

## Security Notes

- Webhook endpoints (`/webhook/*`) should be placed behind your load balancer and restricted to known IPs in production
- The admin dashboard is not publicly accessible in production (serve behind VPN or auth proxy)
- Rotate `SECRET_KEY` and `WP_JWT_SECRET` per client deployment
- Never commit `.env` to version control

---

*Project Apex Internal Documentation | Confidential | 2024 Agency Assets*
