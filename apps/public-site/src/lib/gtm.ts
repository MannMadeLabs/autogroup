/**
 * GTM data-layer helper.
 *
 * Per the blueprint, every CTA must push a typed event into `window.dataLayer`
 * so the agency can attribute conversions back to the original ad source.
 */

export type ApexEvent =
  | { event: 'cta_click'; label: string; location: string }
  | { event: 'lead_submit_attempt'; source: string }
  | { event: 'lead_submit_success'; lead_id: string; source: string }
  | { event: 'lead_submit_error'; source: string; reason: string };

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function pushEvent(event: ApexEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}
