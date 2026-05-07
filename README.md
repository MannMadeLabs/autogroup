# Project Apex

Project Apex is a white-label automotive growth engine and CRM-lite stack. This repository is the master template ("Golden Image") used for internal delivery and future client deployments.

## Repository Layout

```text
apps/
  public-site/         # Next.js + Tailwind landing pages and lead capture
  admin-dashboard/     # React + TypeScript owner dashboard and CRM view
services/
  logic-engine/        # FastAPI automation and webhook middleware
wordpress/
  plugins/apex-core/   # Custom plugin: CPTs + site-specific behavior
schemas/
  lead.schema.json     # Shared lead contract for all services
docs/
  workstreams.md       # Initial execution map by role
docker-compose.yml     # Local full-stack orchestration
```

## Quick Start

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Start all services:

   ```bash
   docker compose up --build
   ```

3. Default service URLs:
   - Public Site: <http://localhost:3000>
   - Admin Dashboard: <http://localhost:4173>
   - FastAPI Logic Engine: <http://localhost:8000/docs>
   - WordPress: <http://localhost:8080>

## Current Foundation Scope

- Standardized lead schema and matching FastAPI data models
- Webhook endpoints:
  - `POST /webhook/new-lead`
  - `POST /webhook/status-update`
- WordPress plugin scaffold with CPT registration:
  - `leads`
  - `vehicles`
  - `work_orders`
- Frontend starter shells for both public and admin applications
- Dockerized plug-and-play local workflow for key swap and branding skinning
