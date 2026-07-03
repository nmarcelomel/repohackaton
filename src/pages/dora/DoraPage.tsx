import { useState, useEffect } from "react";
import { fetchAllDora, fetchTeams, type ApiDoraSummary, type ApiTeam } from "../../data/api-client";
import "../../shared/ChartSetup";
import { Bar, Line, Doughnut } from "react-chartjs-2";

const BENCHMARK_COLORS: Record<string, string> = {
 Elite: "sb-ui-badge sb-ui-badge--success sb-ui-badge--circle",
 High: "sb-ui-badge sb-ui-badge--success",
 Medium: "sb-ui-badge sb-ui-badge--warning",
 Low: "sb-ui-badge sb-ui-badge--error",
};

export function DoraPage() {
 const [teams, setTeams] = useState<ApiTeam[]>([]);
 const [selectedTeam, setSelectedTeam] = useState("");
 const [data, setData] = useState<ApiDoraSummary[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  Promise.all([fetchTeams(), fetchAllDora()])
   .then(([t, d]) => { setTeams(t); setData(d); if (t.length > 0) setSelectedTeam(t[0].id); })
   .catch((e) => setError(e.message))
   .finally(() => setLoading(false));
 }, []);

 const current = data.find((d) => d.team_id === selectedTeam);

 if (loading) {
  return (
   <div className="sb-ui-grid">
    <div className="sb-ui-col-12" style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
     <div className="sb-ui-spinner sb-ui-spinner--primary sb-ui-spinner--large" />
    </div>
   </div>
  );
 }

 if (error) {
  return (
   <div className="sb-ui-alert sb-ui-alert--error">
    <i className="fa-solid fa-circle-exclamation" />
    <span>Error al cargar datos: {error}. Verifica que el backend esté corriendo en puerto 8000.</span>
   </div>
  );
 }

 // Benchmark distribution across all teams
 const benchmarkCounts = { Elite: 0, High: 0, Medium: 0, Low: 0 };
 data.forEach((d) => {
  if (d.benchmark in benchmarkCounts) {
   benchmarkCounts[d.benchmark as keyof typeof benchmarkCounts]++;
  }
 });

 const benchmarkDoughnutData = {
  labels: ["Elite", "High", "Medium", "Low"],
  datasets: [{
   data: [benchmarkCounts.Elite, benchmarkCounts.High, benchmarkCounts.Medium, benchmarkCounts.Low],
   backgroundColor: ["#00A651", "#2196F3", "#FFC107", "#E53935"],
   borderWidth: 0,
  }],
 };

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   {/* Header */}
   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <h1 className="sb-ui-heading-h4">DORA Metrics</h1>
    <div className="sb-ui-input-container" style={{ minWidth: "220px" }}>
     <label className="sb-ui-input-label" htmlFor="team-dora">Célula</label>
     <select id="team-dora" className="sb-ui-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
     </select>
    </div>
   </div>

   {current && (
    <>
     {/* Benchmark badge */}
     <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <span className={BENCHMARK_COLORS[current.benchmark] || "sb-ui-badge"}>
       {current.benchmark}
      </span>
      <span style={{ fontSize: "0.875rem", color: "#666" }}>
       Clasificación DORA 2026 — {current.team_name}
      </span>
     </div>

     {/* 5 Metric Cards */}
     <div className="sb-ui-grid">
      {[
       { label: "Deployment Frequency", value: current.current.deployment_frequency, unit: "despliegues/sem", trend: current.trend.map(t => t.deployment_frequency), lower_better: false },
       { label: "Lead Time for Changes", value: current.current.lead_time_hours, unit: "horas", trend: current.trend.map(t => t.lead_time_hours), lower_better: true },
       { label: "Change Failure Rate", value: current.current.change_failure_rate, unit: "%", trend: current.trend.map(t => t.change_failure_rate), lower_better: true },
       { label: "MTTR", value: current.current.mttr_hours, unit: "horas", trend: current.trend.map(t => t.mttr_hours), lower_better: true },
       { label: "Deployment Rework Rate", value: current.current.deployment_rework_rate, unit: "%", trend: current.trend.map(t => t.deployment_rework_rate), lower_better: true },
      ].map((metric) => {
       const improving = metric.trend.length >= 2 && (metric.lower_better
        ? metric.trend[metric.trend.length - 1] < metric.trend[0]
        : metric.trend[metric.trend.length - 1] > metric.trend[0]);

       return (
        <div key={metric.label} className="sb-ui-col-12 sb-ui-col-md-6 sb-ui-col-lg-4" style={{ marginBottom: "1rem" }}>
         <article className="sb-ui-card sb-ui-card--elevated">
          <div className="sb-ui-card__content">
           <p style={{ fontSize: "0.75rem", color: "#9E9E9E", marginBottom: "0.25rem" }}>{metric.label}</p>
           <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#333" }}>
            {metric.value}
            <span style={{ fontSize: "0.75rem", fontWeight: 400, marginLeft: "4px", color: "#9E9E9E" }}>{metric.unit}</span>
           </p>
           <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
            <i className={`fa-solid ${improving ? "fa-arrow-trend-down" : "fa-arrow-trend-up"}`} style={{ color: improving ? "#00A651" : "#E53935", fontSize: "0.75rem" }} />
            <span style={{ fontSize: "0.7rem", color: "#9E9E9E" }}>
             {improving ? "Mejorando" : "Requiere atención"} (4 sem)
            </span>
           </div>
           {/* Mini sparkline */}
           <div style={{ display: "flex", alignItems: "end", gap: "2px", marginTop: "0.5rem", height: "24px" }}>
            {metric.trend.map((v, i) => {
             const max = Math.max(...metric.trend);
             const h = max > 0 ? (v / max) * 24 : 4;
             return <div key={i} style={{ flex: 1, height: `${h}px`, backgroundColor: improving ? "#00A651" : "#E53935", borderRadius: "2px", opacity: 0.4 + (i / metric.trend.length) * 0.6 }} />;
            })}
           </div>
          </div>
         </article>
        </div>
       );
      })}
     </div>

     {/* Charts Section */}
     <div className="sb-ui-grid">
      {/* Deployment Frequency Bar Chart */}
      <div className="sb-ui-col-12 sb-ui-col-md-6" style={{ marginBottom: "1rem" }}>
       <article className="sb-ui-card sb-ui-card--elevated">
        <div className="sb-ui-card__content">
         <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Deployment Frequency (4 semanas)</h3>
         <div style={{ height: "250px" }}>
          <Bar
           data={{
            labels: current.trend.map(t => t.week_start),
            datasets: [{
             label: "Deploys/semana",
             data: current.trend.map(t => t.deployment_frequency),
             backgroundColor: "#00A651",
             borderRadius: 4,
            }],
           }}
           options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
          />
         </div>
        </div>
       </article>
      </div>

      {/* Lead Time Line Chart */}
      <div className="sb-ui-col-12 sb-ui-col-md-6" style={{ marginBottom: "1rem" }}>
       <article className="sb-ui-card sb-ui-card--elevated">
        <div className="sb-ui-card__content">
         <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Lead Time for Changes (4 semanas)</h3>
         <div style={{ height: "250px" }}>
          <Line
           data={{
            labels: current.trend.map(t => t.week_start),
            datasets: [{
             label: "Lead Time (horas)",
             data: current.trend.map(t => t.lead_time_hours),
             borderColor: "#2196F3",
             backgroundColor: "rgba(33,150,243,0.1)",
             fill: true,
             tension: 0.3,
             pointBackgroundColor: "#2196F3",
            }],
           }}
           options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
          />
         </div>
        </div>
       </article>
      </div>
     </div>

     {/* Benchmark Distribution Doughnut */}
     <div className="sb-ui-grid">
      <div className="sb-ui-col-12 sb-ui-col-md-6 sb-ui-col-lg-4" style={{ marginBottom: "1rem" }}>
       <article className="sb-ui-card sb-ui-card--elevated">
        <div className="sb-ui-card__content">
         <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Distribución Benchmark (todos los equipos)</h3>
         <div style={{ height: "250px" }}>
          <Doughnut
           data={benchmarkDoughnutData}
           options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
          />
         </div>
        </div>
       </article>
      </div>
     </div>

     {/* Trend Table */}
     <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
       <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Tendencia últimas 4 semanas</h3>
       <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
        <thead>
         <tr>
          <th>Semana</th>
          <th>Deploy Freq</th>
          <th>Lead Time</th>
          <th>CFR</th>
          <th>MTTR</th>
          <th>Rework</th>
         </tr>
        </thead>
        <tbody>
         {current.trend.map((row) => (
          <tr key={row.id}>
           <td>{row.week_start}</td>
           <td><strong>{row.deployment_frequency}</strong> /sem</td>
           <td>{row.lead_time_hours}h</td>
           <td>{row.change_failure_rate}%</td>
           <td>{row.mttr_hours}h</td>
           <td>{row.deployment_rework_rate}%</td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
     </article>
    </>
   )}
  </div>
 );
}
