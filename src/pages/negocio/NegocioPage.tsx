import { TrendingUp, TrendingDown } from "lucide-react";
import { getInitiatives, getTeams } from "../../data/data-service";

const statusConfig: Record<string, { label: string; chipClass: string }> = {
 en_progreso: { label: "En progreso", chipClass: "sb-ui-chip--info sb-ui-chip--soft" },
 completada: { label: "Completada", chipClass: "sb-ui-chip--success sb-ui-chip--soft" },
 en_riesgo: { label: "En riesgo", chipClass: "sb-ui-chip--error sb-ui-chip--soft" },
};

export function NegocioPage() {
 const initiatives = getInitiatives();
 const teams = getTeams();

 const totalProjected = initiatives.reduce((sum, i) => sum + i.projectedValue, 0);
 const totalActual = initiatives.reduce((sum, i) => sum + i.actualValue, 0);
 const totalDiff = totalActual - totalProjected;

 return (
 <div className="space-y-6">
 <div className="sb-ui-grid">
 <div className="sb-ui-col-12 sb-ui-col-md-4">
 <article className="sb-ui-card sb-ui-card--elevated">
 <div className="sb-ui-card__content">
 <span className="sb-ui-text-caption">Valor Proyectado Total</span>
 <p className="sb-ui-heading-h4 mt-1" style={{ color: "var(--sb-ui-color-primary-base)" }}>
 ${totalProjected.toLocaleString()}M
 </p>
 </div>
 </article>
 </div>
 <div className="sb-ui-col-12 sb-ui-col-md-4">
 <article className="sb-ui-card sb-ui-card--elevated">
 <div className="sb-ui-card__content">
 <span className="sb-ui-text-caption">Valor Real Total</span>
 <p className="sb-ui-heading-h4 mt-1">${totalActual.toLocaleString()}M</p>
 </div>
 </article>
 </div>
 <div className="sb-ui-col-12 sb-ui-col-md-4">
 <article className="sb-ui-card sb-ui-card--elevated">
 <div className="sb-ui-card__content">
 <span className="sb-ui-text-caption">Diferencia</span>
 <div className="flex items-center gap-2 mt-1">
 {totalDiff >= 0 ? (
 <TrendingUp className="w-5 h-5 text-green-600" />
 ) : (
 <TrendingDown className="w-5 h-5 text-red-500" />
 )}
 <p className={`sb-ui-heading-h4 ${totalDiff >= 0 ? "text-green-600" : "text-red-500"}`}>
 {totalDiff >= 0 ? "+" : ""}{totalDiff.toLocaleString()}M
 </p>
 </div>
 </div>
 </article>
 </div>
 </div>
 <article className="sb-ui-card sb-ui-card--elevated">
 <div className="sb-ui-card__content">
 <h3 className="sb-ui-heading-h6 mb-4">Iniciativas</h3>
 <div className="overflow-x-auto">
 <table className="sb-ui-table sb-ui-table--hover" style={{ width: "100%" }}>
 <thead>
 <tr>
 <th>Iniciativa</th>
 <th>Célula</th>
 <th>Proyectado</th>
 <th>Real</th>
 <th>Estado</th>
 </tr>
 </thead>
 <tbody>
 {initiatives.map((init) => {
 const team = teams.find((t) => t.id === init.teamId);
 const config = statusConfig[init.status];
 return (
 <tr key={init.id}>
 <td className="font-medium">{init.name}</td>
 <td>{team?.name}</td>
 <td>${init.projectedValue.toLocaleString()}M</td>
 <td>${init.actualValue.toLocaleString()}M</td>
 <td>
 <span className={`sb-ui-chip sb-ui-chip--sm ${config.chipClass}`}>
 <span className="sb-ui-chip__label">{config.label}</span>
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </article>
 </div>
 );
}
