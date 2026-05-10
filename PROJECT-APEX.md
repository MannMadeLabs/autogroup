# PROJECT APEX

**Internal Development Blueprint: Automotive Growth Engine & CRM-Lite**

Project Apex Internal Documentation | Confidential | 2024 Agency Assets

---

## 1. Project Vision

Project Apex is a high-performance, white-label marketing ecosystem designed for the automotive service industry. We are building a **Product-as-an-Agency** model. Our first implementation is for our internal Auto Company, which serves as the **Golden Image** for all future client deployments.

### Key objectives

- [ ] **Speed:** Sub-1 second load times for maximum mobile conversion.
- [ ] **Automation:** Eliminate manual follow-ups using Python-driven SMS/Email.
- [ ] **Attribution:** Track every customer from the original ad source to the final invoice.
- [ ] **Scalability:** Deployable via Docker in under 10 minutes for new clients.

---

## 2. System Architecture

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| Frontend (Public) | Next.js / Tailwind CSS | High-performance landing pages & lead capture. |
| Frontend (Admin) | React + TypeScript | Proprietary **Shop Owner** Dashboard & CRM view. |
| Backend (CMS) | WordPress (Headless) | Data management (ACF), user auth, API endpoints. |
| Logic Engine | Python (FastAPI) | Webhooks, Twilio/SendGrid integration, GA4 data processing. |
| Infrastructure | Docker / PostgreSQL | Containerized deployment and relational data storage. |

---

## 3. Development workstreams

### Role A: Frontend & UX Lead (TS/JS)

- [ ] Build the customer-facing site with focus on Core Web Vitals.
- [ ] Develop the Lead Management Dashboard:
  - [ ] Kanban-style board for dragging leads through the funnel.
  - [ ] Analytics widget pulling data from the Python Logic Engine.
- [ ] Implement GTM data layer events for all CTA buttons.

### Role B: Backend & WP Architect (PHP)

- [ ] Configure WordPress Headless: REST and/or GraphQL.
- [ ] Create Custom Post Types (CPTs): Leads, Vehicles, Work_Orders.
- [ ] Build a custom WP plugin for site-specific logic (**ACF Pro** required).
- [ ] Implement JWT authentication for dashboard access.

### Role C: Automation & Data Engineer (Python)

- [ ] Build FastAPI middleware / services:
  - [ ] `POST /webhook/new-lead` — triggers Twilio SMS & SendGrid email.
  - [ ] `POST /webhook/status-update` — triggers review request when status is **Complete**.
- [ ] Integrate Google Analytics 4 API to pipe conversion data to the dashboard.
- [ ] Set up Docker Compose for rapid deployment.

---

## 4. The **Plug & Play** workflow (Master Template)

To keep this an agency asset, follow the **Master Template** protocol:

- [ ] **Clone:** Spin up the Dockerized WP/Python stack.
- [ ] **Key swap:** Inject new client API keys (Twilio, Google, Stripe) via `.env`.
- [ ] **Skin:** Apply client-specific branding via Tailwind config.
- [ ] **Deploy:** Launch to a sub-domain (e.g. `portal.clientname.com`).

---

## 5. Initial data schema (Lead object)

All developers must use this standardized JSON structure for communication between services:

```json
{
  "lead_id": "UUID",
  "source": "fb_ad | google_search | organic",
  "customer": {
    "name": "string",
    "phone": "string",
    "email": "string"
  },
  "vehicle": {
    "make": "string",
    "model": "string",
    "service_needed": "string"
  },
  "status": "new | contacted | quoted | booked | completed",
  "timestamp": "ISO-8601"
}
```

---

## Build readiness (quick sweep)

Use this before considering a milestone done:

- [ ] Vision objectives above still satisfied for this release.
- [ ] Public site meets performance/CWV targets where applicable.
- [ ] Lead payload matches section 5 schema end-to-end (CMS → FastAPI → comms).
- [ ] Webhooks and env-based key injection documented for the next client clone.
- [ ] Docker path verified on a clean machine or CI.
