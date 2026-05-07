"use client";

import Link from "next/link";

import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { pushDataLayer } from "@/lib/gtm";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--apex-accent)] text-sm font-bold text-white">
            A
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--apex-muted)]">
              Golden image · internal
            </p>
            <p className="text-lg font-semibold">Project Apex Auto Co.</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm font-medium">
          <Link
            href="/dashboard"
            className="rounded-full border border-[color:var(--apex-border)] px-4 py-2 transition hover:border-[color:var(--apex-accent)]"
            onClick={() =>
              pushDataLayer({
                event: "apex_nav_click",
                target: "dashboard",
              })
            }
          >
            Shop dashboard
          </Link>
          <a
            href="tel:+15555550100"
            className="rounded-full bg-[color:var(--apex-accent)] px-4 py-2 text-white transition hover:opacity-95"
            onClick={() =>
              pushDataLayer({
                event: "apex_cta_click",
                cta_id: "header_call",
              })
            }
          >
            Call now
          </a>
        </nav>
      </header>

      <main className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <section className="space-y-6">
          <p className="inline-flex rounded-full bg-[color:var(--apex-surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--apex-muted)]">
            Same-day diagnostics · fleet welcome
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Keep every bay full without chasing voicemails.
          </h1>
          <p className="max-w-xl text-lg text-[color:var(--apex-muted)]">
            Lightweight landing pages, automated SMS and email follow-up, and a
            CRM-lite board so owners see pipeline health at a glance.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#book"
              className="rounded-xl bg-[color:var(--apex-accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--apex-accent)]/25 transition hover:opacity-95"
              onClick={() =>
                pushDataLayer({
                  event: "apex_cta_click",
                  cta_id: "hero_book_scroll",
                })
              }
            >
              Book in 60 seconds
            </a>
            <button
              type="button"
              className="rounded-xl border border-[color:var(--apex-border)] px-5 py-3 text-sm font-semibold transition hover:border-[color:var(--apex-accent)]"
              onClick={() =>
                pushDataLayer({
                  event: "apex_cta_click",
                  cta_id: "hero_secondary_estimate",
                })
              }
            >
              Text me an estimate link
            </button>
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            {[
              ["Sub-1s goal", "Optimized LCP on mobile"],
              ["Attribution", "Ad source → invoice"],
              ["Automation", "Python logic engine"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-[color:var(--apex-border)] bg-[color:var(--apex-surface)] p-4"
              >
                <dt className="text-sm font-semibold">{title}</dt>
                <dd className="mt-2 text-sm text-[color:var(--apex-muted)]">
                  {desc}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="book" className="scroll-mt-24 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Tell us what you drive</h2>
            <p className="mt-2 text-sm text-[color:var(--apex-muted)]">
              We will confirm by SMS and email through the Apex logic engine.
            </p>
          </div>
          <LeadCaptureForm />
        </section>
      </main>

      <footer className="border-t border-[color:var(--apex-border)] pt-8 text-sm text-[color:var(--apex-muted)]">
        Internal blueprint deployment · swap branding via Tailwind tokens in{" "}
        <code className="rounded bg-[color:var(--apex-surface-muted)] px-1 py-0.5">
          globals.css
        </code>
      </footer>
    </div>
  );
}
