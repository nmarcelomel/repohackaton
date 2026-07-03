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

const METRIC_LABELS: Record<string, { label: string; unit: string; description: string }> = {
  deploymentFrequency: { label: 'Frecuencia de Despliegue', unit: 'despliegues/semana', description: 'Qué tan seguido se publica código a producción' },
  leadTimeForChanges: { label: 'Tiempo de Entrega', unit: 'días', description: 'Días desde que se inicia un cambio hasta que llega a producción' },
  changeFailureRate: { label: 'Tasa de Fallos', unit: '%', description: 'Porcentaje de despliegues que causan problemas' },
  mttr: { label: 'Tiempo de Recuperación', unit: 'horas', description: 'Horas para restaurar el servicio tras un incidente' },
};

function getLevelStyles(label: string): { classes: string; text: string } {
  switch (label) {
    case 'Elite':
      return { classes: 'bg-green-100 text-green-800', text: 'Excelente' };
    case 'Alto':
      return { classes: 'bg-amber-100 text-amber-800', text: 'Bueno' };
    case 'Necesita mejora':
      return { classes: 'bg-red-100 text-red-800', text: 'Por mejorar' };
    default:
      return { classes: 'bg-gray-100 text-gray-800', text: label };
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
            <span className="text-sm font-bold text-amber-800">Equipo de Excelencia Técnica</span>
          </div>
        )}

        {/* Métricas del equipo */}
        <div className="flex flex-col gap-2">
          {metricLevels.map((ml) => {
            const info = METRIC_LABELS[ml.metric] ?? { label: ml.metric, unit: '', description: '' };
            const level = getLevelStyles(ml.label);
            return (
              <div key={ml.metric} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-700" title={info.description}>
                  {info.label}: <strong>{ml.value}</strong> {info.unit}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${level.classes}`}
                >
                  {level.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mejora en Tiempo de Entrega */}
        <div className="text-sm text-gray-600">
          {improvementPercentage !== null ? (
            <span>
              Mejora en Tiempo de Entrega: <strong>{improvementPercentage.toFixed(1)}%</strong>
            </span>
          ) : (
            <span className="italic">Sin datos del trimestre anterior</span>
          )}
        </div>

        {/* Barra de progreso (solo cuando NO tiene insignia) */}
        {!hasBadge && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">En camino a la insignia de excelencia</span>
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
