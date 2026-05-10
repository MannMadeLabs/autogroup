# Hosting readiness checklist

Use this before and after your first **DigitalOcean** (or any VPS) deploy. It complements [DIGITALOCEAN-HOSTING.md](./DIGITALOCEAN-HOSTING.md) and [STAGING.md](./STAGING.md).

---

## Repository / application

| Item | Status |
|------|--------|
| **API production safety** | With `APP_ENV=production`, OpenAPI **`/docs`** and **`/openapi.json`** are **disabled**; **`/`** returns minimal JSON (no internal path hints). |
| **CORS** | **Required** in production: set **`CORS_ORIGINS`** to comma-separated **HTTPS** origins for your Next/public sites. Startup **fails** if production has empty origins. |
| **Secrets** | Root `.env` / server env only — never committed. Use **[`deploy/`](../deploy/README.md)** templates per tier. |
| **Internal API** | `INTERNAL_API_KEY` protects **`GET/PATCH /internal/*`** — rotate per environment; treat like a password. |
| **Webhooks** | Set **`WEBHOOK_SECRET`** and send **`X-Apex-Secret`** from WordPress/server callers in staging/prod. |

---

## Docker Compose (this repo)

| Item | Notes |
|------|--------|
| **Postgres `5432`** | Published as **`127.0.0.1:5432`** only — not reachable from the public internet; use **SSH tunnel** or admin on-host for `psql`. |
| **API `8000`** | **`127.0.0.1:8000`** — expose HTTPS only via **reverse proxy** (Caddy/nginx/Traefik) on `:443`. |
| **WordPress `8080`** | **`127.0.0.1:8080`** — same; admin should go through **TLS + VPN/IP allowlist** in production. |
| **Health** | API container includes a **healthcheck** for orchestration / proxy upstream checks. |

Containers still talk over the **Docker network** (`postgres` hostname, etc.); host binding limits **WAN** exposure.

---

## What you still do on the server

1. **Firewall (`ufw`):** allow **22** (restricted if possible), **80**, **443** — **not** 5432 / 8000 / 8080 from outside.
2. **TLS:** terminate HTTPS at the proxy; proxy to **`127.0.0.1:8000`** (API) and optionally **`127.0.0.1:8080`** (WP) or run Next separately.
3. **Env:** copy **`deploy/env.staging.example`** or **`env.production.example`** → `.env`; set **`APP_ENV`**, **`CORS_ORIGINS`**, DB URLs, keys.
4. **Next.js:** build/run with **`NEXT_PUBLIC_APEX_API_URL`** pointing at your **public API URL** (the proxy URL, not `localhost`).
5. **Backups:** schedule **`pg_dump`** or use **Managed Postgres** with automated backups.

---

## Optional hardening (later)

- Rate limiting / WAF at edge for **`/webhook/*`**.
- Replace shared **`INTERNAL_API_KEY`** with session/JWT for **`/leads`** ([ENVIRONMENTS.md](./ENVIRONMENTS.md)).
- Separate Compose **profiles** if demo stacks omit WordPress.

---

## Changelog

- **2026-05-10:** Initial checklist + Compose localhost binds + production OpenAPI/CORS behaviour.
