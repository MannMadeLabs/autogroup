# Project Apex Implementation Backlog

## Role A: Frontend & UX

- [x] Scaffold public Next.js + Tailwind app.
- [x] Add baseline GTM data layer helper + CTA event.
- [x] Scaffold admin React + TypeScript dashboard shell.
- [ ] Implement production Kanban drag-and-drop interactions.
- [ ] Connect analytics widget to FastAPI metrics endpoint.
- [ ] Add lead capture forms and conversion-focused page templates.

## Role B: Backend & WordPress

- [x] Scaffold Apex core WordPress plugin.
- [x] Register CPTs: Leads, Vehicles, Work Orders.
- [ ] Add ACF Pro field registration and sync strategy.
- [ ] Implement JWT authentication for dashboard access.
- [ ] Implement GraphQL schema and resolver mapping.

## Role C: Automation & Data

- [x] Add FastAPI service skeleton.
- [x] Implement `/webhook/new-lead`.
- [x] Implement `/webhook/status-update`.
- [ ] Integrate persistent storage for lead lifecycle history.
- [ ] Add GA4 ingestion and attribution transformation endpoints.
- [ ] Add retry/dead-letter handling for outbound notifications.
