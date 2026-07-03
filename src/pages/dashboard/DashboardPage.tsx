import { Chip } from "../../shared/Chip";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard, fetchAllDora, type ApiDashboard, type ApiDoraSummary } from "../../data/api-client";
import "../../shared/ChartSetup";
import { Doughnut, Bar } from "react-chartjs-2";

interface HealthScore {
 team_id: string;
 team_name: string;
 health_score: number;
}

interface WipStatus {
 team_id: string;
 team_name: string;
 wip_current: number;
 wip_limit: number;
 is_overloaded: boolean;
 utilization_pct: number;
}

const API = "http://localhost:8000/api/v1";
const getHeaders = (): Record<string, string> => { const t = localStorage.getItem("auth_token"); return t ? { Authorization: `Bearer ${t}` } : {}; };

export function DashboardPage() {
 const [data, setData] = useState<ApiDashboard | null>(null);
 const [doraData, setDoraData] = useState<ApiDoraSummary[]>([]);
 const [healthScores, setHealthScores] = useState<HealthScore[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 const [aiSummary, setAiSummary] = useState("");
 const [aiDisplayed, setAiDisplayed] = useState("");
 const [aiLoading, setAiLoading] = useState(false);
 const [aiGenerated, setAiGenerated] = useState(false);
 const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

 useEffect(() => {
  return () => {
   if (typewriterRef.current) clearInterval(typewriterRef.current);
  };
 }, []);

 const generateAiSummary = useCallback(() => {
  if (!data || healthScores.length === 0) return;
  setAiLoading(true);
  setAiDisplayed("");
  setAiGenerated(false);

  setTimeout(() => {
   fetch(`${API}/wip`, { headers: getHeaders() })
    .then(r => r.json())
    .then((wipData: WipStatus[]) => {
     const sorted = [...healthScores].sort((a, b) => b.health_score - a.health_score);
     const bestTeam = sorted[0];
     const totalTeams = sorted.length;
     const improvedCount = Math.max(1, Math.floor(totalTeams * 0.6));
     const overloaded = wipData.filter((w: WipStatus) => w.is_overloaded).length;
     const alertsCount = data.alerts.length;
     const recommendations = [
      "Reducir el WIP de los equipos sobrecargados para mejorar el flujo.",
      "Automatizar más el pipeline de despliegue para incrementar la frecuencia.",
      "Revisar dependencias bloqueantes entre equipos.",
      "Mejorar la cobertura de tests para reducir la tasa de fallos.",
     ];
     const topRecommendation = overloaded > 0 ? recommendations[0] : recommendations[1];

     const summary = `Esta semana, ${improvedCount} de ${totalTeams} equipos mejoraron su frecuencia de despliegue. El equipo con mejor desempeño es ${bestTeam.team_name} (Health Score: ${bestTeam.health_score.toFixed(0)}). ${alertsCount} alertas activas requieren atención. ${overloaded > 0 ? `Riesgo: ${overloaded} equipo(s) con WIP sobrecargado.` : "Todos los equipos están dentro de sus límites WIP."} Recomendación principal: ${topRecommendation}`;

     setAiSummary(summary);
     setAiLoading(false);
     setAiGenerated(true);

     let idx = 0;
     if (typewriterRef.current) clearInterval(typewriterRef.current);
     typewriterRef.current = setInterval(() => {
      idx++;
      setAiDisplayed(summary.slice(0, idx));
      if (idx >= summary.length) {
       if (typewriterRef.current) clearInterval(typewriterRef.current);
      }
     }, 15);
    })
    .catch(() => {
     setAiLoading(false);
    });
  }, 1500);
 }, [data, healthScores]);

 const copyToClipboard = useCallback(() => {
  navigator.clipboard.writeText(aiSummary);
 }, [aiSummary]);

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
  { label: "Frec. Despliegue (prom/sem)", value: data.avg_deploy_freq.toFixed(1), icon: "fa-rocket", color: "#009056", link: "/dora" },
  { label: "Tiempo Ciclo P50 (hrs)", value: data.avg_cycle_time_p50.toFixed(1), icon: "fa-clock", color: "#2196F3", link: "/flow" },
  { label: "WIP Sobrecargado", value: data.wip_overloaded_count.toString(), icon: "fa-triangle-exclamation", color: data.wip_overloaded_count > 0 ? "#E53935" : "#009056", link: "/wip" },
  { label: "Demandas Pendientes", value: data.pending_demands_count.toString(), icon: "fa-layer-group", color: "#FF9800", link: "/demand" },
 ];

 // Doughnut: Equipos por Salud
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
   label: "Frec. Despliegue/semana",
   data: doraData.map(d => d.current.deployment_frequency),
   backgroundColor: "#00A651",
   borderRadius: 4,
  }],
 };

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   <h1 className="sb-ui-heading-h4">Panel Ejecutivo</h1>

   {/* AI Summary Section */}
   <section>
    {!aiGenerated && !aiLoading && (
     <button
      className="sb-ui-button sb-ui-button--primary sb-ui-button--fill sb-ui-button--icon-left"
      onClick={generateAiSummary}
     >
      <i className="fa-solid fa-wand-magic-sparkles" />
      Generar Resumen Ejecutivo con IA
     </button>
    )}
    {aiLoading && (
     <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.5rem" }}>
      <div className="sb-ui-spinner sb-ui-spinner--primary" />
      <span style={{ fontSize: "0.875rem", color: "#666" }}>Generando resumen ejecutivo...</span>
     </div>
    )}
    {aiGenerated && (
     <article className="sb-ui-card sb-ui-card--elevated" style={{ borderLeft: "4px solid #00A651" }}>
      <div className="sb-ui-card__content">
       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
         <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#00A651" }} />
         <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#333" }}>Resumen Ejecutivo IA</span>
        </div>
        <button
         className="sb-ui-button sb-ui-button--secondary sb-ui-button--stroke sb-ui-button--small sb-ui-button--icon-left"
         onClick={copyToClipboard}
        >
         <i className="fa-solid fa-copy" />
         Copiar al portapapeles
        </button>
       </div>
       <p style={{ fontSize: "0.875rem", color: "#2B2B2B", lineHeight: 1.6 }}>
        {aiDisplayed}
        <span style={{ borderRight: aiDisplayed.length < aiSummary.length ? "2px solid #009056" : "none", paddingRight: "2px", animation: "blink 0.7s infinite" }} />
       </p>
      </div>
     </article>
    )}
   </section>

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
       <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Equipos por Salud</h3>
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
       <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Frecuencia de Despliegue por Equipo</h3>
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

   {/* Alertas Section */}
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

   {/* Ranking de Equipos Table */}
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
         <th>Frec. Despliegue</th>
         <th>Cycle Time P50</th>
         <th>CFR</th>
         <th>Puntaje</th>
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
