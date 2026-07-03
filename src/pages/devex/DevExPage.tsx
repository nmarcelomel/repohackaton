import { useState, useEffect, type FormEvent } from "react";
import { fetchTeams, submitDevEx, fetchDevExResults, type ApiTeam, type ApiDevExResults } from "../../data/api-client";

const QUESTIONS = [
 { key: "facilidad_deploy", label: "¿Qué tan fácil es hacer deploy de tu código?" },
 { key: "claridad_requerimientos", label: "¿Los requerimientos son claros y bien definidos?" },
 { key: "autonomia_equipo", label: "¿Tienes autonomía para tomar decisiones técnicas?" },
 { key: "satisfaccion_herramientas", label: "¿Estás satisfecho con las herramientas de desarrollo?" },
 { key: "carga_cognitiva", label: "¿La carga cognitiva de tu trabajo es manejable?" },
];

export function DevExPage() {
 const [view, setView] = useState<"form" | "results">("form");
 const [teams, setTeams] = useState<ApiTeam[]>([]);
 const [selectedTeam, setSelectedTeam] = useState("");
 const [answers, setAnswers] = useState<Record<string, number>>({});
 const [respondent, setRespondent] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const [submitMsg, setSubmitMsg] = useState("");
 const [results, setResults] = useState<ApiDevExResults | null>(null);
 const [resultsTeam, setResultsTeam] = useState("");
 const [loadingResults, setLoadingResults] = useState(false);

 useEffect(() => {
  fetchTeams().then((t) => {
   setTeams(t);
   if (t.length) {
    setSelectedTeam(t[0].id);
    setResultsTeam(t[0].id);
   }
  });
 }, []);

 useEffect(() => {
  if (view === "results" && resultsTeam) {
   setLoadingResults(true);
   fetchDevExResults(resultsTeam)
    .then(setResults)
    .finally(() => setLoadingResults(false));
  }
 }, [view, resultsTeam]);

 async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  if (Object.keys(answers).length < QUESTIONS.length) {
   setSubmitMsg("Por favor responde todas las preguntas");
   return;
  }
  setSubmitting(true);
  setSubmitMsg("");
  try {
   await submitDevEx({
    team_id: selectedTeam,
    respondent_alias: respondent || "anonymous",
    facilidad_deploy: answers["facilidad_deploy"] ?? 3,
    claridad_requerimientos: answers["claridad_requerimientos"] ?? 3,
    autonomia_equipo: answers["autonomia_equipo"] ?? 3,
    satisfaccion_herramientas: answers["satisfaccion_herramientas"] ?? 3,
    carga_cognitiva: answers["carga_cognitiva"] ?? 3,
   });
   setSubmitMsg("¡Respuesta enviada exitosamente!");
   setAnswers({});
   setRespondent("");
  } catch (err) {
   setSubmitMsg(err instanceof Error ? err.message : "Error al enviar");
  } finally {
   setSubmitting(false);
  }
 }

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <h1 className="sb-ui-heading-h4">Developer Experience (DevEx)</h1>
    <div style={{ display: "flex", gap: "0.5rem" }}>
     <button
      className={`sb-ui-button sb-ui-button--${view === "form" ? "primary" : "secondary"} sb-ui-button--${view === "form" ? "fill" : "stroke"} sb-ui-button--small sb-ui-button--icon-left`}
      onClick={() => setView("form")}
     >
      <i className="fa-solid fa-pen-to-square" />
      Responder
     </button>
     <button
      className={`sb-ui-button sb-ui-button--${view === "results" ? "primary" : "secondary"} sb-ui-button--${view === "results" ? "fill" : "stroke"} sb-ui-button--small sb-ui-button--icon-left`}
      onClick={() => setView("results")}
     >
      <i className="fa-solid fa-chart-bar" />
      Resultados
     </button>
    </div>
   </div>

   {view === "form" && (
    <article className="sb-ui-card sb-ui-card--elevated">
     <div className="sb-ui-card__content" style={{ padding: "1.5rem" }}>
      <h2 className="sb-ui-heading-h6" style={{ marginBottom: "1.5rem" }}>Encuesta DevEx</h2>

      {submitMsg && (
       <div className={`sb-ui-alert sb-ui-alert--${submitMsg.includes("exitosa") ? "success" : "error"}`} style={{ marginBottom: "1rem" }}>
        <i className={`fa-solid ${submitMsg.includes("exitosa") ? "fa-check-circle" : "fa-circle-exclamation"}`} style={{ marginRight: "0.5rem" }} />
        {submitMsg}
       </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
       <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div className="sb-ui-input-container" style={{ flex: 1, minWidth: "200px" }}>
         <label className="sb-ui-input-label" htmlFor="devex-team">Equipo</label>
         <select id="devex-team" className="sb-ui-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
         </select>
        </div>
        <div className="sb-ui-input-container" style={{ flex: 1, minWidth: "200px" }}>
         <label className="sb-ui-input-label" htmlFor="devex-respondent">Alias (opcional)</label>
         <input id="devex-respondent" className="sb-ui-input" value={respondent} onChange={(e) => setRespondent(e.target.value)} placeholder="Tu alias" />
        </div>
       </div>

       {QUESTIONS.map((q) => (
        <div key={q.key} style={{ borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
         <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>{q.label}</p>
         <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((val) => (
           <label key={val} className="sb-ui-radio" style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
            <input
             type="radio"
             name={q.key}
             value={val}
             checked={answers[q.key] === val}
             onChange={() => setAnswers((prev) => ({ ...prev, [q.key]: val }))}
            />
            <span className="sb-ui-radio__circle" />
            <span style={{ fontSize: "0.8rem" }}>{val}</span>
           </label>
          ))}
         </div>
        </div>
       ))}

       <button
        type="submit"
        className={`sb-ui-button sb-ui-button--primary sb-ui-button--fill${submitting ? " sb-ui-button--disabled" : ""}`}
        disabled={submitting}
       >
        {submitting ? "Enviando..." : "Enviar Respuesta"}
       </button>
      </form>
     </div>
    </article>
   )}

   {view === "results" && (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
     <div className="sb-ui-input-container" style={{ maxWidth: "300px" }}>
      <label className="sb-ui-input-label" htmlFor="results-team">Filtrar por equipo</label>
      <select id="results-team" className="sb-ui-select" value={resultsTeam} onChange={(e) => setResultsTeam(e.target.value)}>
       {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
     </div>

     {loadingResults && (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
       <div className="sb-ui-spinner sb-ui-spinner--primary" />
      </div>
     )}

     {!loadingResults && results && (
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ padding: "0" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         <h3 style={{ fontSize: "0.875rem", fontWeight: 600 }}>Resultados — {results.total_responses} respuestas</h3>
         <span className={`sb-ui-badge sb-ui-badge--${results.overall_score >= 4 ? "success" : results.overall_score >= 3 ? "warning" : "error"}`}>
          Score: {results.overall_score.toFixed(2)}
         </span>
        </div>
        <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
         <thead>
          <tr>
           <th>Pregunta</th>
           <th>Promedio</th>
           <th>Indicador</th>
          </tr>
         </thead>
         <tbody>
          {QUESTIONS.map((q) => {
           const avg = results[`avg_${q.key}` as keyof ApiDevExResults] as number;
           return (
            <tr key={q.key}>
             <td style={{ fontSize: "0.85rem" }}>{q.label}</td>
             <td><strong>{avg?.toFixed(2) ?? "—"}</strong></td>
             <td>
              <div style={{ width: "100%", maxWidth: "120px", height: "8px", borderRadius: "4px", backgroundColor: "#eee", overflow: "hidden" }}>
               <div style={{ width: `${((avg ?? 0) / 5) * 100}%`, height: "100%", backgroundColor: avg >= 4 ? "#009056" : avg >= 3 ? "#FFC107" : "#E53935", borderRadius: "4px" }} />
              </div>
             </td>
            </tr>
           );
          })}
         </tbody>
        </table>
       </div>
      </article>
     )}
    </div>
   )}
  </div>
 );
}
