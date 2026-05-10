"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { patchLeadStatus } from "@/lib/leadApi";

const STATUSES: { value: string; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "booked", label: "Booked" },
  { value: "completed", label: "Completed" },
];

type Props = {
  leadId: string;
  currentStatus: string;
};

export function LeadStatusSelect({ leadId, currentStatus }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(currentStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(currentStatus);
  }, [currentStatus]);

  async function onChange(next: string) {
    if (next === value) return;
    setBusy(true);
    setError(null);
    try {
      await patchLeadStatus(leadId, next);
      setValue(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
      setValue(currentStatus);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[10rem] flex-col gap-1">
      <select
        className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-neutral-900 outline-none ring-emerald-600 focus:ring-2 disabled:opacity-50"
        value={value}
        disabled={busy}
        onChange={(e) => void onChange(e.target.value)}
        aria-label="Lead status"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
