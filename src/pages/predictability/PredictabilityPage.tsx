import { Chip } from "../../shared/Chip";
import { useState, useEffect, useMemo, type FormEvent } from "react";
import { fetchTeams, submitPredictability, fetchPredictability, type ApiTeam, type ApiPredictabilityRecord } from "../../data/api-client";
import "../../shared/ChartSetup";
import { Line, Doughnut } from "react-chartjs-2";

const DEVIATION_CAUSES = [
 { value: "scope_creep", label: "Cambio de alcance", emoji: "📐", color: "#FF9800" },
 { value: "dependencias", label: "Dependencias externas", emoji: "🔗", color: "#9C27B0" },
 { value: "bugs", label: "Bugs en producción", emoji: "🐛", color: "#E53935" },
 { value: "capacity", label: "Falta de capacidad", emoji: "👥", color: "#2196F3" },
 { value: "ninguna", label: "Sin desviación", emoji: "✅", color: "#00A651" },
];

function getPredColor(pct: number): string {
 if (pct >= 85) return "#00A651";
 if (pct >= 70) return "#FFC107";
 return "#E53935";
}

function getPredLabel(pct: number): string {
 if (pct >= 85) return "Excelente";
 if (pct >= 70) return "Aceptable";
 return "Requiere mejora";
}

export function PredictabilityPage() {
 const [teams, setTeams] = useState<ApiTeam[]>([]);
 const [selectedTeam, setSelectedTeam] = useState("");
 const [filterTeam, setFilterTeam] = useState("");
 const [records, setRecords] = useState<ApiPredictabilityRecord[]>([]);
 const [loading, setLoading] = useState(false);
 const [submitMsg, setSubmitMsg] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const [showForm, setShowForm] = useState(false);

 const [periodName, setPeriodName] = useState("");
 const [itemsCommitted, setItemsCommitted] = useState("");
 const [itemsCompleted, setItemsCompleted] = useState("");
 const [deviationCause, setDeviationCause] = useState("scope_creep");

 useEffect(() => {
  fetchTeams().then((t) => { setTeams(t); if (t.length) { setSelectedTeam(t[0].id); setFilterTeam(t[0].id); } });
 }, []);

 useEffect(() => {
  if (!filterTeam) return;
  setLoading(true);
  fetchPredictability(filterTeam).then(setRecords).finally(() => setLoading(false));
 }, [filterTeam]);

 // Computed metrics
 const avgPredictability = useMemo(() => {
  if (records.length === 0) return 0;
  return records.reduce((s, r) => s + r.predictability_pct, 0) / records.length;
 }, [records]);

 const lastPredictability = records.length > 0 ? records[0].predictability_pct : 0;
 const trend = records.length >= 2 ? records[0].predictability_pct - records[1].predictability_pct : 0;

 const causeDistribution = useMemo(() => {
  const counts: Record<string, number> = {};
  records.forEach((r) => { counts[r.deviation_cause] = (counts[r.deviation_cause] || 0) + 1; });
  return counts;
 }, [records]);

 // Preview
 const previewPct = itemsCommitted && itemsCompleted ? Math.round((Number(itemsCompleted) / Number(itemsCommitted)) * 100) : null;

 async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setSubmitMsg("");
  setSubmitting(true);
  try {
   await submitPredictability({ team_id: selectedTeam, period_name: periodName, items_committed: Number(itemsCommitted), items_completed: Number(itemsCompleted), deviation_cause: deviationCause });
   setSubmitMsg("✅ Registro guardado");
   setPeriodName(""); setItemsCommitted(""); setItemsCompleted("");
   setShowForm(false);
   setTimeout(() => setSubmitMsg(""), 3000);
   if (selectedTeam === filterTeam) fetchPredictability(filterTeam).then(setRecords);
  } catch (err) {
   setSubmitMsg(err instanceof Error ? err.message : "Error al guardar");
  } finally { setSubmitting(false); }
 }

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   {/* Header */}
   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
    <div>
     <h1 className="sb-ui-heading-h4">Predictibilidad de Entrega</h1>
     <p style={{ fontSize: "0.8rem", color: "#666", margin: "0.25rem 0 0" }}>¿Cumplimos lo que prometemos? Comprometido vs Entregado por sprint/PI</p>
    </div>
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
     <div className="sb-ui-input-container">
      <label className="sb-ui-input-label">Célula</label>
      <select className="sb-ui-select" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
       {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
     </div>
     <button className="sb-ui-button sb-ui-button--primary sb-ui-button--fill sb-ui-button--icon-left" onClick={() => setShowForm(!showForm)}>
      <i className="fa-solid fa-plus" /> Registrar Período
     </button>
    </div>
   </div>

   {submitMsg && (
    <div className={`sb-ui-alert sb-ui-alert--${submitMsg.includes("✅") ? "success" : "error"}`}>
     <span>{submitMsg}</span>
    </div>
   )}

   {/* KPI Cards */}
   {!loading && records.length > 0 && (
    <div className="sb-ui-grid">
     <div className="sb-ui-col-12 sb-ui-col-md-3" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1.25rem" }}>
        <p style={{ fontSize: "0.7rem", color: "#9E9E9E", margin: 0 }}>Último Sprint</p>
        <p style={{ fontSize: "2.5rem", fontWeight: 800, color: getPredColor(lastPredictability), margin: "0.25rem 0" }}>{lastPredictability.toFixed(0)}%</p>
        <Chip variant={lastPredictability >= 85 ? "success" : lastPredictability >= 70 ? "warning" : "error"}>{getPredLabel(lastPredictability)}</Chip>
       </div>
      </article>
     </div>
     <div className="sb-ui-col-12 sb-ui-col-md-3" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1.25rem" }}>
        <p style={{ fontSize: "0.7rem", color: "#9E9E9E", margin: 0 }}>Promedio Histórico</p>
        <p style={{ fontSize: "2.5rem", fontWeight: 800, color: getPredColor(avgPredictability), margin: "0.25rem 0" }}>{avgPredictability.toFixed(0)}%</p>
        <p style={{ fontSize: "0.7rem", color: "#666", margin: 0 }}>{records.length} períodos</p>
       </div>
      </article>
     </div>
     <div className="sb-ui-col-12 sb-ui-col-md-3" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1.25rem" }}>
        <p style={{ fontSize: "0.7rem", color: "#9E9E9E", margin: 0 }}>Tendencia</p>
        <p style={{ fontSize: "2.5rem", fontWeight: 800, color: trend >= 0 ? "#00A651" : "#E53935", margin: "0.25rem 0" }}>
         {trend >= 0 ? "+" : ""}{trend.toFixed(0)}%
        </p>
        <p style={{ fontSize: "0.7rem", color: "#666", margin: 0 }}>{trend >= 0 ? "↗ Mejorando" : "↘ Empeorando"}</p>
       </div>
      </article>
     </div>
     <div className="sb-ui-col-12 sb-ui-col-md-3" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1.25rem" }}>
        <p style={{ fontSize: "0.7rem", color: "#9E9E9E", margin: 0 }}>Meta</p>
        <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "#333", margin: "0.25rem 0" }}>85%</p>
        <p style={{ fontSize: "0.7rem", color: "#666", margin: 0 }}>{avgPredictability >= 85 ? "✅ Cumplida" : `Faltan ${(85 - avgPredictability).toFixed(0)}pp`}</p>
       </div>
      </article>
     </div>
    </div>
   )}

   {/* Form */}
   {showForm && (
    <article className="sb-ui-card sb-ui-card--elevated">
     <div className="sb-ui-card__content" style={{ padding: "1.5rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
       <i className="fa-solid fa-calendar-plus" style={{ marginRight: "8px", color: "#00A651" }} />
       Registrar Nuevo Período
      </h3>
      <form onSubmit={handleSubmit}>
       <div className="sb-ui-grid">
        <div className="sb-ui-col-12 sb-ui-col-md-6">
         <div className="sb-ui-input-container">
          <label className="sb-ui-input-label sb-ui-input-label--required">Equipo</label>
          <select className="sb-ui-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
           {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
         </div>
        </div>
        <div className="sb-ui-col-12 sb-ui-col-md-6">
         <div className="sb-ui-input-container">
          <label className="sb-ui-input-label sb-ui-input-label--required">Nombre del Período</label>
          <input className="sb-ui-input" value={periodName} onChange={(e) => setPeriodName(e.target.value)} placeholder="Ej: Sprint 25 o PI 2026-Q3" required />
         </div>
        </div>
        <div className="sb-ui-col-12 sb-ui-col-md-4">
         <div className="sb-ui-input-container">
          <label className="sb-ui-input-label sb-ui-input-label--required">Items Comprometidos</label>
          <input className="sb-ui-input" type="number" min="1" value={itemsCommitted} onChange={(e) => setItemsCommitted(e.target.value)} placeholder="10" required />
         </div>
        </div>
        <div className="sb-ui-col-12 sb-ui-col-md-4">
         <div className="sb-ui-input-container">
          <label className="sb-ui-input-label sb-ui-input-label--required">Items Completados</label>
          <input className="sb-ui-input" type="number" min="0" value={itemsCompleted} onChange={(e) => setItemsCompleted(e.target.value)} placeholder="8" required />
         </div>
        </div>
        <div className="sb-ui-col-12 sb-ui-col-md-4">
         {previewPct !== null && (
          <div style={{ textAlign: "center", padding: "0.5rem", backgroundColor: `${getPredColor(previewPct)}15`, borderRadius: "8px", border: `1px solid ${getPredColor(previewPct)}` }}>
           <p style={{ fontSize: "0.7rem", color: "#666", margin: 0 }}>Predictibilidad</p>
           <p style={{ fontSize: "1.75rem", fontWeight: 800, color: getPredColor(previewPct), margin: 0 }}>{previewPct}%</p>
          </div>
         )}
        </div>
        <div className="sb-ui-col-12">
         <div className="sb-ui-input-container">
          <label className="sb-ui-input-label">Causa Principal de Desviación</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
           {DEVIATION_CAUSES.map((c) => (
            <button key={c.value} type="button" onClick={() => setDeviationCause(c.value)}
             style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: deviationCause === c.value ? `2px solid ${c.color}` : "1px solid #E0E0E0", backgroundColor: deviationCause === c.value ? `${c.color}15` : "#fff", cursor: "pointer", fontSize: "0.8rem", transition: "all 0.2s" }}>
             {c.emoji} {c.label}
            </button>
           ))}
          </div>
         </div>
        </div>
       </div>
       <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
        <button type="submit" className={`sb-ui-button sb-ui-button--primary sb-ui-button--fill${submitting ? " sb-ui-button--disabled" : ""}`} disabled={submitting}>
         <i className="fa-solid fa-check" style={{ marginRight: "6px" }} />{submitting ? "Guardando..." : "Registrar"}
        </button>
        <button type="button" className="sb-ui-button sb-ui-button--secondary sb-ui-button--stroke" onClick={() => setShowForm(false)}>Cancelar</button>
       </div>
      </form>
     </div>
    </article>
   )}

   {/* Charts */}
   {!loading && records.length > 0 && (
    <div className="sb-ui-grid">
     {/* Trend Line Chart */}
     <div className="sb-ui-col-12 sb-ui-col-md-8" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Tendencia de Predictibilidad</h3>
        <div style={{ height: "220px" }}>
         <Line
          data={{
           labels: [...records].reverse().map(r => r.period_name),
           datasets: [
            { label: "Predictibilidad %", data: [...records].reverse().map(r => r.predictability_pct), borderColor: "#00A651", backgroundColor: "#00A65120", fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: [...records].reverse().map(r => getPredColor(r.predictability_pct)) },
            { label: "Meta (85%)", data: [...records].map(() => 85), borderColor: "#9E9E9E", borderDash: [5, 5], pointRadius: 0, fill: false },
           ],
          }}
          options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 110, ticks: { stepSize: 20 } } }, plugins: { legend: { position: "bottom" } } }}
         />
        </div>
       </div>
      </article>
     </div>
     {/* Causes Donut */}
     <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Causas de Desviación</h3>
        <div style={{ height: "220px" }}>
         <Doughnut
          data={{
           labels: DEVIATION_CAUSES.filter(c => causeDistribution[c.value]).map(c => c.label),
           datasets: [{ data: DEVIATION_CAUSES.filter(c => causeDistribution[c.value]).map(c => causeDistribution[c.value] || 0), backgroundColor: DEVIATION_CAUSES.filter(c => causeDistribution[c.value]).map(c => c.color) }],
          }}
          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12 } } } }}
         />
        </div>
       </div>
      </article>
     </div>
    </div>
   )}

   {/* History Table */}
   {!loading && (
    <article className="sb-ui-card sb-ui-card--elevated">
     <div className="sb-ui-card__content">
      <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Historial de Períodos</h3>
      {records.length === 0 ? (
       <div className="sb-ui-alert sb-ui-alert--info"><span>No hay registros para esta célula. Registra el primer período.</span></div>
      ) : (
       <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
        <thead><tr><th>Período</th><th>Comprometidos</th><th>Completados</th><th>Predictibilidad</th><th>Causa</th></tr></thead>
        <tbody>
         {records.map((r) => (
          <tr key={r.id}>
           <td><strong>{r.period_name}</strong></td>
           <td>{r.items_committed}</td>
           <td>{r.items_completed}</td>
           <td>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
             <div style={{ width: "50px", height: "8px", borderRadius: "4px", backgroundColor: "#E0E0E0", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(r.predictability_pct, 100)}%`, height: "100%", backgroundColor: getPredColor(r.predictability_pct), borderRadius: "4px" }} />
             </div>
             <strong style={{ color: getPredColor(r.predictability_pct) }}>{r.predictability_pct.toFixed(0)}%</strong>
            </div>
           </td>
           <td>
            <Chip variant={r.deviation_cause === "bugs" ? "error" : r.deviation_cause === "ninguna" ? "success" : "warning"}>
             {DEVIATION_CAUSES.find((c) => c.value === r.deviation_cause)?.emoji} {DEVIATION_CAUSES.find((c) => c.value === r.deviation_cause)?.label ?? r.deviation_cause}
            </Chip>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      )}
     </div>
    </article>
   )}

   {loading && (
    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
     <div className="sb-ui-spinner sb-ui-spinner--primary sb-ui-spinner--large" />
    </div>
   )}
  </div>
 );
}
