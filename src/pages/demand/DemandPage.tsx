import { useState, useEffect, useMemo } from "react";
import { fetchDemands, fetchTeams, createDemand, deleteDemand, type ApiDemand, type ApiTeam } from "../../data/api-client";
import { Pagination } from "../../shared/Pagination";
import { ConfirmDialog } from "../../shared/ConfirmDialog";
import { DemandWizard } from "./DemandWizard";
import { Chip } from "../../shared/Chip";

type SortField = "wsjf_score" | "title" | "status";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 8;

export function DemandPage() {
 const [teams, setTeams] = useState<ApiTeam[]>([]);
 const [demands, setDemands] = useState<ApiDemand[]>([]);
 const [filterTeam, setFilterTeam] = useState("");
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [creating, setCreating] = useState(false);
 const [successMsg, setSuccessMsg] = useState("");
 const [sortField, setSortField] = useState<SortField>("wsjf_score");
 const [sortDir, setSortDir] = useState<SortDir>("desc");
 const [currentPage, setCurrentPage] = useState(1);
 const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

 useEffect(() => {
  fetchTeams().then((t) => { setTeams(t); if (t.length) setFilterTeam(t[0].id); });
 }, []);

 useEffect(() => {
  if (!filterTeam) return;
  setLoading(true);
  setCurrentPage(1);
  fetchDemands(filterTeam).then(setDemands).finally(() => setLoading(false));
 }, [filterTeam]);

 const sortedDemands = useMemo(() => {
  const copy = [...demands];
  copy.sort((a, b) => {
   let cmp = 0;
   if (sortField === "wsjf_score") cmp = a.wsjf_score - b.wsjf_score;
   else if (sortField === "title") cmp = a.title.localeCompare(b.title);
   else if (sortField === "status") cmp = a.status.localeCompare(b.status);
   return sortDir === "asc" ? cmp : -cmp;
  });
  return copy;
 }, [demands, sortField, sortDir]);

 const totalPages = Math.max(1, Math.ceil(sortedDemands.length / PAGE_SIZE));
 const paginatedDemands = sortedDemands.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

 function handleSort(field: SortField) {
  if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
  else { setSortField(field); setSortDir("desc"); }
  setCurrentPage(1);
 }
 function sortIcon(field: SortField) {
  if (sortField !== field) return "fa-solid fa-sort";
  return sortDir === "asc" ? "fa-solid fa-sort-up" : "fa-solid fa-sort-down";
 }

 async function handleCreate(data: { team_id: string; title: string; requester: string; business_value: number; urgency: number; size: number }) {
  setCreating(true);
  try {
   await createDemand(data);
   setShowForm(false);
   setSuccessMsg("✅ Solicitud creada exitosamente");
   setTimeout(() => setSuccessMsg(""), 4000);
   const updated = await fetchDemands(filterTeam);
   setDemands(updated);
  } finally { setCreating(false); }
 }

 async function confirmDelete() {
  if (deleteTarget === null) return;
  await deleteDemand(deleteTarget);
  setDemands(prev => prev.filter(d => d.id !== deleteTarget));
  setDeleteTarget(null);
 }

 // KPIs
 const totalDemands = demands.length;
 const pendingCount = demands.filter(d => d.status === "backlog" || d.status === "prioritized").length;
 const inProgressCount = demands.filter(d => d.status === "in_progress").length;
 const avgWsjf = demands.length > 0 ? (demands.reduce((s, d) => s + d.wsjf_score, 0) / demands.length).toFixed(1) : "0";

 return (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
   {/* Header */}
   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
    <div>
     <h1 className="sb-ui-heading-h4">Gestión de Demanda</h1>
     <p style={{ fontSize: "0.8rem", color: "#666", margin: "0.25rem 0 0" }}>Priorización por WSJF — Mayor valor, menor esfuerzo primero</p>
    </div>
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
     <div className="sb-ui-input-container">
      <label className="sb-ui-input-label" htmlFor="filter-team">Célula</label>
      <select id="filter-team" className="sb-ui-select" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
       {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
     </div>
     <button className="sb-ui-button sb-ui-button--primary sb-ui-button--fill sb-ui-button--icon-left" onClick={() => setShowForm(!showForm)}>
      <i className="fa-solid fa-plus" /> Nueva Solicitud
     </button>
    </div>
   </div>

   {successMsg && (
    <div className="sb-ui-alert sb-ui-alert--success"><i className="fa-solid fa-circle-check" /><span>{successMsg}</span></div>
   )}

   {/* KPI Cards */}
   {!loading && (
    <div className="sb-ui-grid">
     <div className="sb-ui-col-12 sb-ui-col-md-3" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1rem" }}>
        <i className="fa-solid fa-layer-group" style={{ fontSize: "1.25rem", color: "#2196F3", marginBottom: "0.5rem" }} />
        <p style={{ fontSize: "2rem", fontWeight: 800, color: "#333", margin: "0.25rem 0" }}>{totalDemands}</p>
        <p style={{ fontSize: "0.7rem", color: "#9E9E9E", margin: 0 }}>Total Solicitudes</p>
       </div>
      </article>
     </div>
     <div className="sb-ui-col-12 sb-ui-col-md-3" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1rem" }}>
        <i className="fa-solid fa-hourglass-half" style={{ fontSize: "1.25rem", color: "#FF9800", marginBottom: "0.5rem" }} />
        <p style={{ fontSize: "2rem", fontWeight: 800, color: "#FF9800", margin: "0.25rem 0" }}>{pendingCount}</p>
        <p style={{ fontSize: "0.7rem", color: "#9E9E9E", margin: 0 }}>Pendientes</p>
       </div>
      </article>
     </div>
     <div className="sb-ui-col-12 sb-ui-col-md-3" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1rem" }}>
        <i className="fa-solid fa-spinner" style={{ fontSize: "1.25rem", color: "#00A651", marginBottom: "0.5rem" }} />
        <p style={{ fontSize: "2rem", fontWeight: 800, color: "#00A651", margin: "0.25rem 0" }}>{inProgressCount}</p>
        <p style={{ fontSize: "0.7rem", color: "#9E9E9E", margin: 0 }}>En Progreso</p>
       </div>
      </article>
     </div>
     <div className="sb-ui-col-12 sb-ui-col-md-3" style={{ marginBottom: "1rem" }}>
      <article className="sb-ui-card sb-ui-card--elevated">
       <div className="sb-ui-card__content" style={{ textAlign: "center", padding: "1rem" }}>
        <i className="fa-solid fa-scale-balanced" style={{ fontSize: "1.25rem", color: "#9C27B0", marginBottom: "0.5rem" }} />
        <p style={{ fontSize: "2rem", fontWeight: 800, color: "#9C27B0", margin: "0.25rem 0" }}>{avgWsjf}</p>
        <p style={{ fontSize: "0.7rem", color: "#9E9E9E", margin: 0 }}>WSJF Promedio</p>
       </div>
      </article>
     </div>
    </div>
   )}

   {/* Wizard */}
   {showForm && (
    <DemandWizard teams={teams} filterTeam={filterTeam} onSubmit={handleCreate} onCancel={() => setShowForm(false)} creating={creating} requestNumber={demands.length + 23} />
   )}

   {/* Table */}
   {loading ? (
    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><div className="sb-ui-spinner sb-ui-spinner--primary sb-ui-spinner--large" /></div>
   ) : (
    <article className="sb-ui-card sb-ui-card--elevated">
     <div className="sb-ui-card__content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
       <h3 style={{ fontSize: "0.875rem", fontWeight: 600 }}>Ranking por WSJF</h3>
       <Chip variant="info">{demands.length} solicitudes</Chip>
      </div>
      {demands.length === 0 ? (
       <div className="sb-ui-alert sb-ui-alert--info"><i className="fa-solid fa-info-circle" /><span>No hay solicitudes para esta célula. Crea una nueva.</span></div>
      ) : (
       <>
        <div style={{ overflowX: "auto" }}>
         <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover sb-ui-table--bordered" style={{ width: "100%", fontSize: "0.95rem" }}>
          <thead><tr>
           <th style={{ width: "50px", padding: "0.875rem 0.75rem" }}>#</th>
           <th style={{ cursor: "pointer", padding: "0.875rem 0.75rem" }} onClick={() => handleSort("title")}>Título <i className={sortIcon("title")} style={{ marginLeft: "4px", fontSize: "0.65rem" }} /></th>
           <th style={{ width: "180px", padding: "0.875rem 0.75rem" }}>Solicitante</th>
           <th style={{ cursor: "pointer", width: "100px", padding: "0.875rem 0.75rem" }} onClick={() => handleSort("wsjf_score")}>WSJF <i className={sortIcon("wsjf_score")} style={{ marginLeft: "4px", fontSize: "0.65rem" }} /></th>
           <th style={{ cursor: "pointer", width: "150px", padding: "0.875rem 0.75rem" }} onClick={() => handleSort("status")}>Estado <i className={sortIcon("status")} style={{ marginLeft: "4px", fontSize: "0.65rem" }} /></th>
           <th style={{ width: "90px", padding: "0.875rem 0.75rem" }}>Acciones</th>
          </tr></thead>
          <tbody>
           {paginatedDemands.map((d, i) => (
            <tr key={d.id}>
             <td style={{ color: "#9E9E9E", padding: "1rem 0.75rem" }}>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
             <td style={{ padding: "1rem 0.75rem" }}><strong>{d.title}</strong></td>
             <td style={{ color: "#666", padding: "1rem 0.75rem" }}>{d.requester}</td>
             <td>
              <span style={{ fontWeight: 700, color: d.wsjf_score >= 5 ? "#00A651" : d.wsjf_score >= 3 ? "#FFC107" : "#666" }}>{d.wsjf_score}</span>
             </td>
             <td>
              <Chip variant={d.status === "done" ? "success" : d.status === "in_progress" ? "warning" : d.status === "prioritized" ? "info" : "neutral"}>
               {d.status === "done" ? "Completado" : d.status === "in_progress" ? "En progreso" : d.status === "prioritized" ? "Priorizado" : d.status === "cancelled" ? "Cancelado" : "Backlog"}
              </Chip>
             </td>
             <td>
              <button className="sb-ui-button sb-ui-button--error sb-ui-button--text sb-ui-button--small sb-ui-button--icon-only" onClick={() => setDeleteTarget(d.id)} title="Eliminar">
               <i className="fa-solid fa-trash" />
              </button>
             </td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
       </>
      )}
     </div>
    </article>
   )}

   <ConfirmDialog isOpen={deleteTarget !== null} title="Eliminar solicitud" message="¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
  </div>
 );
}
