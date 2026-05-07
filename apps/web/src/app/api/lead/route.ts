import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import type { LeadPayload, LeadSource, LeadStatus } from "@/types/lead";

const ENGINE =
  process.env.LOGIC_ENGINE_URL ?? process.env.NEXT_PUBLIC_LOGIC_ENGINE_URL;

export async function POST(req: Request) {
  if (!ENGINE) {
    return NextResponse.json(
      { error: "LOGIC_ENGINE_URL is not configured" },
      { status: 500 },
    );
  }

  const body = (await req.json()) as Record<string, unknown>;

  const source = (body.source as LeadSource) ?? "organic";

  const payload: LeadPayload = {
    lead_id: randomUUID(),
    source,
    customer: {
      name: String(body.name ?? ""),
      phone: String(body.phone ?? ""),
      email: String(body.email ?? ""),
    },
    vehicle: {
      make: String(body.make ?? ""),
      model: String(body.model ?? ""),
      service_needed: String(body.service_needed ?? ""),
    },
    status: "new" as LeadStatus,
    timestamp: new Date().toISOString(),
  };

  const upstream = await fetch(`${ENGINE.replace(/\/$/, "")}/webhook/new-lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { error: "Upstream webhook failed", detail: text },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, lead_id: payload.lead_id });
}
