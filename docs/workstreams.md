# Project Apex Workstreams (Initial Backlog)

## Role A — Frontend & UX Lead (TS/JS)

1. Optimize public landing page LCP and CLS budgets for mobile-first traffic.
2. Expand lead capture form with validation and source attribution tagging.
3. Build kanban board interactions in admin dashboard (drag/drop, optimistic updates).
4. Connect analytics cards to logic engine conversion endpoints.
5. Emit GTM data layer events for all CTA actions.

## Role B — Backend & WP Architect (PHP)

1. Enable headless API surface (REST and optional GraphQL plugin support).
2. Implement CPT metadata fields with ACF:
   - `leads`
   - `vehicles`
   - `work_orders`
3. Build plugin-level hooks for site-specific business logic.
4. Add JWT authentication flow for admin dashboard access.

## Role C — Automation & Data Engineer (Python)

1. Harden webhook flows with retries and idempotency keys.
2. Integrate Twilio SMS and SendGrid email providers.
3. Pipe GA4 conversion metrics to dashboard consumable endpoints.
4. Add persistence layer for lead status transitions and audit trail.
5. Extend docker compose overrides for rapid client environment provisioning.
