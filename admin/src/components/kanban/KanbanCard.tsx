import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Phone, Mail, Car, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Lead } from "@/types";
import { useNavigate } from "react-router-dom";

const SOURCE_LABELS: Record<string, string> = {
  fb_ad: "FB Ad",
  google_search: "Google",
  organic: "Organic",
  referral: "Referral",
  direct: "Direct",
};

interface KanbanCardProps {
  lead: Lead;
}

export default function KanbanCard({ lead }: KanbanCardProps) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.lead_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/leads/${lead.lead_id}`);
          }}
          className="font-semibold text-sm text-gray-900 hover:text-brand-600 text-left leading-snug"
        >
          {lead.customer.name}
        </button>
        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
          {SOURCE_LABELS[lead.source] ?? lead.source}
        </span>
      </div>

      {/* Service */}
      {lead.vehicle?.service_needed && (
        <p className="text-xs text-brand-600 font-medium mb-2">{lead.vehicle.service_needed}</p>
      )}

      {/* Vehicle */}
      {(lead.vehicle?.make || lead.vehicle?.model) && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <Car className="w-3 h-3" />
          <span>
            {[lead.vehicle.year, lead.vehicle.make, lead.vehicle.model].filter(Boolean).join(" ")}
          </span>
        </div>
      )}

      {/* Contact row */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <a
          href={`tel:${lead.customer.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600"
        >
          <Phone className="w-3 h-3" />
          <span className="truncate max-w-[80px]">{lead.customer.phone}</span>
        </a>
        {lead.customer.email && (
          <a
            href={`mailto:${lead.customer.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600"
          >
            <Mail className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{lead.customer.email}</span>
          </a>
        )}
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(lead.timestamp), { addSuffix: true })}
      </div>
    </div>
  );
}
