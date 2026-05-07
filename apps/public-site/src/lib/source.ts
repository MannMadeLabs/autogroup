/**
 * Map URL params + referrer to the canonical Lead `source` enum.
 * Fallback is "organic". Stays in sync with services/logic-engine/app/schemas/lead.py.
 */

export type LeadSource = 'fb_ad' | 'google_search' | 'organic';

export function detectSource(): LeadSource {
  if (typeof window === 'undefined') return 'organic';
  const params = new URLSearchParams(window.location.search);

  const utmSource = (params.get('utm_source') ?? '').toLowerCase();
  if (utmSource.includes('facebook') || utmSource === 'fb' || utmSource === 'meta') {
    return 'fb_ad';
  }
  if (utmSource.includes('google') || utmSource === 'gads') {
    return 'google_search';
  }

  const ref = (document.referrer ?? '').toLowerCase();
  if (ref.includes('facebook.com') || ref.includes('fb.com')) return 'fb_ad';
  if (ref.includes('google.')) return 'google_search';

  return 'organic';
}
