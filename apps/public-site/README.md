# Apex Public Site (Next.js + Tailwind)

The customer-facing landing page. Optimized for Core Web Vitals and built so a
new client deploy is just a Tailwind theme swap + an env file.

## Local

```bash
npm install
cp ../../.env.example ../../.env
npm run dev
# http://localhost:3000
```

## How it ties into the stack

- The hero CTA and the form post to `${NEXT_PUBLIC_API_URL}/webhook/new-lead`
  on the FastAPI Logic Engine.
- `src/lib/source.ts` resolves UTM / referrer into one of the canonical
  `LeadSource` values (`fb_ad | google_search | organic`).
- `src/lib/gtm.ts` pushes typed events into `window.dataLayer` for GTM (set
  `NEXT_PUBLIC_GTM_ID` to enable the loader in `layout.tsx`).
