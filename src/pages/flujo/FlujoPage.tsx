import { getTeams } from "../../data/data-service";

export function FlujoPage() {
 const teams = getTeams();

 return (
 <div className="space-y-6">
 <div className="sb-ui-grid">
 {teams.map((team) => {
 const wipPercent = Math.round((team.wipCurrent / team.wipLimit) * 100);
 const isOverWip = team.wipCurrent >= team.wipLimit;
 return (
 <div key={team.id} className="sb-ui-col-12 sb-ui-col-md-4">
 <article className="sb-ui-card sb-ui-card--elevated">
 <div className="sb-ui-card__content">
 <div className="flex items-center justify-between mb-4">
 <h3 className="sb-ui-heading-h6">{team.name}</h3>
 {isOverWip && (
 <span className="sb-ui-badge sb-ui-badge--warning sb-ui-badge--medium">
 <i className="fa-solid fa-exclamation" />
 </span>
 )}
 </div>
 <div className="mb-4">
 <div className="flex justify-between mb-1">
 <span className="sb-ui-text-caption">WIP</span>
 <span className="sb-ui-text-label">{team.wipCurrent}/{team.wipLimit}</span>
 </div>
 <div className="w-full h-2 rounded-full bg-bolivar-gray-light overflow-hidden">
 <div
 className={`h-full rounded-full transition-all ${isOverWip ? "bg-red-500" : "bg-bolivar-green"}`}
 style={{ width: `${Math.min(wipPercent, 100)}%` }}
 />
 </div>
 </div>
 <h4 className="sb-ui-text-label mb-3">Métricas DORA</h4>
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="sb-ui-text-caption">Deploy Frequency</span>
 <span className="sb-ui-text-body text-sm font-medium">{team.doraMetrics.deploymentFrequency}/sem</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="sb-ui-text-caption">Lead Time</span>
 <span className="sb-ui-text-body text-sm font-medium">{team.doraMetrics.leadTimeForChanges}h</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="sb-ui-text-caption">Change Failure Rate</span>
 <span className="sb-ui-text-body text-sm font-medium">{team.doraMetrics.changeFailureRate}%</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="sb-ui-text-caption">MTTR</span>
 <span className="sb-ui-text-body text-sm font-medium">{team.doraMetrics.mttr}h</span>
 </div>
 </div>
 </div>
 </article>
 </div>
 );
 })}
 </div>
 </div>
 );
}
