import { Trophy, Users } from 'lucide-react';
import type { Team } from '../../../types';
import type { MetricLevel } from '../talento-utils';

export interface TeamRewardCardProps {
  team: Team;
  hasBadge: boolean;
  improvementPercentage: number | null;
  eliteMetricsCount: number;
  metricLevels: MetricLevel[];
}

const METRIC_LABELS: Record<string, { label: string; unit: string }> = {
  deploymentFrequency: { label: 'Deployment Frequency', unit: 'deploys/semana' },
  leadTimeForChanges: { label: 'Lead Time', unit: 'días' },
  changeFailureRate: { label: 'Change Failure Rate', unit: '%' },
  mttr: { label: 'MTTR', unit: 'horas' },
};

function getLevelStyles(label: string): string {
  switch (label) {
    case 'Elite':
      return 'bg-green-100 text-green-800';
    case 'Alto':
      return 'bg-amber-100 text-amber-800';
    case 'Necesita mejora':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * TeamRewardCard displays a team's DORA metrics with level classifications,
 * an optional golden TechMaster badge, lead time improvement, and progress bar.
 */
export function TeamRewardCard({
  team,
  hasBadge,
  improvementPercentage,
  eliteMetricsCount,
  metricLevels,
}: TeamRewardCardProps) {
  const progressPercentage = (eliteMetricsCount / 4) * 100;

  return (
    <article
      className={`sb-ui-card sb-ui-card--elevated${hasBadge ? ' border-2 border-amber-400' : ''}`}
    >
      <div className="sb-ui-card__content p-4 flex flex-col gap-3">
        {/* Team name */}
        <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>

        {/* Golden badge if applicable */}
        {hasBadge && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-100 to-amber-200">
            <Trophy className="w-5 h-5 text-amber-600" />
            <Users className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Equipo TechMaster</span>
          </div>
        )}

        {/* DORA Metrics */}
        <div className="flex flex-col gap-2">
          {metricLevels.map((ml) => {
            const info = METRIC_LABELS[ml.metric] ?? { label: ml.metric, unit: '' };
            return (
              <div key={ml.metric} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-700">
                  {info.label}: <strong>{ml.value}</strong> {info.unit}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLevelStyles(ml.label)}`}
                >
                  {ml.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Lead Time Improvement */}
        <div className="text-sm text-gray-600">
          {improvementPercentage !== null ? (
            <span>
              Mejora Lead Time: <strong>{improvementPercentage.toFixed(1)}%</strong>
            </span>
          ) : (
            <span className="italic">Sin datos históricos</span>
          )}
        </div>

        {/* Progress bar (only shown when team does NOT have badge) */}
        {!hasBadge && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">En camino a TechMaster</span>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{progressPercentage}%</span>
          </div>
        )}
      </div>
    </article>
  );
}
