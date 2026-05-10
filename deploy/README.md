# Deploy — environment file templates

These templates map to **[docs/ENVIRONMENTS.md](../docs/ENVIRONMENTS.md)** (demo → staging → production).

| File | Use when |
|------|----------|
| [`env.demo.example`](./env.demo.example) | Developer machines & shared demo hosts — disposable data, sandbox messaging OK |
| [`env.staging.example`](./env.staging.example) | Semi-production — separate DB & keys from prod |
| [`env.production.example`](./env.production.example) | Live — real secrets only via vault/host env |

## How to use

1. Copy the tier you need (never commit real secrets):

   ```bash
   cp deploy/env.staging.example .env
   # edit .env with real values
   ```

2. Keep **[`.env.example`](../.env.example)** as the **canonical variable list**. When you add a new variable there, add it to the matching tier template here too.

3. **Next.js** (`apps/web`) still uses **`apps/web/.env.local`** — use the **same `INTERNAL_API_KEY`** as the API for that tier, and set `NEXT_PUBLIC_APEX_API_URL` / `APEX_API_URL` to that tier’s public API URL.

4. **Naming on servers:** some teams store these as `/etc/autogroup/staging.env` or use a secrets manager — same contents, different delivery.
