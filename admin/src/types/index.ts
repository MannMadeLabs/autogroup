export type LeadSource = "fb_ad" | "google_search" | "organic" | "referral" | "direct";

export type LeadStatus = "new" | "contacted" | "quoted" | "booked" | "completed" | "lost";

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface Vehicle {
  make?: string;
  model?: string;
  year?: string;
  service_needed?: string;
}

export interface Lead {
  lead_id: string;
  source: LeadSource;
  status: LeadStatus;
  customer: Customer;
  vehicle: Vehicle;
  timestamp: string;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  page_size: number;
}

export interface KanbanBoard {
  new: Lead[];
  contacted: Lead[];
  quoted: Lead[];
  booked: Lead[];
  completed: Lead[];
  lost: Lead[];
}

export interface DashboardSummary {
  period_days: number;
  total_leads: number;
  conversion_rate: number;
  by_status: Record<LeadStatus, number>;
  by_source: Record<LeadSource, number>;
  daily_trend: { date: string; count: number }[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
