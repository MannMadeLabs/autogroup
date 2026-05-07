"use client";

import { type FormEvent, useState } from "react";

import { pushCtaEvent } from "@/lib/gtm";

export function LeadCaptureForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    pushCtaEvent("lead_form_submit", { form: "hero_capture" });

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      make: String(form.get("make") ?? ""),
      model: String(form.get("model") ?? ""),
      service_needed: String(form.get("service_needed") ?? ""),
      source: String(form.get("source") ?? "organic"),
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Thanks — we will reach out shortly.");
      e.currentTarget.reset();
    } catch {
      setMessage("Something went wrong. Please call the shop.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-2xl border border-[color:var(--apex-border)] bg-[color:var(--apex-surface)] p-6 shadow-sm sm:grid-cols-2"
    >
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium text-[color:var(--apex-muted)]">Name</span>
        <input
          required
          name="name"
          className="rounded-lg border border-[color:var(--apex-border)] bg-[color:var(--apex-background)] px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-[color:var(--apex-muted)]">Phone</span>
        <input
          required
          name="phone"
          type="tel"
          className="rounded-lg border border-[color:var(--apex-border)] bg-[color:var(--apex-background)] px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-[color:var(--apex-muted)]">Email</span>
        <input
          required
          name="email"
          type="email"
          className="rounded-lg border border-[color:var(--apex-border)] bg-[color:var(--apex-background)] px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-[color:var(--apex-muted)]">Vehicle make</span>
        <input
          required
          name="make"
          className="rounded-lg border border-[color:var(--apex-border)] bg-[color:var(--apex-background)] px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-[color:var(--apex-muted)]">Model</span>
        <input
          required
          name="model"
          className="rounded-lg border border-[color:var(--apex-border)] bg-[color:var(--apex-background)] px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium text-[color:var(--apex-muted)]">
          Service needed
        </span>
        <input
          required
          name="service_needed"
          className="rounded-lg border border-[color:var(--apex-border)] bg-[color:var(--apex-background)] px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium text-[color:var(--apex-muted)]">
          How did you hear about us?
        </span>
        <select
          name="source"
          className="rounded-lg border border-[color:var(--apex-border)] bg-[color:var(--apex-background)] px-3 py-2"
          defaultValue="organic"
        >
          <option value="organic">Organic / referral</option>
          <option value="fb_ad">Facebook ad</option>
          <option value="google_search">Google search</option>
        </select>
      </label>
      <div className="sm:col-span-2 flex flex-col gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[color:var(--apex-accent)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Request service"}
        </button>
        {message ? (
          <p className="text-sm text-[color:var(--apex-muted)]">{message}</p>
        ) : null}
      </div>
    </form>
  );
}
