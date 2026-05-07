import { useMemo, useState } from "react";

type LeadStatus = "new" | "contacted" | "quoted" | "booked" | "completed";

type LeadCard = {
  lead_id: string;
  customer_name: string;
  service_needed: string;
  source: "fb_ad" | "google_search" | "organic";
  status: LeadStatus;
};

const pipeline: LeadStatus[] = ["new", "contacted", "quoted", "booked", "completed"];

const seedLeads: LeadCard[] = [
  {
    lead_id: "L-1001",
    customer_name: "Jordan Smith",
    service_needed: "Brake inspection",
    source: "fb_ad",
    status: "new"
  },
  {
    lead_id: "L-1002",
    customer_name: "Avery Cole",
    service_needed: "Oil change",
    source: "google_search",
    status: "contacted"
  },
  {
    lead_id: "L-1003",
    customer_name: "Kai Nguyen",
    service_needed: "Battery replacement",
    source: "organic",
    status: "quoted"
  }
];

function getNextStatus(current: LeadStatus): LeadStatus | null {
  const currentIndex = pipeline.indexOf(current);
  if (currentIndex < 0 || currentIndex === pipeline.length - 1) {
    return null;
  }
  return pipeline[currentIndex + 1];
}

export function App(): JSX.Element {
  const [leads, setLeads] = useState<LeadCard[]>(seedLeads);
  const [conversionRate] = useState("32.5%");

  const leadsByStatus = useMemo(() => {
    return pipeline.reduce<Record<LeadStatus, LeadCard[]>>((acc, status) => {
      acc[status] = leads.filter((lead) => lead.status === status);
      return acc;
    }, {} as Record<LeadStatus, LeadCard[]>);
  }, [leads]);

  const moveForward = (leadId: string) => {
    setLeads((previous) =>
      previous.map((lead) => {
        if (lead.lead_id !== leadId) {
          return lead;
        }
        const next = getNextStatus(lead.status);
        return next ? { ...lead, status: next } : lead;
      })
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Project Apex CRM View</h1>
        <p>Shop-owner dashboard starter with pipeline + analytics widget.</p>
      </header>

      <section className="analytics-grid">
        <div className="widget">
          <h2>Conversion Rate</h2>
          <p className="metric">{conversionRate}</p>
        </div>
        <div className="widget">
          <h2>Tracked Leads</h2>
          <p className="metric">{leads.length}</p>
        </div>
      </section>

      <section className="kanban-grid">
        {pipeline.map((status) => (
          <article key={status} className="kanban-column">
            <h3>{status.toUpperCase()}</h3>
            <div className="cards">
              {leadsByStatus[status].map((lead) => (
                <div className="lead-card" key={lead.lead_id}>
                  <strong>{lead.customer_name}</strong>
                  <p>{lead.service_needed}</p>
                  <small>Source: {lead.source}</small>
                  <button
                    disabled={!getNextStatus(lead.status)}
                    onClick={() => moveForward(lead.lead_id)}
                  >
                    Advance
                  </button>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
