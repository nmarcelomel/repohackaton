import { useState, useEffect } from "react";
import { Chip } from "../../shared/Chip";
import "../../shared/ChartSetup";
import { Bar } from "react-chartjs-2";

interface HealthScore {
 team_id: string;
 team_name: string;
 health_score: number;
}

interface DoraTeam {
 team_id: string;
 team_name: string;
 benchmark: string;
 current: {
  deployment_frequency: number;
  lead_time_hours: number;
  change_failure_rate: number;
  mttr_hours: number;
  deployment_rework_rate: number;
 };
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
const getHeaders = (): Record<string, string> => {
 const t = localStorage.getItem("auth_token");
 return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

function getScoreColor(score: number): string {
 if (score > 70) return "#00A651";
 if (score >= 50) return "#FFC107";
 return "#E53935";
}

function getBenchmarkVariant(benchmark: string): "success" | "warning" | "error" | "info" {
 if (benchmark === "Elite") return "success";
 if (benchmark === "High") return "info";
 if (benchmark === "Medium") return "warning";
 return "error";
}

export function ComparativaPage() {
 const [healthScores, setHealthScores] = useState<HealthScore[]>([]);
 const [doraData, setDoraData] = useState<DoraTeam[]>([]);
 const [wipData, setWipData] = useState<WipStatus[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  Promise.all([
   fetch(`${API}/roi/health-scores`, { headers: getHeaders() }).then(r => r.json()) as Promise<HealthScore[]>,
   fetch(`${API}/dora`, { headers: getHeaders() }).then(r => r.json()) as Promise<DoraTeam[]>,
   fetch(`${API}/wip`, { headers: getHeaders() }).then(r => r.json()) as Promise<WipStatus[]>,
  ])
   .then(([hs, dora, wip]) => {
    setHealthScores(hs);
    setDoraData(dora);
    setWipData(wip);
   })
   .catch((e) => setError(e instanceof Error ? e.message : "Error cargando datos"))
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
    Error al cargar datos: {error}. Verifica que el backend esté corriendo en puerto 8000.
   </div>
  );
 }

 const sorted = [...healthScores].sort((a, b) => b.health_score - a.health_score);
 const bestTeam = sorted[0];
 const worstTeam = sorted[sorted.length - 1];
 const avgHealth = sorted.length > 0 ? sorted.reduce((sum, t) => sum + t.health_score, 0) / sorted.length : 0;

 const chartData = {
  labels: sorted.map(t => t.team_name),
  datasets: [{
   label: "Health Score",
   data: sorted.map(t => t.health_score),
   backgroundColor: sorted.map(t => getScoreColor(t.health_score)),
   borderRadius: 4,
  }],
 };

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   {/* Header */}
   <div>
    <h1 className="sb-ui-heading-h4">Comparativa de Células</h1>
    <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
     Visión sistémica — ¿quién necesita apoyo?
    </p>
   </div>

   {/* Summary Cards */}
   <div className="sb-ui-grid">
    <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
     <article className="sb-ui-card sb-ui-card--elevated" style={{ borderLeft: "4px solid #00A651" }}>
      <div className="sb-ui-card__content">
       <p style={{ fontSize: "0.75rem", color: "#9E9E9E", marginBottom: "0.25rem" }}>Mejor equipo</p>
       <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#00A651" }}>{bestTeam?.team_name || "—"}</p>
       <p style={{ fontSize: "0.875rem", color: "#666" }}>Score: {bestTeam?.health_score?.toFixed(0) || 0}</p>
      </div>
     </article>
    </div>
    <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
     <article className="sb-ui-card sb-ui-card--elevated" style={{ borderLeft: "4px solid #E53935" }}>
      <div className="sb-ui-card__content">
       <p style={{ fontSize: "0.75rem", color: "#9E9E9E", marginBottom: "0.25rem" }}>Equipo que necesita apoyo</p>
       <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#E53935" }}>{worstTeam?.team_name || "—"}</p>
       <p style={{ fontSize: "0.875rem", color: "#666" }}>Score: {worstTeam?.health_score?.toFixed(0) || 0}</p>
      </div>
     </article>
    </div>
    <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
     <article className="sb-ui-card sb-ui-card--elevated" style={{ borderLeft: "4px solid #2196F3" }}>
      <div className="sb-ui-card__content">
       <p style={{ fontSize: "0.75rem", color: "#9E9E9E", marginBottom: "0.25rem" }}>Promedio organizacional</p>
       <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#2196F3" }}>{avgHealth.toFixed(0)}</p>
       <p style={{ fontSize: "0.875rem", color: "#666" }}>Health Score promedio</p>
      </div>
     </article>
    </div>
   </div>

   {/* Horizontal Bar Chart */}
   <article className="sb-ui-card sb-ui-card--elevated">
    <div className="sb-ui-card__content">
     <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Health Score por Equipo</h3>
     <div style={{ height: `${Math.max(200, sorted.length * 50)}px` }}>
      <Bar
       data={chartData}
       options={{
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
         x: { beginAtZero: true, max: 100 },
         y: { grid: { display: false } },
        },
       }}
      />
     </div>
    </div>
   </article>

   {/* Leaderboard Table */}
   <article className="sb-ui-card sb-ui-card--elevated">
    <div className="sb-ui-card__content" style={{ padding: "0" }}>
     <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
      <thead>
       <tr>
        <th>#</th>
        <th>Equipo</th>
        <th>Health Score</th>
        <th>DORA Benchmark</th>
        <th>WIP Status</th>
        <th>Deploy Freq</th>
        <th>Cycle Time P50</th>
       </tr>
      </thead>
      <tbody>
       {sorted.map((team, idx) => {
        const dora = doraData.find(d => d.team_id === team.team_id);
        const wip = wipData.find(w => w.team_id === team.team_id);
        const color = getScoreColor(team.health_score);
        const pct = Math.min(100, team.health_score);

        return (
         <tr key={team.team_id}>
          <td><strong>#{idx + 1}</strong></td>
          <td><strong>{team.team_name}</strong></td>
          <td style={{ minWidth: "160px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ flex: 1, height: "8px", backgroundColor: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
             <div style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: "4px", transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color, minWidth: "28px" }}>{team.health_score.toFixed(0)}</span>
           </div>
          </td>
          <td>
           {dora ? (
            <Chip variant={getBenchmarkVariant(dora.benchmark)}>{dora.benchmark}</Chip>
           ) : (
            <Chip variant="neutral">N/A</Chip>
           )}
          </td>
          <td>
           {wip ? (
            <Chip variant={wip.is_overloaded ? "error" : "success"}>
             {wip.is_overloaded ? "Sobrecargado" : "OK"}
            </Chip>
           ) : (
            <Chip variant="neutral">N/A</Chip>
           )}
          </td>
          <td>{dora ? `${dora.current.deployment_frequency}/sem` : "—"}</td>
          <td>{dora ? `${dora.current.lead_time_hours}h` : "—"}</td>
         </tr>
        );
       })}
      </tbody>
     </table>
    </div>
   </article>
  </div>
 );
}
