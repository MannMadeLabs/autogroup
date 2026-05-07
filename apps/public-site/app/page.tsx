"use client";

import { FormEvent, useState } from "react";

import { pushDataLayerEvent } from "../lib/gtm";

const logicEngineUrl = process.env.NEXT_PUBLIC_LOGIC_ENGINE_URL ?? "http://localhost:8000";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function HomePage() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const lead = {
      lead_id: crypto.randomUUID(),
      source: "organic",
      customer: {
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? "")
      },
      vehicle: {
        make: String(formData.get("make") ?? ""),
        model: String(formData.get("model") ?? ""),
        service_needed: String(formData.get("service_needed") ?? "")
      },
      status: "new",
      timestamp: new Date().toISOString()
    };

    pushDataLayerEvent({
      event: "cta_lead_submit_clicked",
      source: lead.source
    });

    setSubmitState("submitting");

    try {
      const response = await fetch(`${logicEngineUrl}/webhook/new-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });

      if (!response.ok) {
        throw new Error("Lead submission failed.");
      }

      setSubmitState("success");
      event.currentTarget.reset();
    } catch {
      setSubmitState("error");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-white">Book Automotive Service in Minutes</h1>
      <p className="mt-3 max-w-2xl text-slate-300">
        Project Apex starter page optimized for fast mobile lead capture and downstream attribution.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <input name="name" placeholder="Full name" required className="rounded border border-slate-700 bg-slate-950 px-4 py-3" />
        <input name="phone" placeholder="Phone number" required className="rounded border border-slate-700 bg-slate-950 px-4 py-3" />
        <input name="email" type="email" placeholder="Email" required className="rounded border border-slate-700 bg-slate-950 px-4 py-3" />
        <input name="make" placeholder="Vehicle make" required className="rounded border border-slate-700 bg-slate-950 px-4 py-3" />
        <input name="model" placeholder="Vehicle model" required className="rounded border border-slate-700 bg-slate-950 px-4 py-3" />
        <input
          name="service_needed"
          placeholder="Service needed"
          required
          className="rounded border border-slate-700 bg-slate-950 px-4 py-3"
        />

        <button
          type="submit"
          className="rounded bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          disabled={submitState === "submitting"}
        >
          {submitState === "submitting" ? "Submitting..." : "Get My Quote"}
        </button>

        {submitState === "success" && <p className="text-emerald-300">Lead submitted successfully.</p>}
        {submitState === "error" && <p className="text-red-300">Submission failed. Please try again.</p>}
      </form>
    </main>
  );
}
