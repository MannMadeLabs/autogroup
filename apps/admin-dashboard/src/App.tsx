import { useEffect, useState } from "react";

const logicEngineUrl = import.meta.env.VITE_LOGIC_ENGINE_URL ?? "http://localhost:8000";

type ConversionSnapshot = {
  new: number;
  quoted: number;
  booked: number;
  completed: number;
};

const defaultSnapshot: ConversionSnapshot = {
  new: 0,
  quoted: 0,
  booked: 0,
  completed: 0
};

export default function App() {
  const [snapshot, setSnapshot] = useState<ConversionSnapshot>(defaultSnapshot);

  useEffect(() => {
    async function loadAnalytics() {
      const response = await fetch(`${logicEngineUrl}/analytics/conversions`);
      if (!response.ok) return;
      const data = (await response.json()) as ConversionSnapshot;
      setSnapshot(data);
    }

    loadAnalytics().catch(() => null);
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ marginTop: 0 }}>Shop Owner Dashboard</h1>
      <p style={{ color: "#94a3b8" }}>Starter CRM-lite board with analytics feed.</p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}
      >
        {Object.entries(snapshot).map(([key, value]) => (
          <article key={key} style={{ background: "#0f172a", padding: "1rem", borderRadius: "0.75rem" }}>
            <p style={{ margin: 0, color: "#94a3b8", textTransform: "capitalize" }}>{key}</p>
            <p style={{ margin: "0.4rem 0 0", fontSize: "1.6rem", fontWeight: 700 }}>{value}</p>
          </article>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "1rem"
        }}
      >
        {["New", "Contacted", "Quoted", "Booked"].map((column) => (
          <article key={column} style={{ background: "#0f172a", borderRadius: "0.75rem", padding: "1rem", minHeight: "320px" }}>
            <h2 style={{ marginTop: 0, fontSize: "1rem" }}>{column}</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Drag and drop card lane scaffold.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
