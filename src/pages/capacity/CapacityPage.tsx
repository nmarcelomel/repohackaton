import { Chip } from "../../shared/Chip";
import { useState, useEffect } from "react";
import { fetchCapacity, fetchAllocation, fetchTeams, type ApiCapacity, type ApiAllocation, type ApiTeam } from "../../data/api-client";
import "../../shared/ChartSetup";
import { Bar, Doughnut } from "react-chartjs-2";

export function CapacityPage() {
 const [teams, setTeams] = useState<ApiTeam[]>([]);
 const [capacity, setCapacity] = useState<ApiCapacity[]>([]);
 const [selectedTeam, setSelectedTeam] = useState("");
 const [allocations, setAllocations] = useState<ApiAllocation[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  Promise.all([fetchTeams(), fetchCapacity()]).then(([t, c]) => {
   setTeams(t); setCapacity(c); if (t.length) setSelectedTeam(t[0].id);
  }).finally(() => setLoading(false));
 }, []);

 useEffect(() => {
  if (!selectedTeam) return;
  fetchAllocation(selectedTeam).then(setAllocations);
 }, [selectedTeam]);

 if (loading) {
  return <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className="sb-ui-spinner sb-ui-spinner--primary sb-ui-spinner--large" /></div>;
 }

 const overloaded = capacity.filter((c) => c.alert === "overloaded");
 const subutilizado = capacity.filter((c) => c.alert === "subutilizado");

 // Grouped Bar: Capacity vs Committed
 const capacityBarData = {
  labels: capacity.map(c => c.team_name),
  datasets: [
   {
    label: "Capacidad (pts)",
    data: capacity.map(c => c.capacity_points),
    backgroundColor: "#2196F3",
    borderRadius: 4,
   },
   {
    label: "Comprometido (pts)",
    data: capacity.map(c => c.committed_points),
    backgroundColor: "#00A651",
    borderRadius: 4,
   },
  ],
 };

 // Latest allocation for doughnut
 const latestAllocation = allocations.length > 0 ? allocations[allocations.length - 1] : null;

 const allocationDoughnutData = latestAllocation ? {
  labels: ["Funcionalidades", "Defectos", "Deuda Técnica", "Riesgo/Compliance"],
  datasets: [{
   data: [latestAllocation.features_pct, latestAllocation.defects_pct, latestAllocation.tech_debt_pct, latestAllocation.risk_compliance_pct],
   backgroundColor: ["#00A651", "#E53935", "#FFC107", "#2196F3"],
   borderWidth: 0,
  }],
 } : null;

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   <h1 className="sb-ui-heading-h4">Capacidad vs Demanda Capacity vs Demand & Allocation Asignación</h1>

   {/* Alerts */}
   {overloaded.length > 0 && (
    <div className="sb-ui-alert sb-ui-alert--error">
     <i className="fa-solid fa-circle-exclamation" />
     <span><strong>Sobrecarga ({">"}85%):</strong> {overloaded.map(c => c.team_name).join(", ")}</span>
    </div>
   )}
   {subutilizado.length > 0 && (
    <div className="sb-ui-alert sb-ui-alert--warning">
     <i className="fa-solid fa-triangle-exclamation" />
     <span><strong>Subutilización ({"<"}50%):</strong> {subutilizado.map(c => c.team_name).join(", ")}</span>
    </div>
   )}

   {/* Capacity vs Committed Grouped Bar Chart */}
   <article className="sb-ui-card sb-ui-card--elevated">
    <div className="sb-ui-card__content">
     <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Capacidad vs Comprometido por Equipo</h3>
     <div style={{ height: "250px" }}>
      <Bar
       data={capacityBarData}
       options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } } }}
      />
     </div>
    </div>
   </article>

   {/* Capacity Table */}
   <article className="sb-ui-card sb-ui-card--elevated">
    <div className="sb-ui-card__content">
     <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Utilización por Célula</h3>
     <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
      <thead>
       <tr><th>Célula</th><th>Comprometido</th><th>Capacidad</th><th>Utilización</th><th>Estado</th></tr>
      </thead>
      <tbody>
       {capacity.map((c) => (
        <tr key={c.team_id}>
         <td><strong>{c.team_name}</strong></td>
         <td>{c.committed_points} pts</td>
         <td>{c.capacity_points} pts</td>
         <td>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
           <div style={{ flex: 1, height: "8px", borderRadius: "4px", backgroundColor: "#E0E0E0", overflow: "hidden" }}>
            <div style={{
             width: `${Math.min(c.utilization_pct, 100)}%`, height: "100%", borderRadius: "4px",
             backgroundColor: c.alert === "overloaded" ? "#E53935" : c.alert === "subutilizado" ? "#FFC107" : "#00A651"
            }} />
           </div>
           <span style={{ fontSize: "0.75rem", fontWeight: 700, minWidth: "40px" }}>{c.utilization_pct}%</span>
          </div>
         </td>
         <td>
          {c.alert === "overloaded" && <Chip variant="error">Sobrecarga</Chip>}
          {c.alert === "subutilizado" && <Chip variant="warning">Subutilizado</Chip>}
          {!c.alert && <Chip variant="success">Óptimo</Chip>}
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </article>

   {/* Allocation Section */}
   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Asignación por Tipo de Trabajo</h2>
    <div className="sb-ui-input-container" style={{ minWidth: "200px" }}>
     <select className="sb-ui-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
     </select>
    </div>
   </div>

   {/* Allocation Doughnut Chart */}
   {allocationDoughnutData && (
    <div className="sb-ui-grid">
     <div className="sb-ui-col-12 sb-ui-col-md-6" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>
         Distribución Actual ({latestAllocation!.period_start} → {latestAllocation!.period_end})
        </h3>
        <div style={{ height: "250px" }}>
         <Doughnut
          data={allocationDoughnutData}
          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
         />
        </div>
        {latestAllocation!.alert && (
         <div className="sb-ui-alert sb-ui-alert--warning" style={{ marginTop: "0.75rem" }}>
          <span style={{ fontSize: "0.75rem" }}>⚠️ Deuda Técnica + Defectos &gt; 40%</span>
         </div>
        )}
       </div>
      </article>
     </div>
     <div className="sb-ui-col-12 sb-ui-col-md-6" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Histórico de Allocation</h3>
        <table className="sb-ui-table sb-ui-table--striped">
         <thead>
          <tr><th>Periodo</th><th>Funcionalidades</th><th>Defectos</th><th>Debt</th><th>Riesgo</th></tr>
         </thead>
         <tbody>
          {allocations.map((alloc) => (
           <tr key={alloc.id}>
            <td style={{ fontSize: "0.75rem" }}>{alloc.period_start}</td>
            <td><strong>{alloc.features_pct}%</strong></td>
            <td>{alloc.defects_pct}%</td>
            <td>{alloc.tech_debt_pct}%</td>
            <td>{alloc.risk_compliance_pct}%</td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </article>
     </div>
    </div>
   )}

   <div style={{ padding: "0.75rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
    <p style={{ fontSize: "0.75rem", color: "#666" }}>
     <strong>Meta objetivo:</strong> 70% Funcionalidades / 15% Deuda Técnica / 10% Defectos / 5% Riesgo
    </p>
   </div>
  </div>
 );
}
