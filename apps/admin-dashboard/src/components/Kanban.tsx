import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LEAD_STATUSES, STATUS_LABEL, type Lead, type LeadStatus } from '@/types/lead';

export function Kanban() {
  const qc = useQueryClient();
  const [optimistic, setOptimistic] = useState<Record<string, LeadStatus>>({});

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.listLeads(),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      api.updateStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['leads'] });
      void qc.invalidateQueries({ queryKey: ['analytics'] });
    },
    onSettled: (_data, _err, variables) => {
      setOptimistic((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const grouped = useMemo(() => {
    const result: Record<LeadStatus, Lead[]> = {
      new: [], contacted: [], quoted: [], booked: [], completed: [],
    };
    for (const lead of leads ?? []) {
      const status = optimistic[lead.lead_id] ?? lead.status;
      result[status].push({ ...lead, status });
    }
    return result;
  }, [leads, optimistic]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const leadId = String(active.id);
    const target = String(over.id) as LeadStatus;
    if (!LEAD_STATUSES.includes(target)) return;

    const lead = leads?.find((l) => l.lead_id === leadId);
    if (!lead || lead.status === target) return;

    setOptimistic((prev) => ({ ...prev, [leadId]: target }));
    mutation.mutate({ id: leadId, status: target });
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading leads…</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="grid gap-4 lg:grid-cols-5">
        {LEAD_STATUSES.map((status) => (
          <Column key={status} status={status} leads={grouped[status]} />
        ))}
      </div>
    </DndContext>
  );
}

function Column({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[300px] flex-col rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 transition ${
        isOver ? 'ring-2 ring-brand-accent' : ''
      }`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          {STATUS_LABEL[status]}
        </h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
          {leads.length}
        </span>
      </header>
      <div className="flex flex-1 flex-col gap-2">
        {leads.map((lead) => (
          <Card key={lead.lead_id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

function Card({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.lead_id,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 transition ${
        isDragging ? 'opacity-60 ring-brand-accent' : ''
      }`}
    >
      <p className="text-sm font-semibold text-brand">{lead.customer.name}</p>
      <p className="text-xs text-slate-500">
        {lead.vehicle.make} {lead.vehicle.model}
      </p>
      <p className="mt-1 text-xs text-slate-700">{lead.vehicle.service_needed}</p>
      <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
        {lead.source.replace('_', ' ')}
      </p>
    </article>
  );
}
