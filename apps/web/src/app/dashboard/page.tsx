import Link from "next/link";

import type { LeadPayload, LeadStatus } from "@/types/lead";

export const dynamic = "force-dynamic";

const MOCK_PIPE: Record<LeadStatus, LeadPayload[]> = {
  new: [
    {
      lead_id: "00000000-0000-4000-8000-000000000001",
      source: "google_search",
      customer: {
        name: "Jordan Lee",
        phone: "+15555550123",
        email: "jordan@example.com",
      },
      vehicle: {
        make: "Honda",
        model: "Civic",
        service_needed: "Brake inspection",
      },
      status: "new",
      timestamp: new Date().toISOString(),
    },
  ],
  contacted: [],
  quoted: [
    {
      lead_id: "00000000-0000-4000-8000-000000000002",
      source: "fb_ad",
      customer: {
        name: "Sam Rivera",
        phone: "+15555550987",
        email: "sam@example.com",
      },
      vehicle: {
        make: "Ford",
        model: "F-150",
        service_needed: "Oil leak diagnosis",
      },
      status: "quoted",
      timestamp: new Date().toISOString(),
    },
  ],
  booked: [],
  completed: [],
};

const COLUMNS: LeadStatus[] = [
  "new",
  "contacted",
  "quoted",
  "booked",
  "completed",
];

async function enginePulse(): Promise<{ ok: boolean; latencyMs?: number }> {
  const base =
    process.env.LOGIC_ENGINE_URL ?? process.env.NEXT_PUBLIC_LOGIC_ENGINE_URL;
  if (!base) return { ok: false };
  const started = Date.now();
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/health`, {
      cache: "no-store",
    });
    return { ok: res.ok, latencyMs: Date.now() - started };
  } catch {
    return { ok: false };
  }
}

export default async function DashboardPage() {
  const pulse = await enginePulse();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-[color:var(--apex-muted)]">
            Shop owner view
          </p>
          <h1 className="text-3xl font-semibold">Lead pipeline</h1>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-[color:var(--apex-accent)] hover:underline"
        >
          ← Back to site
        </Link>
      </header>

      <section className="rounded-2xl border border-[color:var(--apex-border)] bg-[color:var(--apex-surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Logic engine</h2>
        <p className="mt-2 text-sm text-[color:var(--apex-muted)]">
          Analytics from GA4 and conversion payloads will land here. Today we only
          verify connectivity to FastAPI.
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-[color:var(--apex-background)] p-4">
            <dt className="text-[color:var(--apex-muted)]">Health</dt>
            <dd className="text-lg font-semibold">
              {pulse.ok ? "Reachable" : "Unavailable"}
            </dd>
          </div>
          <div className="rounded-xl bg-[color:var(--apex-background)] p-4">
            <dt className="text-[color:var(--apex-muted)]">Latency</dt>
            <dd className="text-lg font-semibold">
              {pulse.latencyMs != null ? `${pulse.latencyMs} ms` : "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-[color:var(--apex-background)] p-4">
            <dt className="text-[color:var(--apex-muted)]">Next step</dt>
            <dd className="text-lg font-semibold">Kanban drag-and-drop</dd>
          </div>
        </dl>
      </section>

      <section className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((status) => (
          <div
            key={status}
            className="min-w-[240px] flex-1 rounded-2xl border border-dashed border-[color:var(--apex-border)] bg-[color:var(--apex-surface-muted)] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold capitalize">{status}</h3>
              <span className="rounded-full bg-[color:var(--apex-background)] px-2 py-0.5 text-xs text-[color:var(--apex-muted)]">
                {MOCK_PIPE[status].length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {MOCK_PIPE[status].map((lead) => (
                <article
                  key={lead.lead_id}
                  className="rounded-xl border border-[color:var(--apex-border)] bg-[color:var(--apex-background)] p-3 shadow-sm"
                >
                  <p className="font-medium">{lead.customer.name}</p>
                  <p className="text-xs text-[color:var(--apex-muted)]">
                    {lead.vehicle.make} {lead.vehicle.model}
                  </p>
                  <p className="mt-2 text-sm">{lead.vehicle.service_needed}</p>
                  <p className="mt-2 text-xs uppercase text-[color:var(--apex-muted)]">
                    {lead.source.replace("_", " ")}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
