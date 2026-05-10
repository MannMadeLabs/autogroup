import Link from "next/link";

type Props = {
  current: "kanban" | "table";
};

export function LeadsViewToggle({ current }: Props) {
  const base =
    "rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-600";
  const active = "bg-neutral-900 text-white";
  const idle = "bg-neutral-100 text-neutral-700 hover:bg-neutral-200";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-neutral-500">View:</span>
      <div className="inline-flex rounded-lg border border-neutral-200 p-0.5">
        <Link
          href="/leads"
          className={`${base} ${current === "kanban" ? active : idle}`}
        >
          Kanban
        </Link>
        <Link
          href="/leads?view=table"
          className={`${base} ${current === "table" ? active : idle}`}
        >
          Table
        </Link>
      </div>
    </div>
  );
}
