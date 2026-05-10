import { NextRequest, NextResponse } from "next/server";

function apiBase(): string {
  return (
    process.env.APEX_API_URL ??
    process.env.NEXT_PUBLIC_APEX_API_URL ??
    "http://localhost:8000"
  ).replace(/\/$/, "");
}

export async function PATCH(
  request: NextRequest,
  context: { params: { leadId: string } },
) {
  const key = process.env.INTERNAL_API_KEY;
  if (!key) {
    return NextResponse.json(
      { detail: "INTERNAL_API_KEY is not configured for Next.js" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  const res = await fetch(
    `${apiBase()}/internal/leads/${encodeURIComponent(context.params.leadId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": key,
      },
      body: JSON.stringify(body),
    },
  );

  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  }
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": contentType || "text/plain" },
  });
}
