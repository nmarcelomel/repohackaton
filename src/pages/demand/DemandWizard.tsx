import { useState } from "react";
import type { ApiTeam } from "../../data/api-client";

interface DemandFormData {
 team_id: string;
 title: string;
 requester: string;
 business_value: number;
 urgency: number;
 size: number;
 description: string;
 category: string;
 expected_users: string;
 revenue_impact: string;
 regulatory: boolean;
 dependencies_count: number;
 priority_justification: string;
}

interface DemandWizardProps {
 teams: ApiTeam[];
 filterTeam: string;
 onSubmit: (data: { team_id: string; title: string; requester: string; business_value: number; urgency: number; size: number }) => Promise<void>;
 onCancel: () => void;
 creating: boolean;
 requestNumber: number;
}

export function DemandWizard({ teams, filterTeam, onSubmit, onCancel, creating, requestNumber }: DemandWizardProps) {
 const [step, setStep] = useState(1);
 const [form, setForm] = useState<DemandFormData>({
  team_id: filterTeam,
  title: "",
  requester: "",
  business_value: 5,
  urgency: 5,
  size: 3,
  description: "",
  category: "feature",
  expected_users: "interno",
  revenue_impact: "medio",
  regulatory: false,
  dependencies_count: 0,
  priority_justification: "",
 });

 const totalSteps = 4;
 const wsjf = form.size > 0 ? ((form.business_value + form.urgency) / form.size).toFixed(2) : "—";

 function canAdvance(): boolean {
  if (step === 1) return form.title.trim().length > 2 && form.requester.trim().length > 1;
  if (step === 2) return form.description.trim().length > 5;
  if (step === 3) return true;
  return true;
 }

 async function handleSubmit() {
  await onSubmit({
   team_id: form.team_id,
   title: form.title,
   requester: form.requester,
   business_value: form.business_value,
   urgency: form.urgency,
   size: form.size,
  });
 }

 return (
  <article className="sb-ui-card sb-ui-card--elevated">
   <div className="sb-ui-card__content">
    {/* Header with request number */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
     <div>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Nueva Solicitud de Demanda</h3>
      <p style={{ fontSize: "0.75rem", color: "#9E9E9E", margin: "0.25rem 0 0" }}>Paso {step} de {totalSteps}</p>
     </div>
     <span className="sb-ui-badge sb-ui-badge--primary" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
      <i className="fa-solid fa-hashtag" style={{ marginRight: "4px" }} />
      SOL-{String(requestNumber).padStart(4, "0")}
     </span>
    </div>

    {/* Stepper */}
    <div style={{ display: "flex", gap: "4px", marginBottom: "1.5rem" }}>
     {[1, 2, 3, 4].map((s) => (
      <div key={s} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: s <= step ? "#00A651" : "#E0E0E0", transition: "background-color 0.3s" }} />
     ))}
    </div>

    {/* Step 1: Información Básica */}
    {step === 1 && (
     <div>
      <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#333", marginBottom: "1rem" }}>
       <i className="fa-solid fa-file-lines" style={{ marginRight: "8px", color: "#00A651" }} />
       Información Básica
      </h4>
      <div className="sb-ui-grid">
       <div className="sb-ui-col-12 sb-ui-col-md-6">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label sb-ui-input-label--required">Título de la Solicitud</label>
         <input className="sb-ui-input" placeholder="Ej: Portal de pagos con QR para clientes" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
         <span className="sb-ui-input-helper">Nombre descriptivo y conciso de la funcionalidad</span>
        </div>
       </div>
       <div className="sb-ui-col-12 sb-ui-col-md-6">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label sb-ui-input-label--required">Solicitante</label>
         <input className="sb-ui-input" placeholder="Ej: VP Comercial / Gerencia Digital" value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })} />
         <span className="sb-ui-input-helper">Área o persona que solicita</span>
        </div>
       </div>
       <div className="sb-ui-col-12 sb-ui-col-md-6">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label">Célula Asignada</label>
         <select className="sb-ui-select" value={form.team_id} onChange={(e) => setForm({ ...form, team_id: e.target.value })}>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
         </select>
        </div>
       </div>
       <div className="sb-ui-col-12 sb-ui-col-md-6">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label">Categoría</label>
         <select className="sb-ui-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="feature">Nueva Funcionalidad</option>
          <option value="improvement">Mejora Existente</option>
          <option value="integration">Integración</option>
          <option value="migration">Migración</option>
          <option value="regulatory">Regulatorio/Compliance</option>
         </select>
        </div>
       </div>
      </div>
     </div>
    )}

    {/* Step 2: Contexto y Alcance */}
    {step === 2 && (
     <div>
      <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#333", marginBottom: "1rem" }}>
       <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: "8px", color: "#00A651" }} />
       Contexto y Alcance
      </h4>
      <div className="sb-ui-grid">
       <div className="sb-ui-col-12">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label sb-ui-input-label--required">Descripción del Problema/Oportunidad</label>
         <textarea className="sb-ui-input" style={{ minHeight: "100px", resize: "vertical" }} placeholder="¿Qué problema resuelve? ¿Qué oportunidad captura?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
         <span className="sb-ui-input-helper">Describe el problema de negocio que esta solicitud resuelve</span>
        </div>
       </div>
       <div className="sb-ui-col-12 sb-ui-col-md-6">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label">Usuarios Impactados</label>
         <select className="sb-ui-select" value={form.expected_users} onChange={(e) => setForm({ ...form, expected_users: e.target.value })}>
          <option value="interno">Solo internos (&lt; 50 usuarios)</option>
          <option value="equipo">Equipo/Área (50-500 usuarios)</option>
          <option value="organizacion">Toda la organización (500+)</option>
          <option value="clientes">Clientes externos (miles)</option>
          <option value="masivo">Masivo (100k+ usuarios)</option>
         </select>
        </div>
       </div>
       <div className="sb-ui-col-12 sb-ui-col-md-6">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label">Impacto en Ingresos</label>
         <select className="sb-ui-select" value={form.revenue_impact} onChange={(e) => setForm({ ...form, revenue_impact: e.target.value })}>
          <option value="ninguno">Sin impacto directo</option>
          <option value="bajo">Bajo (ahorro operativo)</option>
          <option value="medio">Medio (eficiencia + retención)</option>
          <option value="alto">Alto (nuevo canal de ingreso)</option>
          <option value="critico">Crítico (pérdida si no se hace)</option>
         </select>
        </div>
       </div>
       <div className="sb-ui-col-12 sb-ui-col-md-6">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label">Dependencias Externas</label>
         <input type="number" className="sb-ui-input" min={0} max={10} value={form.dependencies_count} onChange={(e) => setForm({ ...form, dependencies_count: +e.target.value })} />
         <span className="sb-ui-input-helper">¿Cuántos equipos/sistemas externos necesita?</span>
        </div>
       </div>
       <div className="sb-ui-col-12 sb-ui-col-md-6" style={{ display: "flex", alignItems: "center", paddingTop: "1.5rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
         <input type="checkbox" checked={form.regulatory} onChange={(e) => setForm({ ...form, regulatory: e.target.checked })} style={{ width: "18px", height: "18px" }} />
         <span style={{ fontSize: "0.875rem" }}>¿Tiene componente regulatorio/compliance?</span>
        </label>
       </div>
      </div>
     </div>
    )}

    {/* Step 3: Valoración WSJF */}
    {step === 3 && (
     <div>
      <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#333", marginBottom: "1rem" }}>
       <i className="fa-solid fa-scale-balanced" style={{ marginRight: "8px", color: "#00A651" }} />
       Valoración WSJF (Weighted Shortest Job First)
      </h4>

      <div className="sb-ui-alert sb-ui-alert--info" style={{ marginBottom: "1rem" }}>
       <i className="fa-solid fa-lightbulb" />
       <span>El WSJF prioriza trabajo de alto valor y pequeño tamaño. Score = (Valor + Urgencia) / Tamaño. Mayor score = mayor prioridad.</span>
      </div>

      <div className="sb-ui-grid">
       <div className="sb-ui-col-12 sb-ui-col-md-4">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label">Valor de Negocio (1-10)</label>
         <input type="range" min={1} max={10} value={form.business_value} onChange={(e) => setForm({ ...form, business_value: +e.target.value })} style={{ width: "100%" }} />
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="sb-ui-input-helper">Impacto esperado</span>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#00A651" }}>{form.business_value}</span>
         </div>
        </div>
       </div>
       <div className="sb-ui-col-12 sb-ui-col-md-4">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label">Urgencia / Costo de Retraso (1-10)</label>
         <input type="range" min={1} max={10} value={form.urgency} onChange={(e) => setForm({ ...form, urgency: +e.target.value })} style={{ width: "100%" }} />
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="sb-ui-input-helper">¿Qué pasa si se retrasa?</span>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: form.urgency >= 8 ? "#E53935" : "#FFC107" }}>{form.urgency}</span>
         </div>
        </div>
       </div>
       <div className="sb-ui-col-12 sb-ui-col-md-4">
        <div className="sb-ui-input-container">
         <label className="sb-ui-input-label">Tamaño / Esfuerzo (1-10)</label>
         <input type="range" min={1} max={10} value={form.size} onChange={(e) => setForm({ ...form, size: +e.target.value })} style={{ width: "100%" }} />
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="sb-ui-input-helper">Complejidad estimada</span>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#333" }}>{form.size}</span>
         </div>
        </div>
       </div>
      </div>

      {/* WSJF Score visual */}
      <div style={{ margin: "1.5rem 0", padding: "1.5rem", background: "linear-gradient(135deg, #f0fdf4, #ecfeff)", borderRadius: "12px", textAlign: "center", border: "1px solid #E0E0E0" }}>
       <p style={{ fontSize: "0.75rem", color: "#666", margin: 0 }}>WSJF Score = (Valor + Urgencia) / Tamaño = ({form.business_value} + {form.urgency}) / {form.size}</p>
       <p style={{ fontSize: "3rem", fontWeight: 800, color: "#00A651", margin: "0.5rem 0 0" }}>{wsjf}</p>
       <p style={{ fontSize: "0.75rem", color: "#666", margin: "0.25rem 0 0" }}>
        {Number(wsjf) >= 7 ? "🚀 Prioridad Máxima" : Number(wsjf) >= 4 ? "⚡ Prioridad Alta" : Number(wsjf) >= 2 ? "📋 Prioridad Media" : "📌 Prioridad Baja"}
       </p>
      </div>

      <div className="sb-ui-col-12">
       <div className="sb-ui-input-container">
        <label className="sb-ui-input-label">Justificación de Prioridad (opcional)</label>
        <textarea className="sb-ui-input" style={{ minHeight: "60px", resize: "vertical" }} placeholder="¿Por qué esta solicitud debe priorizarse?" value={form.priority_justification} onChange={(e) => setForm({ ...form, priority_justification: e.target.value })} />
       </div>
      </div>
     </div>
    )}

    {/* Step 4: Resumen y Confirmación */}
    {step === 4 && (
     <div>
      <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#333", marginBottom: "1rem" }}>
       <i className="fa-solid fa-clipboard-check" style={{ marginRight: "8px", color: "#00A651" }} />
       Resumen de la Solicitud
      </h4>

      <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "1.25rem", border: "1px solid #E0E0E0" }}>
       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div><span style={{ fontSize: "0.7rem", color: "#9E9E9E", textTransform: "uppercase" }}>Número</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>SOL-{String(requestNumber).padStart(4, "0")}</p></div>
        <div><span style={{ fontSize: "0.7rem", color: "#9E9E9E", textTransform: "uppercase" }}>Célula</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{teams.find(t => t.id === form.team_id)?.name}</p></div>
        <div><span style={{ fontSize: "0.7rem", color: "#9E9E9E", textTransform: "uppercase" }}>Título</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{form.title}</p></div>
        <div><span style={{ fontSize: "0.7rem", color: "#9E9E9E", textTransform: "uppercase" }}>Solicitante</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{form.requester}</p></div>
        <div><span style={{ fontSize: "0.7rem", color: "#9E9E9E", textTransform: "uppercase" }}>Categoría</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{form.category}</p></div>
        <div><span style={{ fontSize: "0.7rem", color: "#9E9E9E", textTransform: "uppercase" }}>Usuarios</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{form.expected_users}</p></div>
        <div><span style={{ fontSize: "0.7rem", color: "#9E9E9E", textTransform: "uppercase" }}>Impacto Ingresos</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{form.revenue_impact}</p></div>
        <div><span style={{ fontSize: "0.7rem", color: "#9E9E9E", textTransform: "uppercase" }}>Regulatorio</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{form.regulatory ? "Sí" : "No"}</p></div>
       </div>
       {form.description && (
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #E0E0E0" }}>
         <span style={{ fontSize: "0.7rem", color: "#9E9E9E", textTransform: "uppercase" }}>Descripción</span>
         <p style={{ margin: "2px 0 0", fontSize: "0.875rem" }}>{form.description}</p>
        </div>
       )}
      </div>

      {/* Final WSJF */}
      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "2rem", padding: "1rem", backgroundColor: "#f0fdf4", borderRadius: "8px" }}>
       <div style={{ textAlign: "center" }}><span style={{ fontSize: "0.7rem", color: "#666" }}>Valor</span><p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#00A651", margin: 0 }}>{form.business_value}</p></div>
       <div style={{ textAlign: "center" }}><span style={{ fontSize: "0.7rem", color: "#666" }}>Urgencia</span><p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#FFC107", margin: 0 }}>{form.urgency}</p></div>
       <div style={{ textAlign: "center" }}><span style={{ fontSize: "0.7rem", color: "#666" }}>Tamaño</span><p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#333", margin: 0 }}>{form.size}</p></div>
       <div style={{ textAlign: "center" }}><span style={{ fontSize: "0.7rem", color: "#666" }}>WSJF</span><p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#00A651", margin: 0 }}>{wsjf}</p></div>
      </div>
     </div>
    )}

    {/* Navigation Buttons */}
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #E0E0E0" }}>
     <button className="sb-ui-button sb-ui-button--secondary sb-ui-button--stroke" onClick={step === 1 ? onCancel : () => setStep(step - 1)}>
      <i className={`fa-solid ${step === 1 ? "fa-xmark" : "fa-arrow-left"}`} style={{ marginRight: "6px" }} />
      {step === 1 ? "Cancelar" : "Anterior"}
     </button>

     {step < totalSteps ? (
      <button className={`sb-ui-button sb-ui-button--primary sb-ui-button--fill ${!canAdvance() ? "sb-ui-button--disabled" : ""}`} disabled={!canAdvance()} onClick={() => setStep(step + 1)}>
       Siguiente
       <i className="fa-solid fa-arrow-right" style={{ marginLeft: "6px" }} />
      </button>
     ) : (
      <button className={`sb-ui-button sb-ui-button--primary sb-ui-button--fill ${creating ? "sb-ui-button--disabled" : ""}`} disabled={creating} onClick={handleSubmit}>
       <i className="fa-solid fa-paper-plane" style={{ marginRight: "6px" }} />
       {creating ? "Creando..." : "Crear Solicitud"}
      </button>
     )}
    </div>
   </div>
  </article>
 );
}
