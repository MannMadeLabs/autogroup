import Link from "next/link";

import { LeadStatusSelect } from "@/components/LeadStatusSelect";

type LeadListItem = {
  lead_id: string;
  tenant_slug: string;
  source: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_service_needed: string;
  lead_timestamp: string;
  created_at: string;
  updated_at: string;
};

async function loadLeads(): Promise<{ ok: true; leads: LeadListItem[] } | { ok: false; reason: string }> {
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

export default async function LeadsPage() {
  const result = await loadLeads();

  if (!result.ok) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
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
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">
            ← Back to site
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Leads inbox</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Server-side page — key stays off the browser. {leads.length} lead(s) shown.
          </p>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-900">
            {leads.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-neutral-500" colSpan={6}>
                  No leads yet — submit the form on the home page.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.lead_id}>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                    {new Date(lead.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.customer_name}</div>
                    <div className="text-neutral-600">{lead.customer_phone}</div>
                    <div className="text-neutral-600">{lead.customer_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.vehicle_make} {lead.vehicle_model}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-neutral-700">
                    {lead.vehicle_service_needed}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                    {lead.source}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    <LeadStatusSelect
                      leadId={lead.lead_id}
                      currentStatus={lead.status}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
