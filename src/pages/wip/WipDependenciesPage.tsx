import { useState, useEffect } from "react";
import { fetchWipStatus, fetchDependencies, resolveDependency, type ApiWipStatus, type ApiDependency } from "../../data/api-client";
import { ConfirmDialog } from "../../shared/ConfirmDialog";

export function WipDependenciesPage() {
  const [wips, setWips] = useState<ApiWipStatus[]>([]);
  const [deps, setDeps] = useState<ApiDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [resolveTarget, setResolveTarget] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchWipStatus(), fetchDependencies()])
      .then(([w, d]) => { setWips(w); setDeps(d); })
      .finally(() => setLoading(false));
  }, []);

  async function confirmResolve() {
    if (resolveTarget === null) return;
    setResolving(resolveTarget);
    setResolveTarget(null);
    try {
      const updated = await resolveDependency(resolveTarget);
      setDeps((prev) => prev.map((d) => d.id === resolveTarget ? { ...d, is_resolved: true, resolved_at: updated.resolved_at, days_waiting: 0 } : d));
      setSuccessMsg("Dependencia resuelta exitosamente");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setResolving(null);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <div className="sb-ui-spinner sb-ui-spinner--primary sb-ui-spinner--large" />
      </div>
    );
  }

  const overloadedCount = wips.filter((w) => w.is_overloaded).length;
  const pendingDeps = deps.filter((d) => !d.is_resolved);
  const escalatedDeps = pendingDeps.filter((d) => d.days_waiting > 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 className="sb-ui-heading-h4">WIP & Dependencias entre Células</h1>

      {successMsg && (
        <div className="sb-ui-alert sb-ui-alert--success sb-ui-alert--dismissible">
          <i className="fa-solid fa-circle-check" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Alerts summary */}
      {(overloadedCount > 0 || escalatedDeps.length > 0) && (
        <div className="sb-ui-alert sb-ui-alert--warning">
          <i className="fa-solid fa-triangle-exclamation" />
          <span>
            {overloadedCount > 0 && `${overloadedCount} equipo(s) con WIP sobrecargado. `}
            {escalatedDeps.length > 0 && `${escalatedDeps.length} dependencia(s) superan SLA de 5 días.`}
          </span>
        </div>
      )}

      {/* WIP Status */}
      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Work In Progress por Célula</h2>
        <div className="sb-ui-grid">
          {wips.map((wip) => {
            const pct = Math.min(wip.utilization_pct, 100);
            return (
              <div key={wip.team_id} className="sb-ui-col-12 sb-ui-col-md-6 sb-ui-col-lg-4" style={{ marginBottom: "1rem" }}>
                <article className="sb-ui-card sb-ui-card--elevated">
                  <div className="sb-ui-card__content">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{wip.team_name}</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: wip.is_overloaded ? "#E53935" : "#333" }}>
                        Actual: {wip.wip_current} / Límite: {wip.wip_limit}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "12px", borderRadius: "6px", backgroundColor: "#E0E0E0", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: "6px", backgroundColor: wip.is_overloaded ? "#E53935" : pct > 80 ? "#FFC107" : "#00A651", transition: "width 0.3s" }} />
                    </div>
                    {wip.is_overloaded && (
                      <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#E53935", marginTop: "0.5rem" }}>
                        🚨 Sobrecarga de trabajo
                      </p>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dependencies Table */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Dependencias entre Células</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span className="sb-ui-badge sb-ui-badge--error">{pendingDeps.length} pendientes</span>
            <span className="sb-ui-badge sb-ui-badge--success">{deps.length - pendingDeps.length} resueltas</span>
          </div>
        </div>

        <article className="sb-ui-card sb-ui-card--elevated">
          <div className="sb-ui-card__content" style={{ overflowX: "auto" }}>
            <table className="sb-ui-table sb-ui-table--striped sb-ui-table--hover">
              <thead>
                <tr>
                  <th>Equipo Solicitante</th>
                  <th>Equipo Bloqueador</th>
                  <th>Descripción</th>
                  <th>Días de espera</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {deps.map((d) => (
                  <tr key={d.id} style={{ backgroundColor: d.days_waiting > 5 && !d.is_resolved ? "#FFF3F3" : undefined }}>
                    <td><strong>{d.requester_team_name}</strong></td>
                    <td>{d.blocker_team_name}</td>
                    <td style={{ maxWidth: "250px" }}>{d.item_description}</td>
                    <td>
                      {d.is_resolved ? (
                        <span style={{ color: "#9E9E9E" }}>—</span>
                      ) : (
                        <span style={{ fontWeight: 700, color: d.days_waiting > 5 ? "#E53935" : "#333" }}>
                          {d.days_waiting} días
                          {d.days_waiting > 5 && <span className="sb-ui-badge sb-ui-badge--error" style={{ marginLeft: "4px", fontSize: "0.6rem" }}>SLA</span>}
                        </span>
                      )}
                    </td>
                    <td>
                      {d.is_resolved ? (
                        <span className="sb-ui-badge sb-ui-badge--success">Resuelto</span>
                      ) : (
                        <span className="sb-ui-badge sb-ui-badge--error">Pendiente</span>
                      )}
                    </td>
                    <td>
                      {!d.is_resolved && (
                        <button
                          className={`sb-ui-button sb-ui-button--primary sb-ui-button--fill sb-ui-button--small ${resolving === d.id ? "sb-ui-button--disabled" : ""}`}
                          onClick={() => setResolveTarget(d.id)}
                          disabled={resolving === d.id}
                        >
                          {resolving === d.id ? "..." : "Resolver"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div style={{ marginTop: "0.75rem", padding: "0.75rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <p style={{ fontSize: "0.75rem", color: "#666" }}>
            <strong>SLA:</strong> Dependencia &gt; 5 días sin resolver → Escalamiento automático. 
            Las filas en rojo indican bloqueos que superan el SLA.
          </p>
        </div>
      </section>

      {/* Confirm dialog for resolving */}
      <ConfirmDialog
        isOpen={resolveTarget !== null}
        title="Resolver dependencia"
        message="¿Confirmas que esta dependencia ha sido resuelta?"
        onConfirm={confirmResolve}
        onCancel={() => setResolveTarget(null)}
      />
    </div>
  );
}
