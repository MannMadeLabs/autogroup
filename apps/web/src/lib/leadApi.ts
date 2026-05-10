/**
 * Browser → Next.js API route → FastAPI (internal key stays server-side for PATCH from route only).
 */
export async function patchLeadStatus(leadId: string, status: string): Promise<void> {
  const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data?.detail ?? data);
    throw new Error(detail || `Update failed (${res.status})`);
  }
}
