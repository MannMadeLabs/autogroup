import Link from "next/link";

import { LeadsKanban } from "@/components/LeadsKanban";
import { LeadsTableView } from "@/components/LeadsTableView";
import { LeadsViewToggle } from "@/components/LeadsViewToggle";
import type { LeadListItem } from "@/types/lead";

/** Avoid build-time fetch for `/internal/leads` during `next build`. */
export const dynamic = "force-dynamic";

async function loadLeads(): Promise<
  { ok: true; leads: LeadListItem[] } | { ok: false; reason: string }
> {
  const key = process.env.INTERNAL_API_KEY;
  const base =
    process.env.APEX_API_URL ??
    process.env.NEXT_PUBLIC_APEX_API_URL ??
    "http://localhost:8000";

  if (!key) {
    return {
      ok: false,
      reason:
        "Missing INTERNAL_API_KEY. Copy apps/web/.env.example to apps/web/.env.local and set INTERNAL_API_KEY to match the API.",
    };
  }

  const res = await fetch(`${base.replace(/\/$/, "")}/internal/leads`, {
    headers: { "X-Internal-Key": key },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      reason: `API returned ${res.status}: ${text}`,
    };
  }

  const data = (await res.json()) as { leads?: LeadListItem[] };
  return { ok: true, leads: data.leads ?? [] };
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams.view;
  const viewParam = Array.isArray(raw) ? raw[0] : raw;
  const view = viewParam === "table" ? "table" : "kanban";

  const result = await loadLeads();

  if (!result.ok) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">
          ← Back to site
        </Link>
        <h1 className="mt-6 text-2xl font-semibold text-neutral-900">Leads inbox</h1>
        <p className="mt-4 max-w-prose text-neutral-600">{result.reason}</p>
      </main>
    );
  }

  const { leads } = result;

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">
            ← Back to site
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Leads inbox</h1>
          <p className="mt-2 text-sm text-neutral-600">
            {view === "kanban"
              ? "Drag cards between columns to update status (saved to the API)."
              : "Use the dropdown in each row to change status."}{" "}
            {leads.length} lead(s).
          </p>
        </div>
        <LeadsViewToggle current={view} />
      </div>

      {view === "kanban" ? (
        <LeadsKanban initialLeads={leads} />
      ) : (
        <LeadsTableView leads={leads} />
      )}
    </main>
  );
}
