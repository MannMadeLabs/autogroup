# Contributing to Project Apex

## Toolchain

| Stack | Version |
|-------|---------|
| Python | 3.12+ |
| Node.js | 20+ |
| Docker / Compose | Current stable |

## Local setup

```bash
cp .env.example .env
docker compose up --build
```

```bash
cd apps/web && cp .env.example .env.local && npm install && npm run dev
```

```bash
cd services/api && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Quality gates (run before pushing)

From the repo root:

```bash
make lint-api    # ruff + pytest
make lint-web    # eslint + tsc

make fmt-web     # prettier --write (optional before PR)
```

Or use [`Makefile`](./Makefile) targets `fmt-api` / `fmt-web` to auto-format.

CI runs the same checks on every PR (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Dependency updates

- **Python:** `services/api/requirements.txt` — pin ranges appropriate for libraries; CI validates install.
- **Node:** commit **`package-lock.json`** after `npm install` when dependencies change (improves reproducible installs and Dependabot).

## Secrets

Never commit `.env`, `.env.local`, or API keys. Use `.env.example` / `apps/web/.env.example` as templates only.
