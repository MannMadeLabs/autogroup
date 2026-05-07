import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function AnalyticsWidget() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 7],
    queryFn: () => api.getAnalytics(7),
  });

  if (isLoading) return <Skeleton />;
  if (error || !data) return <ErrorBox message={(error as Error)?.message ?? 'No data'} />;

  const rate = (data.ga4.conversion_rate * 100).toFixed(2);

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Total leads" value={data.leads_total.toString()} />
      <Stat label="Sessions (7d)" value={data.ga4.sessions.toLocaleString()} />
      <Stat label="Conversions (7d)" value={data.ga4.conversions.toLocaleString()} />
      <Stat label="Conversion rate" value={`${rate}%`} accent />
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? 'text-brand-accent' : 'text-brand'}`}>
        {value}
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-white ring-1 ring-slate-200" />
      ))}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
      Couldn&apos;t load analytics: {message}
    </div>
  );
}
