import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, CheckCircle, BarChart2 } from "lucide-react";
import { fetchDashboardSummary } from "@/lib/api";
import LeadTrendChart from "@/components/charts/LeadTrendChart";
import SourcePieChart from "@/components/charts/SourcePieChart";

const STATUS_ORDER = ["new", "contacted", "quoted", "booked", "completed", "lost"] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:       { label: "New",       color: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-700" },
  quoted:    { label: "Quoted",    color: "bg-purple-100 text-purple-700" },
  booked:    { label: "Booked",    color: "bg-orange-100 text-orange-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  lost:      { label: "Lost",      color: "bg-gray-100 text-gray-600" },
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", 30],
    queryFn: () => fetchDashboardSummary(30),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Last 30 days performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bg="bg-blue-50"
          label="Total Leads"
          value={data?.total_leads ?? 0}
          sub="Last 30 days"
        />
        <KPICard
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          bg="bg-green-50"
          label="Conversion Rate"
          value={`${data?.conversion_rate ?? 0}%`}
          sub="Booked + Completed"
        />
        <KPICard
          icon={<CheckCircle className="w-5 h-5 text-brand-600" />}
          bg="bg-brand-50"
          label="Completed Jobs"
          value={data?.by_status?.completed ?? 0}
          sub="This period"
        />
        <KPICard
          icon={<BarChart2 className="w-5 h-5 text-purple-600" />}
          bg="bg-purple-50"
          label="Booked"
          value={data?.by_status?.booked ?? 0}
          sub="Awaiting service"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Lead Volume — 30 Days</h3>
          <LeadTrendChart data={data?.daily_trend ?? []} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Leads by Source</h3>
          <SourcePieChart data={data?.by_source ?? {}} />
        </div>
      </div>

      {/* Status Funnel */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Lead Pipeline Funnel</h3>
        <div className="flex flex-wrap gap-3">
          {STATUS_ORDER.map((s) => {
            const count = data?.by_status?.[s] ?? 0;
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${cfg.color}`}>
                <span>{cfg.label}</span>
                <span className="font-bold">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon,
  bg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
