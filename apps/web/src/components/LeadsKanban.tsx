"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { patchLeadStatus } from "@/lib/leadApi";
import {
  COLUMN_LABELS,
  groupLeadsByColumn,
  LEAD_COLUMN_IDS,
  type LeadColumnId,
} from "@/lib/leadColumns";
import type { LeadListItem } from "@/types/lead";

type Props = {
  initialLeads: LeadListItem[];
};

function reorderWithin<T>(list: T[], start: number, end: number): T[] {
  const r = [...list];
  const [removed] = r.splice(start, 1);
  r.splice(end, 0, removed);
  return r;
}

export function LeadsKanban({ initialLeads }: Props) {
  const router = useRouter();
  const [columns, setColumns] = useState(() => groupLeadsByColumn(initialLeads));
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    setColumns(groupLeadsByColumn(initialLeads));
  }, [initialLeads]);

  const columnIds = useMemo(() => [...LEAD_COLUMN_IDS], []);

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromCol = source.droppableId as LeadColumnId;
    const toCol = destination.droppableId as LeadColumnId;
    const leadId = draggableId;

    if (fromCol === toCol && source.index === destination.index) return;

    const lead = columns[fromCol].find((l) => l.lead_id === leadId);
    if (!lead) return;

    if (fromCol === toCol) {
      const list = reorderWithin(columns[fromCol], source.index, destination.index);
      setColumns((prev) => ({ ...prev, [fromCol]: list }));
      return;
    }

    const prevSnapshot = columns;
    const moved: LeadListItem = { ...lead, status: toCol };
    const nextFrom = columns[fromCol].filter((l) => l.lead_id !== leadId);
    const nextTo = [...columns[toCol]];
    nextTo.splice(destination.index, 0, moved);
    setColumns({ ...columns, [fromCol]: nextFrom, [toCol]: nextTo });

    setPending(leadId);
    try {
      await patchLeadStatus(leadId, toCol);
      router.refresh();
    } catch {
      setColumns(prevSnapshot);
    } finally {
      setPending(null);
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
        {columnIds.map((colId) => (
          <Droppable key={colId} droppableId={colId}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex w-72 shrink-0 flex-col rounded-xl border border-neutral-200 bg-neutral-50 p-3 ${
                  snapshot.isDraggingOver ? "ring-2 ring-emerald-500/40" : ""
                }`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-neutral-800">
                    {COLUMN_LABELS[colId]}
                  </h2>
                  <span className="rounded-full bg-neutral-200/80 px-2 py-0.5 text-xs text-neutral-700">
                    {columns[colId].length}
                  </span>
                </div>
                <div className="min-h-[120px] flex-1 space-y-2">
                  {columns[colId].map((lead, index) => (
                    <Draggable
                      key={lead.lead_id}
                      draggableId={lead.lead_id}
                      index={index}
                      isDragDisabled={pending === lead.lead_id}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={`rounded-lg border border-neutral-200 bg-white p-3 shadow-sm ${
                            dragSnapshot.isDragging ? "shadow-md ring-2 ring-neutral-300" : ""
                          } ${pending === lead.lead_id ? "opacity-60" : "cursor-grab active:cursor-grabbing"}`}
                        >
                          <div className="font-medium text-neutral-900">
                            {lead.customer_name}
                          </div>
                          <div className="mt-1 text-xs text-neutral-600">
                            {lead.vehicle_make} {lead.vehicle_model}
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs text-neutral-700">
                            {lead.vehicle_service_needed}
                          </p>
                          <div className="mt-2 text-[10px] uppercase tracking-wide text-neutral-400">
                            {lead.source} ·{" "}
                            {new Date(lead.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
