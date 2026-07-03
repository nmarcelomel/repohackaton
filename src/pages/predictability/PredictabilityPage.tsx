import { useState, useEffect, type FormEvent } from "react";
import { fetchTeams, submitPredictability, fetchPredictability, type ApiTeam, type ApiPredictabilityRecord } from "../../data/api-client";

const DEVIATION_CAUSES = [
 { value: "scope_creep", label: "Scope Creep" },
 { value: "dependencias", label: "Dependencias" },
 { value: "bugs", label: "Bugs" },
 { value: "capacity", label: "Capacidad" },
];

export function PredictabilityPage() {
 const [teams, setTeams] = useState<ApiTeam[]>([]);
 const [selectedTeam, setSelectedTeam] = useState("");
 const [filterTeam, setFilterTeam] = useState("");
 const [records, setRecords] = useState<ApiPredictabilityRecord[]>([]);
 const [loading, setLoading] = useState(false);
 const [submitMsg, setSubmitMsg] = useState("");
 const [submitting, setSubmitting] = useState(false);

 // Form state
 const [periodName, setPeriodName] = useState("");
 const [itemsCommitted, setItemsCommitted] = useState("");
 const [itemsCompleted, setItemsCompleted] = useState("");
 const [deviationCause, setDeviationCause] = useState("scope_creep");

 useEffect(() => {
  fetchTeams().then((t) => {
   setTeams(t);
   if (t.length) {
    setSelectedTeam(t[0].id);
    setFilterTeam(t[0].id);
   }
  });
 }, []);

 useEffect(() => {
  if (!filterTeam) return;
  setLoading(true);
  fetchPredictability(filterTeam)
   .then(setRecords)
   .finally(() => setLoading(false));
 }, [filterTeam]);

 async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setSubmitMsg("");
  setSubmitting(true);
  try {
   await submitPredictability({
    team_id: selectedTeam,
    period_name: periodName,
    items_committed: Number(itemsCommitted),
    items_completed: Number(itemsCompleted),
    deviation_cause: deviationCause,
   });
   setSubmitMsg("Registro guardado exitosamente");
   setPeriodName("");
   setItemsCommitted("");
   setItemsCompleted("");
   // Refresh if same team
   if (selectedTeam === filterTeam) {
    fetchPredictability(filterTeam).then(setRecords);
   }
  } catch (err) {
   setSubmitMsg(err instanceof Error ? err.message : "Error al guardar");
  } finally {
   setSubmitting(false);
  }
 }

 function getPredColor(pct: number): string {
  if (pct >= 85) return "#009056";
  if (pct >= 70) return "#FFC107";
  return "#E53935";
 }

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   <h1 className="sb-ui-heading-h4">
    <i className="fa-solid fa-bullseye" style={{ marginRight: "0.5rem" }} />
    Predictability
   </h1>

   {/* Registration Form */}
   <article className="sb-ui-card sb-ui-card--elevated">
    <div className="sb-ui-card__content" style={{ padding: "1.5rem" }}>
     <h2 className="sb-ui-heading-h6" style={{ marginBottom: "1rem" }}>Registrar período</h2>

     {submitMsg && (
      <div className={`sb-ui-alert sb-ui-alert--${submitMsg.includes("exitosa") ? "success" : "error"}`} style={{ marginBottom: "1rem" }}>
       <i className={`fa-solid ${submitMsg.includes("exitosa") ? "fa-check-circle" : "fa-circle-exclamation"}`} style={{ marginRight: "0.5rem" }} />
       {submitMsg}
      </div>
     )}

     <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
       <div className="sb-ui-input-container" style={{ flex: 1, minWidth: "180px" }}>
        <label className="sb-ui-input-label" htmlFor="pred-team">Equipo</label>
        <select id="pred-team" className="sb-ui-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
         {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
       </div>
       <div className="sb-ui-input-container" style={{ flex: 1, minWidth: "180px" }}>
        <label className="sb-ui-input-label" htmlFor="pred-period">Período</label>
        <input id="pred-period" className="sb-ui-input" value={periodName} onChange={(e) => setPeriodName(e.target.value)} placeholder="Sprint 24" required />
       </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
       <div className="sb-ui-input-container" style={{ flex: 1, minWidth: "140px" }}>
        <label className="sb-ui-input-label" htmlFor="pred-committed">Items Comprometidos</label>
        <input id="pred-committed" className="sb-ui-input" type="number" min="1" value={itemsCommitted} onChange={(e) => setItemsCommitted(e.target.value)} required />
       </div>
       <div className="sb-ui-input-container" style={{ flex: 1, minWidth: "140px" }}>
        <label className="sb-ui-input-label" htmlFor="pred-completed">Items Completados</label>
        <input id="pred-completed" className="sb-ui-input" type="number" min="0" value={itemsCompleted} onChange={(e) => setItemsCompleted(e.target.value)} required />
       </div>
       <div className="sb-ui-input-container" style={{ flex: 1, minWidth: "180px" }}>
        <label className="sb-ui-input-label" htmlFor="pred-cause">Causa de Desviación</label>
        <select id="pred-cause" className="sb-ui-select" value={deviationCause} onChange={(e) => setDeviationCause(e.target.value)}>
         {DEVIATION_CAUSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
       </div>
      </div>

      <button
       type="submit"
       className={`sb-ui-button sb-ui-button--primary sb-ui-button--fill${submitting ? " sb-ui-button--disabled" : ""}`}
       disabled={submitting}
       style={{ alignSelf: "flex-start" }}
      >
       {submitting ? "Guardando..." : "Registrar"}
      </button>
     </form>
    </div>
   </article>

   {/* History */}
   <section>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
     <h2 className="sb-ui-heading-h6">Historial</h2>
     <div className="sb-ui-input-container" style={{ minWidth: "220px" }}>
      <select className="sb-ui-select" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
       {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
     </div>
    </div>

    {loading && (
     <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <div className="sb-ui-spinner sb-ui-spinner--primary" />
     </div>
    )}

    {!loading && (
     <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content" style={{ padding: "0" }}>
       <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
        <thead>
         <tr>
          <th>Período</th>
          <th>Comprometidos</th>
          <th>Completados</th>
          <th>Predictability</th>
          <th>Causa Desviación</th>
         </tr>
        </thead>
        <tbody>
         {records.length === 0 ? (
          <tr><td colSpan={5} style={{ textAlign: "center", color: "#666" }}>Sin registros</td></tr>
         ) : (
          records.map((r) => (
           <tr key={r.id}>
            <td>{r.period_name}</td>
            <td>{r.items_committed}</td>
            <td>{r.items_completed}</td>
            <td>
             <span style={{ fontWeight: 700, color: getPredColor(r.predictability_pct) }}>
              {r.predictability_pct.toFixed(0)}%
             </span>
            </td>
            <td>
             <span className={`sb-ui-badge sb-ui-badge--${r.deviation_cause === "bugs" ? "error" : "warning"}`}>
              {DEVIATION_CAUSES.find((c) => c.value === r.deviation_cause)?.label ?? r.deviation_cause}
             </span>
            </td>
           </tr>
          ))
         )}
        </tbody>
       </table>
      </div>
     </article>
    )}
   </section>
  </div>
 );
}
