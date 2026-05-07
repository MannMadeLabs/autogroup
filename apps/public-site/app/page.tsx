import { HeroCta } from "@/components/hero-cta";

export default function HomePage(): JSX.Element {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <section className="rounded-xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Project Apex
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight">
          Turn service clicks into booked appointments.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          This starter public app focuses on mobile-first conversion speed and
          structured lead capture for attribution-ready campaigns.
        </p>
        <div className="mt-8">
          <HeroCta />
        </div>
      </section>
    </main>
  );
}
