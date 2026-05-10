"use client";

import { useState } from "react";

const SOURCES = [
  { value: "organic", label: "Organic / direct" },
  { value: "google_search", label: "Google search" },
  { value: "fb_ad", label: "Facebook / Meta ad" },
];

export function LeadForm() {
  const apiBase =
    process.env.NEXT_PUBLIC_APEX_API_URL ?? "http://localhost:8000";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [serviceNeeded, setServiceNeeded] = useState("");
  const [source, setSource] = useState("organic");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`${apiBase.replace(/\/$/, "")}/webhook/new-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          customer: { name, phone, email },
          vehicle: {
            make,
            model,
            service_needed: serviceNeeded,
          },
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail =
          typeof body?.detail === "string"
            ? body.detail
            : JSON.stringify(body?.detail ?? body);
        throw new Error(detail || `Request failed (${res.status})`);
      }

      setMessage(
        `Lead received. Reference: ${body.lead_id ?? "—"} — we will follow up shortly.`,
      );
      setName("");
      setPhone("");
      setEmail("");
      setMake("");
      setModel("");
      setServiceNeeded("");
      setSource("organic");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-10 grid gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-neutral-700">Full name</span>
          <input
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none ring-emerald-600 focus:ring-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-neutral-700">Phone</span>
          <input
            required
            type="tel"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none ring-emerald-600 focus:ring-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-neutral-700">Email</span>
        <input
          required
          type="email"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none ring-emerald-600 focus:ring-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-neutral-700">Vehicle make</span>
          <input
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none ring-emerald-600 focus:ring-2"
            value={make}
            onChange={(e) => setMake(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-neutral-700">Vehicle model</span>
          <input
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none ring-emerald-600 focus:ring-2"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-neutral-700">Service needed</span>
        <textarea
          required
          rows={3}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none ring-emerald-600 focus:ring-2"
          value={serviceNeeded}
          onChange={(e) => setServiceNeeded(e.target.value)}
          placeholder="e.g. Oil change, brake inspection"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-neutral-700">How did you hear about us?</span>
        <select
          className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none ring-emerald-600 focus:ring-2"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Request service"}
      </button>
    </form>
  );
}
