declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export function pushDataLayer(event: string, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...data });
}

export function trackLeadSubmit(service: string, source: string) {
  pushDataLayer("lead_submit", {
    service_type: service,
    lead_source: source,
  });
}

export function trackCTAClick(label: string, position: string) {
  pushDataLayer("cta_click", { cta_label: label, cta_position: position });
}

export function trackFormStart(formId: string) {
  pushDataLayer("form_start", { form_id: formId });
}
