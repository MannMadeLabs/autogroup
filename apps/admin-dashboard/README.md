# Apex Admin Dashboard (React + TS + Vite)

The shop-owner CRM-Lite. Two surfaces:

- **Analytics widget** — pulls funnel + GA4 rollup from
  `/analytics/summary` on the FastAPI Logic Engine.
- **Kanban funnel** — drag-and-drop on top of `@dnd-kit`. A drop fires
  `POST /webhook/status-update`; the Logic Engine enforces forward-only
  transitions and triggers SendGrid review requests on `completed`.

Type defs in `src/types/lead.ts` mirror `services/logic-engine/app/schemas/lead.py` —
keep them in sync when the canonical schema changes.

## Local

```bash
npm install
VITE_API_URL=http://localhost:8000 npm run dev
# http://localhost:3001
```
