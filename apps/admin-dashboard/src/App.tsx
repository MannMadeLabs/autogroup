import { AnalyticsWidget } from '@/components/AnalyticsWidget';
import { Kanban } from '@/components/Kanban';

export function App() {
  return (
    <div className="min-h-full bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
              Project Apex
            </p>
            <h1 className="text-xl font-bold text-brand">Shop Owner Dashboard</h1>
          </div>
          <p className="text-sm text-slate-500">CRM-Lite · Lead Funnel</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <AnalyticsWidget />
        <section>
          <h2 className="mb-3 text-lg font-semibold text-brand">Lead funnel</h2>
          <p className="mb-4 text-sm text-slate-600">
            Drag a card across columns to advance the lead. Forward-only transitions are enforced
            by the Logic Engine.
          </p>
          <Kanban />
        </section>
      </main>
    </div>
  );
}
