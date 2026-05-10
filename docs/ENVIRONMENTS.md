# Environments: demo → staging → production

This document defines **three isolated tiers** so the dev team can iterate safely, stakeholders see something stable, and production stays protected.

**Related:** [STAGING.md](./STAGING.md) (single-server mechanics), [TENANT-AND-INFRA-RULES.md](./TENANT-AND-INFRA-RULES.md) (tenant identity & DB naming).

---

## Summary

| Tier | Purpose | Data | Secrets | Typical audience |
|------|---------|------|---------|------------------|
| **Demo** | Daily development, spikes, broken experiments OK | Disposable / seeded fixtures | Sandbox Twilio/SendGrid; test keys | Engineers |
| **Staging** | Pre-production validation (“semi-prod”) | Copy or anonymized subset of prod **or** long-lived staging-only data | **Separate** staging Twilio/SendGrid (or same vendor, **different** sender/reply profiles) | Internal team + trusted pilot users |
| **Production** | Live Mann & Co (then clients) | Real customer PII | Production keys only | Customers & ops |

**Rule:** Never point staging or demo at **production** vendor accounts without explicit sub-accounts / isolated sender IDs — one mis-sent SMS during a test erodes trust.

---

## 1. Demo (developer environment)

**Goals:** Fast feedback, safe failure, cheap to reset.

**Infrastructure (pick one model):**

- **Local:** Docker Compose on laptops (`docker compose up`) — already supported.
- **Shared demo host:** One small VPS or shared CI preview URL — optional “always-on” demo for the team.

**Data**

- Empty Postgres + seed script, **or** nightly reset from migration-only schema.
- No real customer phones/emails unless using **Twilio/SendGrid sandbox** verification lists.

**Configuration**

- Env prefix or file: **`.env.demo`** (gitignored) — document variables in `.env.example` only.
- `APP_ENV=demo` or `development` (pick one convention and stick to it across services).

**DNS (if hosted)**

- Example: `demo-apex.internal.yourcompany.com` (VPN-only is ideal) **or** `demo.autogroup.dev` with HTTP auth at the edge.

**Promotion**

- Demo does **not** promote to staging automatically — merge/review does.

---

## 2. Staging (semi-production)

**Goals:** Same topology and env shape as prod, different secrets and DB; final QA before prod.

**Infrastructure**

- Mirror prod layout: **Docker Compose on a VPS** today; same paths later if you move to orchestration.
- Separate Postgres instance **or** same server but **different database name + credentials** from prod (never shared).

**Data**

- Prefer **restored anonymized snapshot** from prod **or** dedicated staging data that never receives real marketing traffic without consent.

**Configuration**

- Distinct env file / vault entry: **`staging`** secrets for DB, `INTERNAL_API_KEY`, `WEBHOOK_SECRET`, Twilio, SendGrid, `SHOP_NOTIFICATION_EMAIL`, etc.
- `APP_ENV=staging`

**DNS**

- Examples: `staging-api.domain.com`, `staging-www.domain.com`, `staging-portal.domain.com` — match patterns in [TENANT-AND-INFRA-RULES.md](./TENANT-AND-INFRA-RULES.md).

**Promotion**

- **Staging → production:** tagged release (e.g. `v1.2.0`) + checklist (migrations, smoke tests, rollback note).

---

## 3. Production (live)

**Goals:** Availability, correctness, auditability, backups.

**Infrastructure**

- Hardened host(s), TLS everywhere, Postgres backups, restricted SSH, monitoring.

**Data**

- Single source of truth for real leads; tiered DB sizing per [commercial tiers](../README.md) / tenant rules.

**Configuration**

- Secrets only via vault / host env — **never** in repo.
- `APP_ENV=production`

**DNS**

- Customer-facing hosts per tenant rules; separate API / portal / marketing hostnames as designed.

**Changes**

- Prefer **small releases**; database migrations reviewed and tested on **staging first**.

---

## Isolation checklist (use before going live on any tier)

- [ ] **Database:** Unique DB name + credentials per environment (demo / staging / prod).
- [ ] **API keys:** Separate Twilio/SendGrid (or clearly isolated sub-users / API keys per env).
- [ ] **Internal API key:** Different `INTERNAL_API_KEY` per environment; rotate if leaked.
- [ ] **Webhook secret:** Different `WEBHOOK_SECRET` per environment if WP/external callbacks are used.
- [ ] **CORS:** `CORS_ORIGINS` lists **only** the front-end URLs for that environment.
- [ ] **Next.js:** `NEXT_PUBLIC_APEX_API_URL` and server `APEX_API_URL` target the **correct** API base URL for that tier.

---

## Suggested Git / deploy mapping (starting point)

| Environment | Branch / trigger | Deploy target |
|-------------|-------------------|---------------|
| Demo | feature branches → optional preview; `main` → shared demo host | Demo stack |
| Staging | `main` merge (after CI green) or manual workflow | Staging stack |
| Production | Release tag or protected `production` branch | Production stack |

Adjust to your review habits — the important part is **one promotion path everyone understands**.

---

## Changelog

- **2026-05-10:** Initial three-tier model (demo, staging, production).
