# DigitalOcean hosting (Project Apex)

Use this as a **starting point** when your domain and Droplet are ready. Align tiers with [ENVIRONMENTS.md](./ENVIRONMENTS.md) (demo / staging / production).

---

## What usually works well for this stack

| Approach | Fits Apex? |
|----------|----------------|
| **Ubuntu Droplet + Docker Compose** | **Yes** — matches your repo today (API, Postgres, WP, MySQL). One Droplet per environment *or* separate Droplets for staging vs prod. |
| **DigitalOcean Managed Postgres** | **Strong for production** — backups, updates, less ops than container DB on a single small Droplet. Point `DATABASE_URL` at the managed connection string. |
| **App Platform** | Possible for **Next.js** later; running **WordPress + Compose** alongside is awkward — **Droplet is simpler** until you split services. |
| **Spaces (object storage)** | Optional later for media off Droplet disk. |

---

Before going live, walk **[HOSTING-READINESS.md](./HOSTING-READINESS.md)** (Compose port binds, CORS, TLS, firewall).

## Network & DNS

1. Buy domain (registrar can stay anywhere).
2. In DO **Networking → Domains**, point records to your Droplet **public IPv4** (or **Floating IP** for production if you want stable failover story later).
3. Typical records:
   - `A` **`www`** → Droplet  
   - `A` **`api`** / **`staging-api`** → same or separate Droplet per tier  
   - Optional **`portal`** for dashboard hostnames per [TENANT-AND-INFRA-RULES.md](./TENANT-AND-INFRA-RULES.md)

Use **HTTPS** at the edge (**Caddy**, **Traefik**, or **nginx** + Let’s Encrypt). Do not expose Postgres **`5432`** or MySQL **`3306`** publicly.

---

## Firewall

On the Droplet (`ufw` typical):

- Allow **22** (SSH; restrict to your IP if possible), **80**, **443**.
- Deny inbound database ports from the internet.

---

## Sizing (rough)

- **Staging / demo:** 2–4 GB RAM minimum if WP + Postgres + API share one Droplet; watch OOM during WP admin spikes.
- **Production:** Prefer **splitting** DB (managed Postgres) or **separate** Droplet for DB before you need multi-tenant heavy loads.

---

## Environment files on the server

Use **[`deploy/`](../deploy/README.md)** templates (`env.staging.example`, `env.production.example`). Copy to `.env` on the server; never commit real values.

Set **`CORS_ORIGINS`** to your real **Next** / **WP front** URLs for that environment.

---

## Backups

- **Snapshots** for Droplet DR (not a substitute for logical DB backups).
- **`pg_dump`** schedule for Postgres (mandatory for production leads).

---

## Changelog

- **2026-05-10:** Initial DigitalOcean guidance for Droplet + Compose.
