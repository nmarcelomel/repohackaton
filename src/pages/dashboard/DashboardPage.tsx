import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard, fetchAllDora, type ApiDashboard, type ApiDoraSummary } from "../../data/api-client";
import "../../shared/ChartSetup";
import { Doughnut, Bar } from "react-chartjs-2";

interface HealthScore {
 team_id: string;
 team_name: string;
 health_score: number;
}

const API = "http://localhost:8000/api/v1";
const getHeaders = (): Record<string, string> => { const t = localStorage.getItem("auth_token"); return t ? { Authorization: `Bearer ${t}` } : {}; };

export function DashboardPage() {
 const [data, setData] = useState<ApiDashboard | null>(null);
 const [doraData, setDoraData] = useState<ApiDoraSummary[]>([]);
 const [healthScores, setHealthScores] = useState<HealthScore[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 useEffect(() => {
  Promise.all([
   fetchDashboard(),
   fetchAllDora(),
   fetch(`${API}/roi/health-scores`, { headers: getHeaders() }).then(r => r.json()) as Promise<HealthScore[]>,
  ])
   .then(([d, dora, hs]) => { setData(d); setDoraData(dora); setHealthScores(hs); })
   .catch((e) => setError(e instanceof Error ? e.message : "Error cargando dashboard"))
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

 if (!data) return null;

 const kpis = [
  { label: "Deploy Freq (avg/sem)", value: data.avg_deploy_freq.toFixed(1), icon: "fa-rocket", color: "#009056", link: "/dora" },
  { label: "Cycle Time P50 (hrs)", value: data.avg_cycle_time_p50.toFixed(1), icon: "fa-clock", color: "#2196F3", link: "/flow" },
  { label: "WIP Overloaded", value: data.wip_overloaded_count.toString(), icon: "fa-triangle-exclamation", color: data.wip_overloaded_count > 0 ? "#E53935" : "#009056", link: "/wip" },
  { label: "Demandas Pendientes", value: data.pending_demands_count.toString(), icon: "fa-layer-group", color: "#FF9800", link: "/demand" },
 ];

 // Doughnut: Teams by Health
 const greenTeams = healthScores.filter(h => h.health_score > 70).length;
 const yellowTeams = healthScores.filter(h => h.health_score >= 50 && h.health_score <= 70).length;
 const redTeams = healthScores.filter(h => h.health_score < 50).length;

 const healthDoughnutData = {
  labels: ["Saludable (>70)", "En riesgo (50-70)", "Crítico (<50)"],
  datasets: [{
   data: [greenTeams, yellowTeams, redTeams],
   backgroundColor: ["#00A651", "#FFC107", "#E53935"],
   borderWidth: 0,
  }],
 };

 // Bar: Deploy frequency per team
 const deployBarData = {
  labels: doraData.map(d => d.team_name),
  datasets: [{
   label: "Deploy Freq/semana",
   data: doraData.map(d => d.current.deployment_frequency),
   backgroundColor: "#00A651",
   borderRadius: 4,
  }],
 };

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   <h1 className="sb-ui-heading-h4">Dashboard</h1>

   {/* KPI Cards */}
   <div className="sb-ui-grid">
    {kpis.map((kpi) => (
     <div key={kpi.label} className="sb-ui-col-12 sb-ui-col-md-6 sb-ui-col-lg-3" style={{ marginBottom: "1rem" }}>
      <Link to={kpi.link} style={{ textDecoration: "none" }}>
       <article className="sb-ui-card sb-ui-card--elevated" style={{ cursor: "pointer", transition: "transform 0.2s" }}>
        <div className="sb-ui-card__content" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem" }}>
         <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: kpi.color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className={`fa-solid ${kpi.icon}`} style={{ fontSize: "1.25rem", color: kpi.color }} />
         </div>
         <div>
          <p style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.25rem" }}>{kpi.label}</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: kpi.color }}>{kpi.value}</p>
         </div>
        </div>
       </article>
      </Link>
     </div>
    ))}
   </div>

   {/* Charts Row */}
   <div className="sb-ui-grid">
    <div className="sb-ui-col-12 sb-ui-col-md-5" style={{ marginBottom: "1rem" }}>
     <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
       <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Teams by Health</h3>
       <div style={{ height: "250px" }}>
        <Doughnut
         data={healthDoughnutData}
         options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
        />
       </div>
      </div>
     </article>
    </div>
    <div className="sb-ui-col-12 sb-ui-col-md-7" style={{ marginBottom: "1rem" }}>
     <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
       <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Deploy Frequency por Equipo</h3>
       <div style={{ height: "250px" }}>
        <Bar
         data={deployBarData}
         options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
        />
       </div>
      </div>
     </article>
    </div>
   </div>

   {/* Alerts Section */}
   {data.alerts.length > 0 && (
    <section>
     <h2 className="sb-ui-heading-h6" style={{ marginBottom: "0.75rem" }}>
      <i className="fa-solid fa-bell" style={{ marginRight: "0.5rem", color: "#FF9800" }} />
      Alertas Activas
     </h2>
     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {data.alerts.map((alert, idx) => (
       <div key={idx} className={`sb-ui-alert sb-ui-alert--${alert.severity === "critical" ? "error" : "warning"}`}>
        <i className={`fa-solid ${alert.severity === "critical" ? "fa-circle-exclamation" : "fa-triangle-exclamation"}`} style={{ marginRight: "0.5rem" }} />
        <strong>{alert.team_name}:</strong>&nbsp;{alert.message}
       </div>
      ))}
     </div>
    </section>
   )}

   {/* Team Ranking Table */}
   <section>
    <h2 className="sb-ui-heading-h6" style={{ marginBottom: "0.75rem" }}>
     <i className="fa-solid fa-ranking-star" style={{ marginRight: "0.5rem", color: "#009056" }} />
     Ranking de Equipos
    </h2>
    <article className="sb-ui-card sb-ui-card--elevated">
     <div className="sb-ui-card__content" style={{ padding: "0" }}>
      <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
       <thead>
        <tr>
         <th>#</th>
         <th>Equipo</th>
         <th>Deploy Freq</th>
         <th>Cycle Time P50</th>
         <th>CFR</th>
         <th>Score</th>
        </tr>
       </thead>
       <tbody>
        {data.team_ranking.map((team, idx) => (
         <tr key={team.team_id}>
          <td><strong>{idx + 1}</strong></td>
          <td>{team.team_name}</td>
          <td>{team.deploy_freq.toFixed(1)}</td>
          <td>{team.cycle_time_p50.toFixed(1)}h</td>
          <td>{(team.change_failure_rate * 100).toFixed(0)}%</td>
          <td>
           <span className={`sb-ui-badge sb-ui-badge--${team.score >= 80 ? "success" : team.score >= 60 ? "warning" : "error"}`}>
            {team.score.toFixed(0)}
           </span>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </article>
   </section>
  </div>
 );
}
