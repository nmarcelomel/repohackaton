import { Chip } from "../../shared/Chip";
import { useState, useEffect, type FormEvent } from "react";
import { fetchTeams, submitDevEx, fetchDevExResults, type ApiTeam, type ApiDevExResults } from "../../data/api-client";
import "../../shared/ChartSetup";
import { Bar } from "react-chartjs-2";

const QUESTIONS = [
 { key: "facilidad_deploy", label: "¿Qué tan fácil es hacer deploy de tu código?", emoji: "🚀", description: "Desde commit hasta producción, ¿el proceso es fluido?" },
 { key: "feedback_pr", label: "¿Qué tan rápido recibes feedback en tus PRs?", emoji: "💬", description: "¿El ciclo de revisión de código es ágil?" },
 { key: "interrupciones", label: "¿Tu nivel de interrupciones diarias es bajo?", emoji: "🧘", description: "1=Muchas interrupciones, 5=Puedo concentrarme sin problemas" },
 { key: "claridad_reqs", label: "¿Los requerimientos son claros y bien definidos?", emoji: "📋", description: "¿Sabes exactamente qué construir antes de empezar?" },
 { key: "satisfaccion_herramientas", label: "¿Estás satisfecho con las herramientas de desarrollo?", emoji: "🛠️", description: "IDE, CI/CD, monitoreo, documentación..." },
];

const SCALE_LABELS = ["Muy mal", "Mal", "Regular", "Bien", "Excelente"];
const SCALE_COLORS = ["#E53935", "#FF5722", "#FFC107", "#8BC34A", "#00A651"];

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
   if (t.length) { setSelectedTeam(t[0].id); setResultsTeam(t[0].id); }
  });
 }, []);

 useEffect(() => {
  if (view === "results" && resultsTeam) {
   setLoadingResults(true);
   fetchDevExResults(resultsTeam).then(setResults).finally(() => setLoadingResults(false));
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
    user_id: respondent || "anonymous-" + Date.now(),
    team_id: selectedTeam,
    period: new Date().toISOString().slice(0, 7),
    facilidad_deploy: answers["facilidad_deploy"] ?? 3,
    feedback_pr: answers["feedback_pr"] ?? 3,
    interrupciones: answers["interrupciones"] ?? 3,
    claridad_reqs: answers["claridad_reqs"] ?? 3,
    satisfaccion_herramientas: answers["satisfaccion_herramientas"] ?? 3,
   });
   setSubmitMsg("¡Gracias! Tu respuesta fue registrada. Es anónima y ayuda a mejorar el entorno de trabajo.");
   setAnswers({});
   setRespondent("");
  } catch (err) {
   setSubmitMsg(err instanceof Error ? err.message : typeof err === "string" ? err : "Error al enviar la respuesta. Verifica que no hayas respondido este periodo.");
  } finally {
   setSubmitting(false);
  }
 }

 const answeredCount = Object.keys(answers).length;
 const progressPct = (answeredCount / QUESTIONS.length) * 100;

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   {/* Header */}
   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
     <h1 className="sb-ui-heading-h4">Experiencia del Desarrollador</h1>
     <p style={{ fontSize: "0.8rem", color: "#666", margin: "0.25rem 0 0" }}>Medimos el sistema, no a las personas — tus respuestas son anónimas</p>
    </div>
    <div style={{ display: "flex", gap: "0.5rem" }}>
     <button className={`sb-ui-button sb-ui-button--${view === "form" ? "primary" : "secondary"} sb-ui-button--${view === "form" ? "fill" : "stroke"} sb-ui-button--small sb-ui-button--icon-left`} onClick={() => setView("form")}>
      <i className="fa-solid fa-pen-to-square" /> Responder
     </button>
     <button className={`sb-ui-button sb-ui-button--${view === "results" ? "primary" : "secondary"} sb-ui-button--${view === "results" ? "fill" : "stroke"} sb-ui-button--small sb-ui-button--icon-left`} onClick={() => setView("results")}>
      <i className="fa-solid fa-chart-bar" /> Resultados
     </button>
    </div>
   </div>

   {/* FORM VIEW */}
   {view === "form" && (
    <div>
     {/* Progress */}
     <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#666", marginBottom: "4px" }}>
       <span>{answeredCount} de {QUESTIONS.length} respondidas</span>
       <span>{Math.round(progressPct)}%</span>
      </div>
      <div style={{ width: "100%", height: "6px", borderRadius: "3px", backgroundColor: "#E0E0E0" }}>
       <div style={{ width: `${progressPct}%`, height: "100%", borderRadius: "3px", backgroundColor: "#00A651", transition: "width 0.3s" }} />
      </div>
     </div>

     {submitMsg && (
      <div className={`sb-ui-alert sb-ui-alert--${submitMsg.includes("Gracias") ? "success" : "error"}`} style={{ marginBottom: "1rem" }}>
       <i className={`fa-solid ${submitMsg.includes("Gracias") ? "fa-heart" : "fa-circle-exclamation"}`} />
       <span>{submitMsg}</span>
      </div>
     )}

     <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Team selector */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
       <div className="sb-ui-input-container" style={{ flex: 1, minWidth: "200px" }}>
        <label className="sb-ui-input-label">Tu célula</label>
        <select className="sb-ui-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
         {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
       </div>
       <div className="sb-ui-input-container" style={{ flex: 1, minWidth: "200px" }}>
        <label className="sb-ui-input-label">Alias (opcional, es anónimo)</label>
        <input className="sb-ui-input" value={respondent} onChange={(e) => setRespondent(e.target.value)} placeholder="Ej: dev-ninja" />
       </div>
      </div>

      {/* Questions */}
      {QUESTIONS.map((q) => (
       <article key={q.key} className="sb-ui-card sb-ui-card--elevated" style={{ overflow: "hidden" }}>
        <div className="sb-ui-card__content" style={{ padding: "1.25rem" }}>
         <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.5rem" }}>{q.emoji}</span>
          <div>
           <p style={{ fontSize: "0.9rem", fontWeight: 600, margin: 0, color: "#333" }}>{q.label}</p>
           <p style={{ fontSize: "0.75rem", color: "#9E9E9E", margin: "0.25rem 0 0" }}>{q.description}</p>
          </div>
         </div>
         <div style={{ display: "flex", gap: "0.5rem" }}>
          {[1, 2, 3, 4, 5].map((val) => {
           const isSelected = answers[q.key] === val;
           return (
            <button
             key={val}
             type="button"
             onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: val }))}
             style={{
              flex: 1,
              padding: "0.75rem 0.25rem",
              borderRadius: "8px",
              border: isSelected ? `2px solid ${SCALE_COLORS[val - 1]}` : "1px solid #E0E0E0",
              backgroundColor: isSelected ? `${SCALE_COLORS[val - 1]}15` : "#fff",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
             }}
            >
             <p style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700, color: SCALE_COLORS[val - 1] }}>{val}</p>
             <p style={{ fontSize: "0.6rem", margin: "2px 0 0", color: isSelected ? SCALE_COLORS[val - 1] : "#9E9E9E" }}>{SCALE_LABELS[val - 1]}</p>
            </button>
           );
          })}
         </div>
        </div>
       </article>
      ))}

      <button
       type="submit"
       className={`sb-ui-button sb-ui-button--primary sb-ui-button--fill${submitting || answeredCount < QUESTIONS.length ? " sb-ui-button--disabled" : ""}`}
       disabled={submitting || answeredCount < QUESTIONS.length}
       style={{ alignSelf: "center", minWidth: "250px" }}
      >
       <i className="fa-solid fa-paper-plane" style={{ marginRight: "8px" }} />
       {submitting ? "Enviando..." : "Enviar Respuesta"}
      </button>
     </form>
    </div>
   )}

   {/* RESULTS VIEW */}
   {view === "results" && (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
     <div className="sb-ui-input-container" style={{ maxWidth: "300px" }}>
      <label className="sb-ui-input-label">Filtrar por célula</label>
      <select className="sb-ui-select" value={resultsTeam} onChange={(e) => setResultsTeam(e.target.value)}>
       {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
     </div>

     {loadingResults && (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
       <div className="sb-ui-spinner sb-ui-spinner--primary sb-ui-spinner--large" />
      </div>
     )}

     {!loadingResults && results && (
      <>
       {/* Score Card */}
       <div className="sb-ui-grid">
        <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
         <article className="sb-ui-card sb-ui-card--elevated">
          <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1.5rem" }}>
           <p style={{ fontSize: "0.75rem", color: "#9E9E9E", margin: 0 }}>Puntaje General</p>
           <p style={{ fontSize: "3rem", fontWeight: 800, color: results.overall_score >= 4 ? "#00A651" : results.overall_score >= 3 ? "#FFC107" : "#E53935", margin: "0.25rem 0" }}>
            {results.overall_score.toFixed(1)}
           </p>
           <p style={{ fontSize: "0.75rem", color: "#666", margin: 0 }}>de 5.0</p>
           <Chip variant={results.overall_score >= 4 ? "success" : results.overall_score >= 3 ? "warning" : "error"}>
            {results.overall_score >= 4 ? "Saludable" : results.overall_score >= 3 ? "Atención" : "Crítico"}
           </Chip>
          </div>
         </article>
        </div>
        <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
         <article className="sb-ui-card sb-ui-card--elevated">
          <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1.5rem" }}>
           <p style={{ fontSize: "0.75rem", color: "#9E9E9E", margin: 0 }}>Respuestas</p>
           <p style={{ fontSize: "3rem", fontWeight: 800, color: "#333", margin: "0.25rem 0" }}>{results.total_responses}</p>
           <p style={{ fontSize: "0.75rem", color: "#666", margin: 0 }}>desarrolladores</p>
          </div>
         </article>
        </div>
        <div className="sb-ui-col-12 sb-ui-col-md-4" style={{ marginBottom: "1rem" }}>
         <article className="sb-ui-card sb-ui-card--elevated">
          <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1.5rem" }}>
           <p style={{ fontSize: "0.75rem", color: "#9E9E9E", margin: 0 }}>Área a Mejorar</p>
           <p style={{ fontSize: "1.5rem", margin: "0.5rem 0" }}>
            {(() => {
             const scores = QUESTIONS.map(q => ({ q, score: (results[`avg_${q.key}` as keyof ApiDevExResults] as number) || 0 }));
             const worst = scores.sort((a, b) => a.score - b.score)[0];
             return <span>{worst?.q.emoji} {worst?.q.label.split("?")[0].slice(-20)}...</span>;
            })()}
           </p>
          </div>
         </article>
        </div>
       </div>

       {/* Chart */}
       <article className="sb-ui-card sb-ui-card--elevated">
        <div className="sb-ui-card__content">
         <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Resultados por Dimensión</h3>
         <div style={{ height: "250px" }}>
          <Bar
           data={{
            labels: QUESTIONS.map(q => `${q.emoji} ${q.label.slice(0, 25)}...`),
            datasets: [{
             label: "Promedio (1-5)",
             data: QUESTIONS.map(q => (results[`avg_${q.key}` as keyof ApiDevExResults] as number) || 0),
             backgroundColor: QUESTIONS.map(q => {
              const val = (results[`avg_${q.key}` as keyof ApiDevExResults] as number) || 0;
              return val >= 4 ? "#00A651" : val >= 3 ? "#FFC107" : "#E53935";
             }),
             borderRadius: 6,
            }],
           }}
           options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } }}
          />
         </div>
        </div>
       </article>

       {/* Detail Table */}
       <article className="sb-ui-card sb-ui-card--elevated">
        <div className="sb-ui-card__content">
         <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Detalle por Pregunta</h3>
         <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
          <thead><tr><th>Dimensión</th><th>Promedio</th><th>Estado</th><th>Indicador</th></tr></thead>
          <tbody>
           {QUESTIONS.map((q) => {
            const avg = (results[`avg_${q.key}` as keyof ApiDevExResults] as number) || 0;
            return (
             <tr key={q.key}>
              <td style={{ fontSize: "0.85rem" }}>{q.emoji} {q.label}</td>
              <td><strong style={{ color: avg >= 4 ? "#00A651" : avg >= 3 ? "#FFC107" : "#E53935" }}>{avg.toFixed(2)}</strong></td>
              <td><Chip variant={avg >= 4 ? "success" : avg >= 3 ? "warning" : "error"}>{avg >= 4 ? "Bien" : avg >= 3 ? "Regular" : "Crítico"}</Chip></td>
              <td>
               <div style={{ width: "100%", maxWidth: "120px", height: "10px", borderRadius: "5px", backgroundColor: "#eee", overflow: "hidden" }}>
                <div style={{ width: `${(avg / 5) * 100}%`, height: "100%", backgroundColor: avg >= 4 ? "#00A651" : avg >= 3 ? "#FFC107" : "#E53935", borderRadius: "5px" }} />
               </div>
              </td>
             </tr>
            );
           })}
          </tbody>
         </table>
        </div>
       </article>
      </>
     )}
    </div>
   )}
  </div>
 );
}
