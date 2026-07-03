import { useState, useEffect } from "react";
import { fetchFlowMetrics, fetchTeams, fetchLeadTimeBreakdown, type ApiFlowMetrics, type ApiTeam, type ApiLeadTimeBreakdown } from "../../data/api-client";
import "../../shared/ChartSetup";
import { Bar, Line } from "react-chartjs-2";

export function FlowPage() {
 const [teams, setTeams] = useState<ApiTeam[]>([]);
 const [selectedTeam, setSelectedTeam] = useState("");
 const [metrics, setMetrics] = useState<ApiFlowMetrics | null>(null);
 const [leadTime, setLeadTime] = useState<ApiLeadTimeBreakdown | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  fetchTeams().then((t) => { setTeams(t); if (t.length) setSelectedTeam(t[0].id); });
 }, []);

 useEffect(() => {
  if (!selectedTeam) return;
  setLoading(true);
  Promise.all([
   fetchFlowMetrics(selectedTeam),
   fetchLeadTimeBreakdown(selectedTeam),
  ]).then(([m, lt]) => {
   setMetrics(m);
   setLeadTime(lt);
  }).finally(() => setLoading(false));
 }, [selectedTeam]);

 if (loading) {
  return <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className="sb-ui-spinner sb-ui-spinner--primary sb-ui-spinner--large" /></div>;
 }

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <h1 className="sb-ui-heading-h4">Flow Metrics & Cycle Time</h1>
    <div className="sb-ui-input-container" style={{ minWidth: "220px" }}>
     <label className="sb-ui-input-label" htmlFor="team-flow">Célula</label>
     <select id="team-flow" className="sb-ui-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
     </select>
    </div>
   </div>

   {metrics && (
    <>
     {/* Cycle Time Percentiles */}
     <div className="sb-ui-grid">
      <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
       <article className="sb-ui-card sb-ui-card--elevated">
        <div className="sb-ui-card__content" style={{ textAlign: "center" }}>
         <p style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>Cycle Time P50</p>
         <p style={{ fontSize: "2rem", fontWeight: 700, color: "#00A651" }}>{metrics.cycle_time.p50}h</p>
        </div>
       </article>
      </div>
      <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
       <article className="sb-ui-card sb-ui-card--elevated">
        <div className="sb-ui-card__content" style={{ textAlign: "center" }}>
         <p style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>Cycle Time P85</p>
         <p style={{ fontSize: "2rem", fontWeight: 700, color: "#FFC107" }}>{metrics.cycle_time.p85}h</p>
        </div>
       </article>
      </div>
      <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
       <article className="sb-ui-card sb-ui-card--elevated">
        <div className="sb-ui-card__content" style={{ textAlign: "center" }}>
         <p style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>Cycle Time P95</p>
         <p style={{ fontSize: "2rem", fontWeight: 700, color: "#E53935" }}>{metrics.cycle_time.p95}h</p>
        </div>
       </article>
      </div>
     </div>

     {/* Histogram Bar Chart */}
     <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
       <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Histograma de Cycle Time</h3>
       <div style={{ height: "250px" }}>
        {(() => {
         const values = metrics.cycle_time.histogram;
         const max = Math.max(...values, 1);
         const bucketCount = 15;
         const buckets = Array.from({ length: bucketCount }, (_, i) => {
          const low = (i / bucketCount) * max;
          const high = ((i + 1) / bucketCount) * max;
          return values.filter((v) => v >= low && v < high).length;
         });
         const labels = Array.from({ length: bucketCount }, (_, i) => `${Math.round((i / bucketCount) * max)}-${Math.round(((i + 1) / bucketCount) * max)}h`);
         return (
          <Bar
           data={{
            labels,
            datasets: [{
             label: "Items",
             data: buckets,
             backgroundColor: "#00A651",
             borderRadius: 3,
            }],
           }}
           options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 45, font: { size: 10 } } } } }}
          />
         );
        })()}
       </div>
      </div>
     </article>

     {/* Throughput Line Chart */}
     <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
       <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Throughput Semanal</h3>
       <div style={{ height: "250px" }}>
        <Line
         data={{
          labels: metrics.throughput.map(t => t.week_start),
          datasets: [{
           label: "Items Completados",
           data: metrics.throughput.map(t => t.items_completed),
           borderColor: "#2196F3",
           backgroundColor: "rgba(33,150,243,0.1)",
           fill: true,
           tension: 0.3,
           pointBackgroundColor: "#2196F3",
           pointRadius: 5,
          }],
         }}
         options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
        />
       </div>
      </div>
     </article>

     {/* CFD Stacked Bar Chart */}
     <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
       <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Cumulative Flow Diagram</h3>
       <div style={{ height: "300px" }}>
        <Bar
         data={{
          labels: metrics.cfd.map(p => p.date.slice(5)),
          datasets: [
           { label: "Done", data: metrics.cfd.map(p => p.done), backgroundColor: "#00A651" },
           { label: "Testing", data: metrics.cfd.map(p => p.testing), backgroundColor: "#2196F3" },
           { label: "Review", data: metrics.cfd.map(p => p.review), backgroundColor: "#FFC107" },
           { label: "In Progress", data: metrics.cfd.map(p => p.in_progress), backgroundColor: "#FF9800" },
           { label: "Backlog", data: metrics.cfd.map(p => p.backlog), backgroundColor: "#9E9E9E" },
          ],
         }}
         options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
         }}
        />
       </div>
      </div>
     </article>

     {/* AI Impact */}
     <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
       <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Impacto IA en Cycle Time</h3>
       <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "4px" }}>
          <span>Cycle Time con Asistencia IA</span>
          <strong style={{ color: "#00A651" }}>{metrics.ai_cycle_time_avg}h</strong>
         </div>
         <div style={{ width: "100%", height: "24px", borderRadius: "4px", backgroundColor: "#E0E0E0", overflow: "hidden" }}>
          <div style={{ width: `${(metrics.ai_cycle_time_avg / Math.max(metrics.traditional_cycle_time_avg, 1)) * 100}%`, height: "100%", backgroundColor: "#00A651", borderRadius: "4px" }} />
         </div>
        </div>
        <div>
         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "4px" }}>
          <span>Cycle Time Tradicional</span>
          <strong style={{ color: "#9E9E9E" }}>{metrics.traditional_cycle_time_avg}h</strong>
         </div>
         <div style={{ width: "100%", height: "24px", borderRadius: "4px", backgroundColor: "#9E9E9E", overflow: "hidden" }}>
          <div style={{ width: "100%", height: "100%", backgroundColor: "#9E9E9E", borderRadius: "4px" }} />
         </div>
        </div>
       </div>
       <p style={{ fontSize: "0.875rem", marginTop: "1rem" }}>
        <i className="fa-solid fa-bolt" style={{ color: "#00A651", marginRight: "4px" }} />
        Reducción: <strong style={{ color: "#00A651" }}>{metrics.traditional_cycle_time_avg > 0 ? Math.round(((metrics.traditional_cycle_time_avg - metrics.ai_cycle_time_avg) / metrics.traditional_cycle_time_avg) * 100) : 0}%</strong>
       </p>
       <p style={{ fontSize: "0.75rem", color: "#9E9E9E", marginTop: "0.25rem" }}>Flow Efficiency: {metrics.flow_efficiency_pct}%</p>
      </div>
     </article>

     {/* Lead Time Breakdown */}
     {leadTime && (
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
         <i className="fa-solid fa-layer-group" style={{ marginRight: "0.5rem", color: "#2196F3" }} />
         Lead Time Breakdown
        </h3>
        <p style={{ fontSize: "0.75rem", color: "#9E9E9E", marginBottom: "1rem" }}>
         {leadTime.items_analyzed} items analizados — Total avg: {leadTime.total_avg_lead_time_hours.toFixed(1)}h
        </p>

        {(() => {
         const total = leadTime.total_avg_lead_time_hours || 1;
         const stages = [
          { label: "Concept → Commit", hours: leadTime.avg_concept_to_commit_hours, color: "#2196F3" },
          { label: "Commit → Deploy", hours: leadTime.avg_commit_to_deploy_hours, color: "#FF9800" },
          { label: "Deploy → Value", hours: leadTime.avg_deploy_to_value_hours, color: "#009056" },
         ];
         return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
           {/* Stacked bar */}
           <div style={{ width: "100%", height: "40px", borderRadius: "8px", overflow: "hidden", display: "flex" }}>
            {stages.map((stage) => {
             const pct = (stage.hours / total) * 100;
             const isHighlight = pct > 50;
             return (
              <div
               key={stage.label}
               style={{
                width: `${pct}%`,
                height: "100%",
                backgroundColor: stage.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                border: isHighlight ? "3px solid #E53935" : "none",
                boxSizing: "border-box",
               }}
               title={`${stage.label}: ${stage.hours.toFixed(1)}h (${pct.toFixed(0)}%)`}
              >
               {pct > 15 && (
                <span style={{ fontSize: "0.7rem", color: "#fff", fontWeight: 600 }}>
                 {pct.toFixed(0)}%
                </span>
               )}
              </div>
             );
            })}
           </div>

           {/* Legend */}
           <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {stages.map((stage) => {
             const pct = (stage.hours / total) * 100;
             const isHighlight = pct > 50;
             return (
              <div key={stage.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
               <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: stage.color, border: isHighlight ? "2px solid #E53935" : "none" }} />
               <span style={{ fontSize: "0.8rem", fontWeight: isHighlight ? 700 : 400, color: isHighlight ? "#E53935" : "#2B2B2B" }}>
                {stage.label}: {stage.hours.toFixed(1)}h ({pct.toFixed(0)}%)
                {isHighlight && " ⚠️"}
               </span>
              </div>
             );
            })}
           </div>

           {/* Alert if any stage > 50% */}
           {stages.some((s) => (s.hours / total) * 100 > 50) && (
            <div className="sb-ui-alert sb-ui-alert--warning">
             <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "0.5rem" }} />
             <strong>Bottleneck detectado:</strong>&nbsp;
             {stages.filter((s) => (s.hours / total) * 100 > 50).map((s) => s.label).join(", ")} concentra más del 50% del lead time.
            </div>
           )}
          </div>
         );
        })()}
       </div>
      </article>
     )}
    </>
   )}
  </div>
 );
}
