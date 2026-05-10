# Tenant & infrastructure rules (engineering)

**Purpose:** Fixed conventions so routing, databases, and secrets do not get guessed under pressure. Product numbers (exact caps, contracts) can evolve; **these structural rules should change rarely**.

**Related:** [PROJECT-APEX.md](../PROJECT-APEX.md) product blueprint.

---

## 1. Definitions

| Term | Meaning |
|------|---------|
| **Tenant** | One paying client deployment (one shop / brand / billing entity). |
| **Golden image** | Internal Mann Auto deployment — reference for every clone; never fork “special snowflake” logic without merging back. |
| **Environment** | `development` (local Docker), `staging`, `production`. Rules below apply per environment unless noted. |

---

## 2. Canonical tenant identity

Every tenant has **both**:

| Field | Rule |
|-------|------|
| **`tenant_id`** | **UUID v4**, immutable, generated at provisioning. Used in logs, JWT claims, cross-service correlation. Never recycle after offboarding. |
| **`tenant_slug`** | Short **DNS-safe** handle, immutable once issued (rename = new tenant record + migration project). |

**`tenant_slug` format**

- Lowercase ASCII only: `[a-z0-9-]`
- Length **3–32** characters
- No leading/trailing hyphen; no consecutive `--`
- Reserved slugs (reject at provisioning): `www`, `api`, `app`, `portal`, `admin`, `staging`, `demo`, `health`, `static`, `cdn`, `wp`, `cms`

Engineering must **never** use only display name or email domain as the sole key — always **`tenant_id`** in persistence and **`tenant_slug`** for hostnames.

---

## 3. Hostnames & DNS

Assume an **agency apex domain** (example: `mannmadelabs.com`) and optionally a **client apex** later (example: `mannauto.com`). Patterns:

| Surface | Production pattern | Notes |
|---------|-------------------|--------|
| Public marketing site | `{tenant_slug}.{agency_domain}` **or** dedicated customer domain CNAME’d to our edge | Next.js / static front. |
| Shop owner dashboard | `portal.{tenant_slug}.{agency_domain}` **or** `portal.{customer_domain}` | React app; auth boundary. |
| Logic API | `api.{tenant_slug}.{agency_domain}` **or** path-based only if edge forces it (`/t/{slug}/...`) — **prefer hostname routing** | FastAPI. |
| Headless CMS (WP admin / REST) | Not public by default; if exposed, **restrict by IP/VPN** or separate locked subdomain | Discuss per engagement. |

**Staging** uses explicit prefixes so mistakes cannot hit prod:

- `staging-www-{tenant_slug}.{agency_domain}` **or** `{tenant_slug}.staging.{agency_domain}`  
- Same idea for `staging-api-…` / `staging-portal-…` — **pick one pattern per agency** and document it in the staging runbook when that milestone starts.

**TLS:** Every public hostname must have HTTPS before accepting real PII or webhooks.

---

## 4. PostgreSQL: one database per tenant

**Rule:** **Separate database per tenant** (not separate servers required). Storage and backup boundaries follow commercial tier.

**Database name**

```
apex_<tenant_slug>
```

- Postgres identifier limit **63** characters; **`tenant_slug` max 32** keeps headroom.
- If slug ever conflicts with an existing DB on shared infra (rare), suffix with first **8 chars** of `tenant_id` hex: `apex_<slug>_<8chars>` — document in internal CRM row.

**Connection credentials**

- Prefer **unique DB user per tenant** on shared Postgres instances (`apex_<slug>_role`), least privilege on **that database only**.
- Connection URL never committed; injected via orchestrator / `.env` per deployment unit.

**Commercial tiers (product — refine numbers later)**

| Tier | Working label | Directional limit |
|------|-----------------|-------------------|
| 1 | ~100 customers | Size DB / enforce row caps accordingly |
| 2 | ~500 customers | Larger quota |
| 3 | Unlimited | Contract-defined; still **one DB per tenant** |

Exact enforcement (row counts vs disk quota vs archival) is **application + ops policy**; engineering reserves hooks for limits and warnings.

---

## 5. Secrets & configuration

| Secret / config | Rule |
|-----------------|------|
| **Twilio / SendGrid / GA / Stripe** | Prefer **per-tenant** keys in production; shared sandbox keys only in `development`. |
| **Webhook ingress (`WEBHOOK_SECRET`)** | Minimum **32 random bytes** (hex or base64); **per tenant** when multi-tenant API shares one process — never one global secret across all clients if compromise blast radius matters. |
| **Naming in vault / `.env`** | Prefix with tenant: `TENANT_<SLUG>_TWILIO_SID` or namespace JSON per tenant — pick one convention per repo and stay consistent. |

Never ship real secrets in git; **`.env.example` lists keys only.**

---

## 6. Request routing (logic API)

Resolve tenant in this **order** (first match wins):

1. **Hostname** contains `{tenant_slug}` (preferred).
2. **`X-Tenant-Slug`** or **`X-Tenant-ID`** header (internal services / WP server-side calls only — **not** browser-exposed without auth).
3. Authenticated JWT **`tenant_id`** claim for dashboard/session APIs.

Anonymous browser traffic must not switch tenants via easily forged headers alone — pair with session or signed tokens.

---

## 7. WordPress (when headless per tenant)

- One WP stack **per tenant** unless explicitly sharing a multisite — **default is dedicated WP DB per tenant** aligned with “separate DB” strategy.
- REST/GraphQL base URL and credentials stored per tenant next to DB routing.

---

## 8. Schema migrations & backups

- **Migrations:** Same migration revision applied to **every tenant DB** for a release (scripted job or runner — implementation later).
- **Backups:** At minimum **per-database** backup labels; higher tiers may require higher frequency (sales/ops decision).

---

## 9. Changes to this document

Amend via PR / review when conventions change; bump a short **changelog** section below.

### Changelog

- **2026-05-09:** Initial rules (tenant_id + slug, hostname patterns, `apex_<slug>` DB naming, tier placeholders).
