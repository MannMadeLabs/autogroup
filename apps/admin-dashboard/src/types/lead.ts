/**
 * Mirrors services/logic-engine/app/schemas/lead.py.
 * Keep these literals in sync with the Python LeadStatus / LeadSource enums.
 */

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'booked' | 'completed';
export type LeadSource = 'fb_ad' | 'google_search' | 'organic';

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Vehicle {
  make: string;
  model: string;
  service_needed: string;
}

export interface Lead {
  lead_id: string;
  source: LeadSource;
  customer: Customer;
  vehicle: Vehicle;
  status: LeadStatus;
  timestamp: string;
}

export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'quoted',
  'booked',
  'completed',
];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  booked: 'Booked',
  completed: 'Completed',
};

export interface AnalyticsSummary {
  funnel: Record<LeadStatus, number>;
  leads_total: number;
  ga4: {
    property_id: string;
    sessions: number;
    conversions: number;
    conversion_rate: number;
    by_source: Record<string, number>;
  };
}
