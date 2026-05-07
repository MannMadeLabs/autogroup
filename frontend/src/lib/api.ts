const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface LeadPayload {
  source: "fb_ad" | "google_search" | "organic" | "referral" | "direct";
  customer: { name: string; phone: string; email?: string };
  vehicle?: {
    make?: string;
    model?: string;
    year?: string;
    service_needed?: string;
  };
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    ga4_client_id?: string;
  };
}

export async function submitLead(payload: LeadPayload) {
  const res = await fetch(`${API_URL}/webhook/new-lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Submission failed");
  }
  return res.json();
}

export function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  return Object.fromEntries(keys.filter((k) => params.has(k)).map((k) => [k, params.get(k)!]));
}
