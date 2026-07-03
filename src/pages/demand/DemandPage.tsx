import { useState, useEffect, useMemo } from "react";
import { fetchDemands, fetchTeams, createDemand, deleteDemand, type ApiDemand, type ApiTeam } from "../../data/api-client";
import { Pagination } from "../../shared/Pagination";
import { ConfirmDialog } from "../../shared/ConfirmDialog";
import { DemandWizard } from "./DemandWizard";

type SortField = "wsjf_score" | "title" | "status";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

export function DemandPage() {
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [demands, setDemands] = useState<ApiDemand[]>([]);
  const [filterTeam, setFilterTeam] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("wsjf_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useEffect(() => {
    fetchTeams().then((t) => { setTeams(t); if (t.length) { setFilterTeam(t[0].id); } });
  }, []);

  useEffect(() => {
    if (!filterTeam) return;
    setLoading(true);
    setCurrentPage(1);
    fetchDemands(filterTeam).then(setDemands).finally(() => setLoading(false));
  }, [filterTeam]);

  // Sorted and paginated data
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
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
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
      setSuccessMsg("✅ Solicitud SOL-" + String(demands.length + 23).padStart(4, "0") + " creada exitosamente");
      setTimeout(() => setSuccessMsg(""), 4000);
      const updated = await fetchDemands(filterTeam);
      setDemands(updated);
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete() {
    if (deleteTarget === null) return;
    await deleteDemand(deleteTarget);
    setDemands((prev) => prev.filter((d) => d.id !== deleteTarget));
    setDeleteTarget(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <h1 className="sb-ui-heading-h4">Gestión de Demanda — WSJF</h1>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
          <div className="sb-ui-input-container">
            <label className="sb-ui-input-label" htmlFor="filter-team">Célula</label>
            <select id="filter-team" className="sb-ui-select" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button className="sb-ui-button sb-ui-button--primary sb-ui-button--fill sb-ui-button--icon-left" onClick={() => setShowForm(!showForm)}>
            <i className="fa-solid fa-plus" />
            Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="sb-ui-alert sb-ui-alert--success sb-ui-alert--dismissible">
          <i className="fa-solid fa-circle-check" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Create Wizard */}
      {showForm && (
        <DemandWizard
          teams={teams}
          filterTeam={filterTeam}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          creating={creating}
          requestNumber={demands.length + 23}
        />
      )}

      {/* Demands Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="sb-ui-spinner sb-ui-spinner--primary" />
        </div>
      ) : (
        <article className="sb-ui-card sb-ui-card--elevated">
          <div className="sb-ui-card__content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600 }}>Ranking por WSJF</h3>
              <span className="sb-ui-badge sb-ui-badge--primary">{demands.length} solicitudes</span>
            </div>

            {demands.length === 0 ? (
              <div className="sb-ui-alert sb-ui-alert--info">
                <i className="fa-solid fa-info-circle" />
                <span>No hay solicitudes para esta célula. Crea una nueva.</span>
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover sb-ui-table--bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>
                          Título <i className={sortIcon("title")} style={{ marginLeft: "4px", fontSize: "0.7rem" }} />
                        </th>
                        <th>Solicitante</th>
                        <th>BV</th>
                        <th>Urg</th>
                        <th>Size</th>
                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("wsjf_score")}>
                          WSJF <i className={sortIcon("wsjf_score")} style={{ marginLeft: "4px", fontSize: "0.7rem" }} />
                        </th>
                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("status")}>
                          Estado <i className={sortIcon("status")} style={{ marginLeft: "4px", fontSize: "0.7rem" }} />
                        </th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDemands.map((d, i) => (
                        <tr key={d.id}>
                          <td>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                          <td><strong>{d.title}</strong></td>
                          <td>{d.requester}</td>
                          <td>{d.business_value}</td>
                          <td>{d.urgency}</td>
                          <td>{d.size}</td>
                          <td><strong style={{ color: "#00A651" }}>{d.wsjf_score}</strong></td>
                          <td>
                            <span className={`sb-ui-badge ${d.status === "done" ? "sb-ui-badge--success" : d.status === "in_progress" ? "sb-ui-badge--warning" : d.status === "prioritized" ? "sb-ui-badge--primary" : "sb-ui-badge--error"}`}>
                              {d.status === "done" ? "Completado" : d.status === "in_progress" ? "En progreso" : d.status === "prioritized" ? "Priorizado" : d.status === "cancelled" ? "Cancelado" : "Backlog"}
                            </span>
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

      {/* Confirm dialog for deletion */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Eliminar solicitud"
        message="¿Estás seguro de que deseas eliminar esta solicitud de demanda? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
