import LeadCaptureForm from "@/components/LeadCaptureForm";
import { trackCTAClick } from "@/lib/gtm";

const SERVICES_ICONS = [
  { icon: "🔧", label: "Oil Change" },
  { icon: "🛞", label: "Tire Service" },
  { icon: "🔬", label: "Diagnostics" },
  { icon: "❄️", label: "AC Repair" },
  { icon: "🛑", label: "Brake Service" },
  { icon: "⚡", label: "Electrical" },
];

const TRUST_ITEMS = [
  { number: "5,000+", label: "Happy Customers" },
  { number: "4.9★", label: "Google Rating" },
  { number: "15+", label: "Years in Business" },
  { number: "30 min", label: "Response Time" },
];

const REVIEWS = [
  {
    name: "Maria G.",
    service: "Brake Service",
    text: "They called me back within 20 minutes and had my car ready the same day. Incredibly fast and honest pricing.",
    stars: 5,
  },
  {
    name: "James W.",
    service: "Engine Diagnostic",
    text: "I'd been to two other shops that couldn't find the issue. These guys nailed it in an hour. Highly recommend!",
    stars: 5,
  },
  {
    name: "Sarah K.",
    service: "AC Repair",
    text: "Submitted the form on my lunch break and got a call in 15 minutes. Price was fair and work was done perfectly.",
    stars: 5,
  },
];

export default function HomePage() {
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? "Auto Service";
  const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE ?? "";

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('/grid.svg')", backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div className="space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-400 text-sm font-semibold px-3 py-1 rounded-full border border-brand-500/30">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
              Accepting New Customers
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
              Quality Auto Service,{" "}
              <span className="text-brand-400">Done Right</span> the First Time.
            </h1>
            <p className="text-lg text-gray-300 max-w-lg">
              Submit your service request in 60 seconds. A certified advisor calls you back
              within 30 minutes with a transparent quote.
            </p>
            <div className="flex flex-wrap gap-3">
              {shopPhone && (
                <a
                  href={`tel:${shopPhone}`}
                  onClick={() => trackCTAClick("call-now-hero", "hero")}
                  data-gtm-cta="call-now-hero"
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-lg transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Call Now
                </a>
              )}
              <a
                href="#estimate"
                onClick={() => trackCTAClick("get-estimate-hero", "hero")}
                data-gtm-cta="get-estimate-hero"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Get Free Estimate ↓
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div id="estimate" className="w-full">
            <LeadCaptureForm shopName={shopName} shopPhone={shopPhone} />
          </div>
        </div>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-500 py-8">
        <div className="mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label}>
              <p className="text-3xl font-extrabold text-white">{item.number}</p>
              <p className="text-sm font-medium text-brand-100 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Our Services</h2>
            <p className="mt-3 text-lg text-gray-500">Everything your vehicle needs, under one roof.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {SERVICES_ICONS.map((s) => (
              <a
                key={s.label}
                href="#estimate"
                onClick={() => trackCTAClick(`service-${s.label}`, "services")}
                data-gtm-cta={`service-${s.label}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-brand-400 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{s.icon}</span>
                <span className="text-sm font-semibold text-gray-700 text-center">{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Submit Your Request", desc: "Fill out the 60-second form above. Tell us your vehicle and what's going on." },
              { step: "2", title: "Get a Call Back", desc: "A certified advisor calls you within 30 minutes with a transparent, no-surprise quote." },
              { step: "3", title: "Drop It Off", desc: "Bring your vehicle in at your scheduled time. We'll handle the rest and text you when it's done." },
            ].map((item) => (
              <div key={item.step} className="relative flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-500 text-white font-extrabold flex items-center justify-center text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <span key={i} className="text-brand-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm italic mb-4">"{r.text}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="bg-gray-900 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4 space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready to Get Started?</h2>
          <p className="text-gray-400">Get a free estimate in 60 seconds. No commitment required.</p>
          <a
            href="#estimate"
            onClick={() => trackCTAClick("get-estimate-bottom", "bottom-cta")}
            data-gtm-cta="get-estimate-bottom"
            className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-xl"
          >
            Get My Free Estimate →
          </a>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-500 text-xs text-center py-6 px-4">
        <p>© {new Date().getFullYear()} {shopName}. All rights reserved.</p>
      </footer>
    </main>
  );
}
