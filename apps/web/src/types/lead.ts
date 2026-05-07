/** Mirrors the Apex standardized Lead JSON across WP / FastAPI / dashboard. */

export type LeadSource = "fb_ad" | "google_search" | "organic";

export type LeadStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "booked"
  | "completed";

export interface LeadPayload {
  lead_id: string;
  source: LeadSource;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  vehicle: {
    make: string;
    model: string;
    service_needed: string;
  };
  status: LeadStatus;
  timestamp: string;
}
