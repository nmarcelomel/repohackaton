import { useState, useEffect } from "react";
import { fetchExecutiveReport, type ApiExecutiveReport } from "../../data/api-client";

function trafficLightBadge(level: string) {
 const map: Record<string, { cls: string; label: string }> = {
  Elite: { cls: "sb-ui-badge--success", label: "⭐ Elite" },
  High: { cls: "sb-ui-badge--success", label: "Alto" },
  Medium: { cls: "sb-ui-badge--warning", label: "Medio" },
  Low: { cls: "sb-ui-badge--error", label: "Bajo" },
 };
 const badge = map[level] || { cls: "sb-ui-badge--primary", label: level };
 return <span className={`sb-ui-badge ${badge.cls}`}>{badge.label}</span>;
}

export function ExecutiveReportPage() {
 const [report, setReport] = useState<ApiExecutiveReport | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 useEffect(() => {
  fetchExecutiveReport()
   .then(setReport)
   .catch((e) => setError(e instanceof Error ? e.message : "Error cargando reporte"))
   .finally(() => setLoading(false));
 }, []);

 if (loading) {
  return (
   <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
    <div className="sb-ui-spinner sb-ui-spinner--primary sb-ui-spinner--large" />
   </div>
  );
 }

 if (error) {
  return (
   <div className="sb-ui-alert sb-ui-alert--error">
    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }} />
    {error}
   </div>
  );
 }

 if (!report) return null;

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   <h1 className="sb-ui-heading-h4">
    <i className="fa-solid fa-file-lines" style={{ marginRight: "0.5rem" }} />
    Reporte Ejecutivo CTO
   </h1>

   {/* DORA Table */}
   <section>
    <h2 className="sb-ui-heading-h6" style={{ marginBottom: "0.75rem" }}>Métricas DORA — Semáforo</h2>
    <article className="sb-ui-card sb-ui-card--elevated">
     <div className="sb-ui-card__content" style={{ padding: "0" }}>
      <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
       <thead>
        <tr>
         <th>Equipo</th>
         <th>Deploy Freq</th>
         <th>Lead Time</th>
         <th>CFR</th>
         <th>MTTR</th>
         <th>Clasificación</th>
        </tr>
       </thead>
       <tbody>
        {report.dora_table.map((row) => (
         <tr key={row.team_id}>
          <td><strong>{row.team_name}</strong></td>
          <td>{row.deploy_freq.toFixed(1)}/sem</td>
          <td>{row.lead_time_hours.toFixed(1)}h</td>
          <td>{(row.change_failure_rate * 100).toFixed(0)}%</td>
          <td>{row.mttr_hours.toFixed(1)}h</td>
          <td>{trafficLightBadge(row.benchmark)}</td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </article>
   </section>

   {/* Bottlenecks */}
   <section>
    <h2 className="sb-ui-heading-h6" style={{ marginBottom: "0.75rem" }}>
     <i className="fa-solid fa-fire" style={{ marginRight: "0.5rem", color: "#E53935" }} />
     Top Bottlenecks
    </h2>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
     {report.bottlenecks.map((b, idx) => (
      <article key={idx} className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#E5393515", display: "flex", alignItems: "center", justifyContent: "center" }}>
         <span style={{ fontWeight: 700, color: "#E53935", fontSize: "0.875rem" }}>{idx + 1}</span>
        </div>
        <div style={{ flex: 1 }}>
         <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{b.description}</p>
         <p style={{ fontSize: "0.75rem", color: "#666" }}>{b.team_name} — Impacto: {b.impact}</p>
        </div>
        <span className={`sb-ui-badge sb-ui-badge--${b.severity === "high" ? "error" : "warning"}`}>{b.severity === "high" ? "Crítico" : "Atención"}</span>
       </div>
      </article>
     ))}
    </div>
   </section>

   {/* Allocation Balance */}
   <section>
    <h2 className="sb-ui-heading-h6" style={{ marginBottom: "0.75rem" }}>
     <i className="fa-solid fa-scale-balanced" style={{ marginRight: "0.5rem", color: "#2196F3" }} />
     Balance de Asignación
    </h2>
    <article className="sb-ui-card sb-ui-card--elevated">
     <div className="sb-ui-card__content" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
       {report.allocation_balance.map((alloc) => (
        <div key={alloc.category}>
         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{alloc.category}</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{alloc.actual_pct}% / {alloc.target_pct}%</span>
         </div>
         <div style={{ width: "100%", height: "12px", borderRadius: "6px", backgroundColor: "#eee", overflow: "hidden", position: "relative" }}>
          <div style={{ width: `${alloc.actual_pct}%`, height: "100%", backgroundColor: Math.abs(alloc.actual_pct - alloc.target_pct) > 10 ? "#E53935" : "#009056", borderRadius: "6px" }} />
          <div style={{ position: "absolute", left: `${alloc.target_pct}%`, top: 0, width: "2px", height: "100%", backgroundColor: "#333" }} />
         </div>
        </div>
       ))}
      </div>
     </div>
    </article>
   </section>

   {/* Recommendations */}
   <section>
    <h2 className="sb-ui-heading-h6" style={{ marginBottom: "0.75rem" }}>
     <i className="fa-solid fa-lightbulb" style={{ marginRight: "0.5rem", color: "#FFC107" }} />
     Recomendaciones
    </h2>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
     {report.recommendations.map((rec, idx) => (
      <div key={idx} className="sb-ui-alert sb-ui-alert--info">
       <i className="fa-solid fa-circle-info" style={{ marginRight: "0.5rem" }} />
       {rec}
      </div>
     ))}
    </div>
   </section>
  </div>
 );
}
