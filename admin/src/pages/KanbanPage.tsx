import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { fetchKanban, updateLeadStatus } from "@/lib/api";
import type { KanbanBoard, Lead, LeadStatus } from "@/types";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import KanbanCard from "@/components/kanban/KanbanCard";
import { RefreshCw } from "lucide-react";

const COLUMNS: LeadStatus[] = ["new", "contacted", "quoted", "booked", "completed", "lost"];

export default function KanbanPage() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [board, setBoard] = useState<KanbanBoard | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["kanban"],
    queryFn: fetchKanban,
    onSuccess: (d) => setBoard(d),
  } as any);

  const { mutate: moveCard } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      updateLeadStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kanban"] }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const currentBoard: KanbanBoard = board ?? (data as KanbanBoard) ?? ({} as KanbanBoard);

  const activeLead = activeId
    ? Object.values(currentBoard).flat().find((l: Lead) => l.lead_id === activeId)
    : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || !board) return;
    const overId = over.id as string;
    if (COLUMNS.includes(overId as LeadStatus)) {
      // hovering over a column
      const targetStatus = overId as LeadStatus;
      setBoard((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        for (const col of COLUMNS) {
          updated[col] = updated[col].filter((l) => l.lead_id !== active.id);
        }
        const lead = Object.values(board).flat().find((l: Lead) => l.lead_id === active.id);
        if (lead) updated[targetStatus] = [...updated[targetStatus], lead];
        return updated;
      });
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;
    const overId = over.id as string;
    const targetStatus = COLUMNS.includes(overId as LeadStatus)
      ? (overId as LeadStatus)
      : findColumnOfLead(currentBoard, overId);

    if (!targetStatus) return;

    const sourceStatus = findColumnOfLead(
      (data as KanbanBoard) ?? ({} as KanbanBoard),
      active.id as string
    );
    if (sourceStatus !== targetStatus) {
      moveCard({ id: active.id as string, status: targetStatus });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Board</h1>
          <p className="text-sm text-gray-500 mt-1">Drag leads between stages to update status</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={(currentBoard[status] as Lead[]) ?? []}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? <KanbanCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function findColumnOfLead(board: KanbanBoard, leadId: string): LeadStatus | null {
  for (const [status, leads] of Object.entries(board)) {
    if ((leads as Lead[]).some((l) => l.lead_id === leadId)) {
      return status as LeadStatus;
    }
  }
  return null;
}
