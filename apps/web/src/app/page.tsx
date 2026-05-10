import Link from "next/link";

import { LeadForm } from "@/components/LeadForm";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Project Apex
        </p>
        <Link
          href="/leads"
          className="text-sm font-medium text-emerald-800 underline-offset-4 hover:underline"
        >
          Leads inbox
        </Link>
      </div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900">
        Mann Auto Group
      </h1>
      <p className="mt-4 text-lg text-neutral-600">
        Request service — we will confirm by phone or email.
      </p>

      <LeadForm />
    </main>
  );
}
