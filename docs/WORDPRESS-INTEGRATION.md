# WordPress integration (Project Apex)

WordPress is the **headless CMS** for content, structured shop data, and (optionally) **lead intake** that must stay aligned with the **canonical lead JSON** and the **FastAPI** logic engine.

**Canonical payload:** [PROJECT-APEX.md](../PROJECT-APEX.md) section 5 (same shape used by Next.js and `/webhook/new-lead`).

---

## Roles WordPress plays

| Concern | WordPress | FastAPI / Postgres |
|---------|-----------|---------------------|
| Marketing pages, blog, SEO URLs | **Primary** (themes, blocks, ACF) | Consumes webhooks only |
| Structured records (lead, vehicle, work order) | **CPT + meta** (ACF Pro recommended) | **Persists operational truth** for automation (SMS/email, inbox, reporting) — today Postgres via API |
| Shop-owner authentication for dashboard | **JWT from WP** (application passwords or plugin) | Validates tenant context |

You can run **both** Next.js landing pages and WP pages during migration; long term, pick **one public front** per tenant to avoid duplicate SEO and split analytics.

---

## Recommended integration patterns

### A — WP as source of lead submission (forms)

1. Visitor submits **Gravity Forms / WS Form / custom block** → **WP REST or admin-post handler**.
2. Plugin creates or updates **`apex_lead`** CPT (draft → publish).
3. On **`publish`** / status change, plugin **`POST`s** to FastAPI:
   - `POST /webhook/new-lead` with section-5 JSON  
   - Optional: `POST /webhook/status-update` when WP mirrors funnel stage.

**Pros:** Editors control forms and thank-you pages in WP.  
**Cons:** You must **dedupe** (same lead saved in WP + Postgres via API) and handle failures (retry queue later).

### B — WP owns content only; Next.js owns forms

1. Marketing content comes from WP (headless fetch in Next).
2. Lead form still posts to **FastAPI** (current MVP).

**Pros:** Simplest automation path (already built).  
**Cons:** Forms are not in WP admin without extra integration.

### C — Hybrid

- **Public marketing:** WP or Next (pick per tenant).
- **Lead creation:** Always ends at **FastAPI** so **one pipeline** for Twilio/SendGrid and `/leads`.

---

## Custom Post Types (target shape)

Align CPT meta with [packages/schemas/lead.schema.json](../packages/schemas/lead.schema.json).

| CPT | Purpose | Key meta / fields |
|-----|---------|-------------------|
| **`apex_lead`** | Sales lead | Maps to `lead_id`, `source`, `customer.*`, `vehicle.*`, `status`, `timestamp` |
| **`apex_vehicle`** | Customer vehicles | Linked to lead / customer |
| **`apex_work_order`** | Shop floor job | Status, linkage to vehicle / lead |

**ACF Pro:** Use field groups per CPT; expose via **REST** or GraphQL (WPGraphQL) per your stack choice.

---

## Plugin in this repo

[`wordpress/plugins/apex-connector/`](../wordpress/plugins/apex-connector/) registers CPT stubs and documents hooks for calling the logic API.

**Configuration (to implement / env):**

- **`APEX_LOGIC_URL`** — base URL for FastAPI (e.g. `http://api:8000` inside Compose, public URL on DigitalOcean).
- **`APEX_WEBHOOK_SECRET`** — must match API `WEBHOOK_SECRET` when sending server-side requests.

Use **`wp-config.php` constants** or **network settings** — never commit secrets.

---

## REST / security

- Prefer **Application Passwords** or a **JWT plugin** for dashboard SPA auth (Role B in blueprint).
- **Webhook ingress:** signed requests (`X-Apex-Secret` or HMAC body) from WP → FastAPI.
- Lock **`wp-admin`** behind VPN, IP allowlist, or separate hostname not linked from public CTAs.

---

## Phased implementation

1. **Phase 1:** CPTs registered + REST readable; manual QA in WP admin. *(stub plugin starts here)*  
2. **Phase 2:** On lead publish → `POST /webhook/new-lead` + error logging.  
3. **Phase 3:** Bi-directional status (WP stage ↔ FastAPI) or WP-as-display-only with Postgres as source of truth.  
4. **Phase 4:** ACF field parity + per-tenant config (golden image → clone).

---

## Changelog

- **2026-05-10:** Initial architecture + pointer to `apex-connector` stub.
