# Project Apex

Project Apex is a white-label automotive growth engine designed as a
"product-as-an-agency" system. This repository is the master template ("Golden
Image") used for internal deployment and future client onboarding.

## Stack Overview

- **Public Frontend:** Next.js + Tailwind CSS (`apps/public-site`)
- **Admin Frontend:** React + TypeScript (Vite) (`apps/admin-dashboard`)
- **CMS / Auth:** WordPress (headless-ready) + PostgreSQL (`docker-compose.yml`)
- **Logic Engine:** FastAPI middleware for webhooks + automation (`services/logic-engine`)

## Initial Capabilities Included

- Standardized lead contract (`packages/contracts/lead.schema.json`)
- FastAPI endpoints:
  - `POST /webhook/new-lead` → lead intake + SMS/Email trigger
  - `POST /webhook/status-update` → review request trigger on completed
  - `GET /healthz` → service health
- Docker Compose stack for WordPress + PostgreSQL + Logic Engine
- Starter public landing page with GTM data layer event hook
- Starter admin dashboard with Kanban-like lead pipeline and analytics widget shell

## Quick Start

1. Copy environment template:

   ```bash
   cp .env.example .env
   ```

2. Start core services:

   ```bash
   docker compose up --build
   ```

3. Service URLs:
   - WordPress: `http://localhost:8080`
   - FastAPI docs: `http://localhost:8000/docs`

## Plug-and-Play Workflow

1. **Clone** this repo and spin up Docker services.
2. **Key Swap** by updating `.env` values (Twilio, SendGrid, GA4, Stripe).
3. **Skin** client branding in Tailwind config(s) and public app theme tokens.
4. **Deploy** to the client subdomain infrastructure.

## Next Implementation Steps

- Add WordPress custom plugin (CPTs + JWT + ACF field mapping).
- Implement backend persistence and attribution models.
- Connect admin analytics widget to real logic engine metrics endpoints.
- Add CI pipelines for linting, testing, and container validation.
