declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Push a GTM-friendly event after ensuring `dataLayer` exists (browser only). */
export function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

/** Convention: event name + apex namespace for downstream GA4 mapping. */
export function pushCtaEvent(
  ctaId: string,
  extra: Record<string, unknown> = {},
): void {
  pushDataLayer({
    event: "apex_cta_click",
    cta_id: ctaId,
    ...extra,
  });
}
