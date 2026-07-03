import { useState, useEffect } from "react";
import { fetchTeams, type ApiTeam } from "../../data/api-client";
import "../../shared/ChartSetup";
import { Bar } from "react-chartjs-2";

interface RoiTeam { team_id: string; team_name: string; monthly_cost: number; deployments_month: number; cost_per_deployment: number; savings_from_automation: number; ai_roi: number; engineering_roi_pct: number; }
interface RoiOverview { teams: RoiTeam[]; total_engineering_roi_pct: number; total_ai_savings: number; }
interface Stage { name: string; avg_hours: number; items_in_stage: number; }
interface ValueStream { team_id: string; stages: Stage[]; total_lead_time_hours: number; flow_efficiency_pct: number; bottleneck: string; }
interface HealthScore { team_id: string; team_name: string; health_score: number; dora_score: number; flow_score: number; devex_score: number; wip_score: number; predictability_score: number; priority_area: string; }

const API = "http://localhost:8000/api/v1";
const getHeaders = (): Record<string, string> => { const t = localStorage.getItem("auth_token"); return t ? { Authorization: `Bearer ${t}` } : {}; };

export function RoiPage() {
 const [teams, setTeams] = useState<ApiTeam[]>([]);
 const [roi, setRoi] = useState<RoiOverview | null>(null);
 const [vsTeam, setVsTeam] = useState("");
 const [vs, setVs] = useState<ValueStream | null>(null);
 const [health, setHealth] = useState<HealthScore[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  Promise.all([
   fetchTeams(),
   fetch(`${API}/roi/overview`, { headers: getHeaders() }).then(r => r.json()),
   fetch(`${API}/roi/health-scores`, { headers: getHeaders() }).then(r => r.json()),
  ]).then(([t, r, h]) => {
   setTeams(t); setRoi(r); setHealth(h);
   if (t.length) setVsTeam(t[0].id);
  }).finally(() => setLoading(false));
 }, []);

 useEffect(() => {
  if (!vsTeam) return;
  fetch(`${API}/roi/value-stream/${vsTeam}`, { headers: getHeaders() }).then(r => r.json()).then(setVs);
 }, [vsTeam]);

 if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className="sb-ui-spinner sb-ui-spinner--primary sb-ui-spinner--large" /></div>;

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   <h1 className="sb-ui-heading-h4">ROI & Value Stream Intelligence</h1>

   {/* KPI Summary Cards */}
   {roi && (
    <div className="sb-ui-grid">
     <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>Engineering ROI Total</p>
        <p style={{ fontSize: "2rem", fontWeight: 700, color: roi.total_engineering_roi_pct >= 0 ? "#00A651" : "#E53935" }}>
         {roi.total_engineering_roi_pct}%
        </p>
       </div>
      </article>
     </div>
     <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>Ahorro Total por IA</p>
        <p style={{ fontSize: "2rem", fontWeight: 700, color: "#00A651" }}>${roi.total_ai_savings.toLocaleString()}</p>
       </div>
      </article>
     </div>
     <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>Deployments / Mes (Total)</p>
        <p style={{ fontSize: "2rem", fontWeight: 700, color: "#333" }}>{roi.teams.reduce((s, t) => s + t.deployments_month, 0)}</p>
       </div>
      </article>
     </div>
    </div>
   )}

   {/* Charts Row */}
   {roi && (
    <div className="sb-ui-grid">
     {/* Cost per Deployment Bar Chart */}
     <div className="sb-ui-col-12 sb-ui-col-md-6" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Cost per Deployment</h3>
        <div style={{ height: "250px" }}>
         <Bar
          data={{
           labels: roi.teams.map(t => t.team_name),
           datasets: [{
            label: "$/Deploy",
            data: roi.teams.map(t => t.cost_per_deployment),
            backgroundColor: "#2196F3",
            borderRadius: 4,
           }],
          }}
          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
         />
        </div>
       </div>
      </article>
     </div>

     {/* AI Savings vs License Cost */}
     <div className="sb-ui-col-12 sb-ui-col-md-6" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>AI Savings vs License Cost</h3>
        <div style={{ height: "250px" }}>
         <Bar
          data={{
           labels: roi.teams.map(t => t.team_name),
           datasets: [
            {
             label: "Ahorro IA ($)",
             data: roi.teams.map(t => t.savings_from_automation),
             backgroundColor: "#00A651",
             borderRadius: 4,
            },
            {
             label: "Costo Licencia ($)",
             data: roi.teams.map(t => Math.round(t.monthly_cost * 0.05)),
             backgroundColor: "#E53935",
             borderRadius: 4,
            },
           ],
          }}
          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } } }}
         />
        </div>
       </div>
      </article>
     </div>
    </div>
   )}

   {/* ROI Table */}
   {roi && (
    <article className="sb-ui-card sb-ui-card--elevated">
     <div className="sb-ui-card__content">
      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>ROI por Célula</h3>
      <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
       <thead><tr><th>Célula</th><th>Costo/Mes</th><th>Deploys/Mes</th><th>Costo/Deploy</th><th>Ahorro IA</th><th>ROI</th></tr></thead>
       <tbody>
        {roi.teams.map(t => (
         <tr key={t.team_id}>
          <td><strong>{t.team_name}</strong></td>
          <td>${t.monthly_cost.toLocaleString()}</td>
          <td>{t.deployments_month}</td>
          <td>${t.cost_per_deployment.toLocaleString()}</td>
          <td style={{ color: "#00A651" }}>${t.savings_from_automation.toLocaleString()}</td>
          <td><span className={`sb-ui-badge ${t.engineering_roi_pct >= 0 ? "sb-ui-badge--success" : "sb-ui-badge--error"}`}>{t.engineering_roi_pct}%</span></td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </article>
   )}

   {/* Value Stream Map */}
   <article className="sb-ui-card sb-ui-card--elevated">
    <div className="sb-ui-card__content">
     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Value Stream Map</h3>
      <div className="sb-ui-input-container" style={{ minWidth: "200px" }}>
       <select className="sb-ui-select" value={vsTeam} onChange={e => setVsTeam(e.target.value)}>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
       </select>
      </div>
     </div>

     {vs && (
      <>
       <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "1rem" }}>
        {vs.stages.filter(s => s.avg_hours > 0 || s.items_in_stage > 0).map((stage, i) => {
         const maxHours = Math.max(...vs.stages.map(s => s.avg_hours), 1);
         const width = stage.avg_hours > 0 ? Math.max((stage.avg_hours / maxHours) * 100, 15) : 15;
         const isBottleneck = stage.name === vs.bottleneck;
         return (
          <div key={i} style={{ flex: `0 0 ${width}%`, minWidth: "60px" }}>
           <div style={{
            padding: "0.75rem 0.5rem", borderRadius: "8px", textAlign: "center",
            backgroundColor: isBottleneck ? "#FFEBEE" : "#F5F5F5",
            border: isBottleneck ? "2px solid #E53935" : "1px solid #E0E0E0",
           }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: isBottleneck ? "#E53935" : "#333" }}>{stage.name}</p>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: isBottleneck ? "#E53935" : "#00A651" }}>{stage.avg_hours}h</p>
            <p style={{ fontSize: "0.6rem", color: "#9E9E9E" }}>{stage.items_in_stage} items</p>
           </div>
           {i < vs.stages.filter(s => s.avg_hours > 0 || s.items_in_stage > 0).length - 1 && (
            <div style={{ textAlign: "center", color: "#9E9E9E", fontSize: "0.8rem" }}>→</div>
           )}
          </div>
         );
        })}
       </div>
       <div style={{ display: "flex", gap: "2rem", fontSize: "0.875rem" }}>
        <span>Lead Time Total: <strong>{vs.total_lead_time_hours}h</strong></span>
        <span>Flow Efficiency: <strong style={{ color: "#00A651" }}>{vs.flow_efficiency_pct}%</strong></span>
        <span>Bottleneck: <strong style={{ color: "#E53935" }}>{vs.bottleneck}</strong></span>
       </div>
      </>
     )}
    </div>
   </article>

   {/* Health Scores */}
   <article className="sb-ui-card sb-ui-card--elevated">
    <div className="sb-ui-card__content">
     <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Health Score Compuesto (0-100)</h3>
     <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
      <thead><tr><th>#</th><th>Célula</th><th>Score</th><th>DORA</th><th>Flow</th><th>DevEx</th><th>WIP</th><th>Predict.</th><th>Prioridad</th></tr></thead>
      <tbody>
       {health.map((h, i) => (
        <tr key={h.team_id}>
         <td>{i + 1}</td>
         <td><strong>{h.team_name}</strong></td>
         <td>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
           <div style={{ width: "60px", height: "8px", borderRadius: "4px", backgroundColor: "#E0E0E0", overflow: "hidden" }}>
            <div style={{ width: `${h.health_score}%`, height: "100%", backgroundColor: h.health_score >= 70 ? "#00A651" : h.health_score >= 50 ? "#FFC107" : "#E53935", borderRadius: "4px" }} />
           </div>
           <strong>{h.health_score}</strong>
          </div>
         </td>
         <td>{h.dora_score}</td>
         <td>{h.flow_score}</td>
         <td>{h.devex_score}</td>
         <td>{h.wip_score}</td>
         <td>{h.predictability_score}</td>
         <td><span className="sb-ui-badge sb-ui-badge--warning"><i className="fa-solid fa-arrow-up" style={{ marginRight: "4px", fontSize: "0.6rem" }} />{h.priority_area === "Flow" ? "Flujo" : h.priority_area === "DORA" ? "DORA" : h.priority_area === "DevEx" ? "DevEx" : h.priority_area === "WIP" ? "WIP" : "Predictab."}</span></td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </article>
  </div>
 );
}
