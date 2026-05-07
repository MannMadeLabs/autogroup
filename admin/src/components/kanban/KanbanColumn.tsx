import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Lead, LeadStatus } from "@/types";
import KanbanCard from "./KanbanCard";

const COLUMN_CONFIG: Record<LeadStatus, { label: string; color: string; dot: string }> = {
  new:       { label: "New",       color: "bg-blue-50 border-blue-200",   dot: "bg-blue-500" },
  contacted: { label: "Contacted", color: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-500" },
  quoted:    { label: "Quoted",    color: "bg-purple-50 border-purple-200", dot: "bg-purple-500" },
  booked:    { label: "Booked",    color: "bg-orange-50 border-orange-200", dot: "bg-orange-500" },
  completed: { label: "Completed", color: "bg-green-50 border-green-200",  dot: "bg-green-500" },
  lost:      { label: "Lost",      color: "bg-gray-50 border-gray-200",    dot: "bg-gray-400" },
};

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
}

export default function KanbanColumn({ status, leads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status];

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg border ${config.color}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-sm font-semibold text-gray-700">{config.label}</span>
        </div>
        <span className="text-xs text-gray-500 bg-white rounded-full px-2 py-0.5 border">
          {leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-48 p-2 space-y-2 rounded-b-lg border border-t-0 transition-colors ${
          config.color
        } ${isOver ? "ring-2 ring-brand-400 ring-inset" : ""}`}
      >
        <SortableContext items={leads.map((l) => l.lead_id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard key={lead.lead_id} lead={lead} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}
