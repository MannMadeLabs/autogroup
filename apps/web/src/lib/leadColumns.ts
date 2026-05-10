import type { LeadListItem } from "@/types/lead";

/** Column / funnel order (matches API LeadStatus). */
export const LEAD_COLUMN_IDS = [
  "new",
  "contacted",
  "quoted",
  "booked",
  "completed",
] as const;

export type LeadColumnId = (typeof LEAD_COLUMN_IDS)[number];

export const COLUMN_LABELS: Record<LeadColumnId, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
  completed: "Completed",
};

export function normalizeStatus(status: string): LeadColumnId {
  if (LEAD_COLUMN_IDS.includes(status as LeadColumnId)) {
    return status as LeadColumnId;
  }
  return "new";
}

export function groupLeadsByColumn(leads: LeadListItem[]): Record<LeadColumnId, LeadListItem[]> {
  const empty = (): Record<LeadColumnId, LeadListItem[]> => ({
    new: [],
    contacted: [],
    quoted: [],
    booked: [],
    completed: [],
  });
  const groups = empty();
  for (const lead of leads) {
    const col = normalizeStatus(lead.status);
    groups[col].push(lead);
  }
  for (const id of LEAD_COLUMN_IDS) {
    groups[id].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  return groups;
}
