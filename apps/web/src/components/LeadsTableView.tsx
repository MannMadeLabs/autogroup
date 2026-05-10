import type { LeadListItem } from "@/types/lead";

import { LeadStatusSelect } from "./LeadStatusSelect";

type Props = {
  leads: LeadListItem[];
};

export function LeadsTableView({ leads }: Props) {
  return (
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
  );
}
