import { Award } from 'lucide-react';
import { getTeams } from '../../../data/data-service';
import type { DoraMetrics } from '../../../types';
import {
  hasTeamBadge,
  computeEliteProgress,
  classifyMetricLevel,
  computeLeadTimeImprovement,
} from '../talento-utils';
import type { MetricLevel } from '../talento-utils';
import { TeamRewardCard } from './TeamRewardCard';

/**
 * TechRewards displays recognition and technical maturity per team.
 * Teams with a badge appear first, then sorted by elite progress descending.
 */
export function TechRewards() {
  const teams = getTeams();

  const metrics: (keyof DoraMetrics)[] = [
    'deploymentFrequency',
    'leadTimeForChanges',
    'changeFailureRate',
    'mttr',
  ];

  const teamsData = teams.map((team) => {
    const hasBadge = hasTeamBadge(team);

    const improvementPercentage =
      team.previousLeadTimeForChanges != null
        ? computeLeadTimeImprovement(
            team.doraMetrics.leadTimeForChanges,
            team.previousLeadTimeForChanges
          )
        : null;

    const eliteMetricsCount = computeEliteProgress(team.doraMetrics) / 25;

    const metricLevels: MetricLevel[] = metrics.map((metric) => ({
      metric,
      value: team.doraMetrics[metric],
      label: classifyMetricLevel(metric, team.doraMetrics[metric]),
      isElite: classifyMetricLevel(metric, team.doraMetrics[metric]) === 'Elite',
    }));

    return { team, hasBadge, improvementPercentage, eliteMetricsCount, metricLevels };
  });

  // Sort: badge teams first, then by elite progress descending
  teamsData.sort((a, b) => {
    if (a.hasBadge !== b.hasBadge) return a.hasBadge ? -1 : 1;
    return computeEliteProgress(b.team.doraMetrics) - computeEliteProgress(a.team.doraMetrics);
  });

  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Award className="w-6 h-6 text-amber-600" />
        <h3 className="text-xl font-bold text-gray-900">Tech Rewards</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Reconocimiento y Madurez Técnica por Equipos
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teamsData.map(({ team, hasBadge, improvementPercentage, eliteMetricsCount, metricLevels }) => (
          <TeamRewardCard
            key={team.id}
            team={team}
            hasBadge={hasBadge}
            improvementPercentage={improvementPercentage}
            eliteMetricsCount={eliteMetricsCount}
            metricLevels={metricLevels}
          />
        ))}
      </div>
    </section>
  );
}
