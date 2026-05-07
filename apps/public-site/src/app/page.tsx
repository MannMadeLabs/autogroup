import { LeadForm } from '@/components/LeadForm';

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Auto Company';

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
              Trusted local auto service
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              {brandName}: a fair quote, in under an hour.
            </h1>
            <p className="mt-4 max-w-prose text-lg text-slate-200">
              Tell us what your car needs. We&apos;ll text you a transparent quote and book
              you in &mdash; no dealership runaround.
            </p>
            <ul className="mt-6 grid gap-2 text-slate-200 sm:grid-cols-2">
              <li>ASE-certified technicians</li>
              <li>Up-front pricing, no surprises</li>
              <li>2-year / 24,000-mile warranty</li>
              <li>Free shuttle within 5 miles</li>
            </ul>
          </div>

          <div id="quote">
            <LeadForm />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-brand">Why drivers choose {brandName}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Feature title="Sub-1s mobile" body="Pages built on Next.js for instant load on any connection." />
            <Feature title="Texted quotes" body="Get pricing on your phone within 60 minutes of submitting." />
            <Feature title="Reviews on us" body="We earn 5-star reviews by under-promising and over-delivering." />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-brand-surface p-6 ring-1 ring-slate-200">
      <h3 className="text-lg font-semibold text-brand">{title}</h3>
      <p className="mt-2 text-brand-muted">{body}</p>
    </div>
  );
}
