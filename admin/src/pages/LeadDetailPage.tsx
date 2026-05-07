import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Phone, Mail, Car, Save } from "lucide-react";
import { format } from "date-fns";
import { fetchLead, updateLead, updateLeadStatus } from "@/lib/api";
import type { LeadStatus } from "@/types";

const STATUSES: LeadStatus[] = ["new","contacted","quoted","booked","completed","lost"];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  quoted: "bg-purple-100 text-purple-700 border-purple-200",
  booked: "bg-orange-100 text-orange-700 border-orange-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  lost: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => fetchLead(id!),
    onSuccess: (l: any) => {
      setNotes(l.notes ?? "");
      setAssignedTo(l.assigned_to ?? "");
    },
  } as any);

  const { mutate: saveChanges, isLoading: saving } = useMutation({
    mutationFn: () => updateLead(id!, { notes, assigned_to: assignedTo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lead", id] }),
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: (status: LeadStatus) => updateLeadStatus(id!, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lead", id] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lead) return <div className="p-6 text-red-500">Lead not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.customer.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Lead #{String(lead.lead_id).slice(0, 8).toUpperCase()} ·{" "}
            {format(new Date(lead.timestamp), "MMM d, yyyy h:mm a")}
          </p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${STATUS_COLORS[lead.status as LeadStatus]}`}>
          {lead.status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-900">Customer</h2>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${lead.customer.phone}`} className="hover:text-brand-600">
              {lead.customer.phone}
            </a>
          </div>
          {lead.customer.email && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="w-4 h-4 text-gray-400" />
              <a href={`mailto:${lead.customer.email}`} className="hover:text-brand-600">
                {lead.customer.email}
              </a>
            </div>
          )}
        </div>

        {/* Vehicle */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-900">Vehicle</h2>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Car className="w-4 h-4 text-gray-400" />
            <span>
              {[lead.vehicle?.year, lead.vehicle?.make, lead.vehicle?.model]
                .filter(Boolean)
                .join(" ") || "Not specified"}
            </span>
          </div>
          {lead.vehicle?.service_needed && (
            <p className="text-sm text-brand-600 font-medium">{lead.vehicle.service_needed}</p>
          )}
        </div>
      </div>

      {/* Status Flow */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                lead.status === s
                  ? STATUS_COLORS[s]
                  : "border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes + Assignment */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Notes & Assignment</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <input
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Advisor name…"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Internal notes about this lead…"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>
        <button
          onClick={() => saveChanges()}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
