import axios from "axios";
import type { Lead, LeadListResponse, KanbanBoard, DashboardSummary, TokenResponse } from "@/types";

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8000";

export const apiClient = axios.create({ baseURL: BASE_URL });

// Attach JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("apex_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("apex_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(username: string, password: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", { username, password });
  return data;
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function fetchLeads(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  source?: string;
  search?: string;
}): Promise<LeadListResponse> {
  const { data } = await apiClient.get<LeadListResponse>("/leads", { params });
  return data;
}

export async function fetchKanban(): Promise<KanbanBoard> {
  const { data } = await apiClient.get<KanbanBoard>("/leads/kanban");
  return data;
}

export async function fetchLead(id: string): Promise<Lead> {
  const { data } = await apiClient.get<Lead>(`/leads/${id}`);
  return data;
}

export async function updateLead(id: string, body: Partial<Lead> & { notes?: string; assigned_to?: string }): Promise<Lead> {
  const { data } = await apiClient.patch<Lead>(`/leads/${id}`, body);
  return data;
}

export async function updateLeadStatus(id: string, status: string, notes?: string): Promise<Lead> {
  const { data } = await apiClient.post<Lead>("/webhook/status-update", {
    lead_id: id,
    status,
    notes,
  });
  return data;
}

export async function deleteLead(id: string): Promise<void> {
  await apiClient.delete(`/leads/${id}`);
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function fetchDashboardSummary(days = 30): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>("/analytics/dashboard", {
    params: { days },
  });
  return data;
}
