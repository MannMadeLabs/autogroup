import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "@/lib/api";
import LeadTrendChart from "@/components/charts/LeadTrendChart";
import SourcePieChart from "@/components/charts/SourcePieChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", days],
    queryFn: () => fetchDashboardSummary(days),
    keepPreviousData: true,
  } as any);

  const statusChartData = data
    ? Object.entries(data.by_status).map(([k, v]) => ({
        status: k.charAt(0).toUpperCase() + k.slice(1),
        count: v as number,
      }))
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Attribution & conversion data</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Daily Lead Volume</h3>
              <LeadTrendChart data={data?.daily_trend ?? []} />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Traffic Source Attribution</h3>
              <SourcePieChart data={data?.by_source ?? {}} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Pipeline Status Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="count" name="Leads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-center">
              <p className="text-3xl font-extrabold text-gray-900">{data?.total_leads ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Total Leads</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-center">
              <p className="text-3xl font-extrabold text-green-600">{data?.conversion_rate ?? 0}%</p>
              <p className="text-sm text-gray-500 mt-1">Conversion Rate</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-center">
              <p className="text-3xl font-extrabold text-brand-600">{data?.period_days ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Days Analyzed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
