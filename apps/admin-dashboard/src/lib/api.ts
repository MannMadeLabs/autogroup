import type { AnalyticsSummary, Lead, LeadStatus } from '@/types/lead';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let detail: unknown = null;
    try {
      detail = await res.json();
    } catch {
      /* ignore */
    }
    throw new Error(`HTTP ${res.status} ${res.statusText} ${JSON.stringify(detail)}`);
  }
  return (await res.json()) as T;
}

export const api = {
  listLeads: (limit = 200) => request<Lead[]>(`/leads?limit=${limit}`),
  getAnalytics: (days = 7) => request<AnalyticsSummary>(`/analytics/summary?days=${days}`),
  updateStatus: (leadId: string, status: LeadStatus) =>
    request<Lead>('/webhook/status-update', {
      method: 'POST',
      body: JSON.stringify({ lead_id: leadId, status }),
    }),
};
