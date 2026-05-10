# Staging / single-server deploy (checklist)

Use this when you are ready to put **Project Apex** on a VPS with Docker, **before** or **as** the first “real” environment for Mann and Co. Adjust hostnames to your domain plan from [TENANT-AND-INFRA-RULES.md](./TENANT-AND-INFRA-RULES.md).

## 1. Server

- Ubuntu LTS (or similar) with **Docker Engine** + **Docker Compose v2**
- **Firewall:** allow `80` / `443` (and `22` for SSH). Do not expose Postgres `5432` to the public internet.
- **Swap** or enough RAM for WordPress + Postgres + API + (optional) Next.js.

## 2. Clone and env

On the server:

```bash
git clone https://github.com/MannMadeLabs/autogroup.git
cd autogroup
cp .env.example .env
```

Fill **at least**: `POSTGRES_*`, `DATABASE_URL` (if not using compose defaults), `TENANT_SLUG`, `INTERNAL_API_KEY`, `WEBHOOK_SECRET` (recommended), Twilio/SendGrid keys if messaging should fire in staging, `SHOP_NOTIFICATION_EMAIL`, `CORS_ORIGINS` including your staging Next URL (e.g. `https://staging-www.example.com`).

Never commit `.env`.

## 3. Bring the stack up

```bash
docker compose up -d --build
```

Confirm:

- API: `http://SERVER_IP:8000/health` (or behind HTTPS once proxied)
- WordPress: `:8080` (restrict later — admin should not be world-accessible without protection)

## 4. Reverse proxy + TLS (recommended)

Put **Caddy** or **Traefik** (or **nginx**) in front:

| Public hostname | Upstream (example) |
|-----------------|---------------------|
| `staging-api.yourdomain.com` | `http://127.0.0.1:8000` |
| `staging.yourdomain.com` | Next.js (run `npm run build && npm run start` on host, or add a `web` service to Compose later) |

Use Let’s Encrypt for HTTPS so browsers and webhooks see valid TLS.

## 5. Next.js on staging

Build the web app with staging URLs:

- **`NEXT_PUBLIC_APEX_API_URL`** — public URL of the API (e.g. `https://staging-api.yourdomain.com`)
- **`APEX_API_URL`** — same if server-side fetch uses the public host; use internal Docker hostname only if Next runs **inside** the same Compose network (e.g. `http://api:8000`).
- **`INTERNAL_API_KEY`** — **same** value as the API’s `INTERNAL_API_KEY`.

## 6. Smoke tests

1. Submit the lead form → row appears in Postgres / **`/leads`** inbox.
2. Drag a card or change status → **`completed`** triggers review SMS if Twilio + `REVIEW_REQUEST_URL` are set.
3. `GET /internal/leads` with `X-Internal-Key` returns JSON.

## 7. Backups

- Schedule **Postgres dumps** (per tenant DB policy later). For single-DB MVP, dump `apex` (or your `POSTGRES_DB`) regularly.

## 8. Production hardening (later)

- Separate staging vs production secrets and databases.
- Rate-limit `/webhook/*` at the edge.
- JWT/session auth for **`/leads`** instead of long-lived internal key + IP allowlist.
