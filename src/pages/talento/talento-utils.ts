import type { User, Skill, DoraMetrics, Team } from '../../types';

/**
 * Returns the subset of a user's skills whose names contain the searchTerm
 * as a case-insensitive substring.
 */
export function getMatchingSkills(user: User, searchTerm: string): Skill[] {
  if (!searchTerm) {
    return [];
  }
  const term = searchTerm.toLowerCase();
  return user.skills.filter((skill) => skill.name.toLowerCase().includes(term));
}

/**
 * Filters users by skill name. If searchTerm is empty, returns all users.
 * Otherwise, returns only users that have at least one skill whose name
 * contains the searchTerm as a case-insensitive substring.
 */
export function filterUsersBySkill(users: User[], searchTerm: string): User[] {
  if (!searchTerm) {
    return users;
  }
  const term = searchTerm.toLowerCase();
  return users.filter((user) =>
    user.skills.some((skill) => skill.name.toLowerCase().includes(term))
  );
}

// ─── Task 2.2: Skill Gap Analysis ────────────────────────────────────────────

export interface SkillAnalysis {
  name: string;
  demand: number;
  averageLevel: number;
  gap: number;
}

/**
 * Analyzes all unique skills across users, computing demand, average level,
 * and gap (5 - averageLevel) for each skill.
 */
export function analyzeSkills(users: User[]): SkillAnalysis[] {
  const skillMap = new Map<string, number[]>();

  for (const user of users) {
    for (const skill of user.skills) {
      const levels = skillMap.get(skill.name) ?? [];
      levels.push(skill.level);
      skillMap.set(skill.name, levels);
    }
  }

  const result: SkillAnalysis[] = [];
  for (const [name, levels] of skillMap.entries()) {
    const demand = levels.length;
    const averageLevel = levels.reduce((sum, l) => sum + l, 0) / levels.length;
    const gap = 5 - averageLevel;
    result.push({ name, demand, averageLevel, gap });
  }

  return result;
}

/**
 * Returns a color classification based on average skill level:
 * green >= 4, yellow >= 3 and < 4, red < 3.
 */
export function getGapColor(averageLevel: number): 'green' | 'yellow' | 'red' {
  if (averageLevel >= 4) return 'green';
  if (averageLevel >= 3) return 'yellow';
  return 'red';
}

// ─── Task 2.3: Ranking TechMaster ────────────────────────────────────────────

export interface RankedUser {
  user: User;
  index: number;
  position: number;
  isTechMaster: boolean;
}

/**
 * Returns the arithmetic mean of all skill levels for a user,
 * rounded to 1 decimal place. Returns 0 if user has no skills.
 */
export function computeMaturityIndex(user: User): number {
  if (user.skills.length === 0) return 0;
  const sum = user.skills.reduce((acc, s) => acc + s.level, 0);
  return Math.round((sum / user.skills.length) * 10) / 10;
}

/**
 * Sorts users descending by maturity index. Users with the same index
 * get the same position number and are ordered alphabetically by name.
 * isTechMaster is true if user has at least one skill with level 5.
 */
export function computeRanking(users: User[]): RankedUser[] {
  const indexed = users.map((user) => ({
    user,
    index: computeMaturityIndex(user),
    isTechMaster: user.skills.some((s) => s.level === 5),
  }));

  // Sort descending by index, then alphabetically by name for ties
  indexed.sort((a, b) => {
    if (b.index !== a.index) return b.index - a.index;
    return a.user.name.localeCompare(b.user.name);
  });

  // Assign positions (same index = same position)
  const ranked: RankedUser[] = [];
  let currentPosition = 1;

  for (let i = 0; i < indexed.length; i++) {
    if (i > 0 && indexed[i].index < indexed[i - 1].index) {
      currentPosition = i + 1;
    }
    ranked.push({
      user: indexed[i].user,
      index: indexed[i].index,
      position: currentPosition,
      isTechMaster: indexed[i].isTechMaster,
    });
  }

  return ranked;
}

// ─── Task 2.4: Tech Rewards ──────────────────────────────────────────────────

export type MetricLevelLabel = 'Elite' | 'Alto' | 'Necesita mejora';

export interface MetricLevel {
  metric: string;
  value: number;
  label: MetricLevelLabel;
  isElite: boolean;
}

export const DORA_ELITE_THRESHOLDS = {
  deploymentFrequency: 10,
  leadTimeForChanges: 5,
  changeFailureRate: 10,
  mttr: 2,
} as const;

export const DORA_HIGH_THRESHOLDS = {
  deploymentFrequency: 8,
  leadTimeForChanges: 6,
  changeFailureRate: 12,
  mttr: 2.4,
} as const;

/**
 * Classifies a single DORA metric value into Elite, Alto, or Necesita mejora.
 */
export function classifyMetricLevel(metric: keyof DoraMetrics, value: number): MetricLevelLabel {
  switch (metric) {
    case 'deploymentFrequency':
      if (value >= DORA_ELITE_THRESHOLDS.deploymentFrequency) return 'Elite';
      if (value >= DORA_HIGH_THRESHOLDS.deploymentFrequency) return 'Alto';
      return 'Necesita mejora';
    case 'leadTimeForChanges':
      if (value <= DORA_ELITE_THRESHOLDS.leadTimeForChanges) return 'Elite';
      if (value <= DORA_HIGH_THRESHOLDS.leadTimeForChanges) return 'Alto';
      return 'Necesita mejora';
    case 'changeFailureRate':
      if (value <= DORA_ELITE_THRESHOLDS.changeFailureRate) return 'Elite';
      if (value <= DORA_HIGH_THRESHOLDS.changeFailureRate) return 'Alto';
      return 'Necesita mejora';
    case 'mttr':
      if (value <= DORA_ELITE_THRESHOLDS.mttr) return 'Elite';
      if (value <= DORA_HIGH_THRESHOLDS.mttr) return 'Alto';
      return 'Necesita mejora';
  }
}

/**
 * Returns true if ALL 4 metrics meet elite thresholds simultaneously.
 */
export function isEliteDORA(metrics: DoraMetrics): boolean {
  return (
    metrics.deploymentFrequency >= DORA_ELITE_THRESHOLDS.deploymentFrequency &&
    metrics.leadTimeForChanges <= DORA_ELITE_THRESHOLDS.leadTimeForChanges &&
    metrics.changeFailureRate <= DORA_ELITE_THRESHOLDS.changeFailureRate &&
    metrics.mttr <= DORA_ELITE_THRESHOLDS.mttr
  );
}

/**
 * Returns the percentage of improvement in lead time:
 * ((previous - current) / previous) * 100
 */
export function computeLeadTimeImprovement(current: number, previous: number): number {
  return ((previous - current) / previous) * 100;
}

/**
 * Returns true if team is elite DORA OR has 20%+ improvement in lead time.
 */
export function hasTeamBadge(team: Team): boolean {
  if (isEliteDORA(team.doraMetrics)) return true;
  if (team.previousLeadTimeForChanges != null) {
    const improvement = computeLeadTimeImprovement(
      team.doraMetrics.leadTimeForChanges,
      team.previousLeadTimeForChanges
    );
    return improvement >= 20;
  }
  return false;
}

/**
 * Returns (number of metrics at elite level / 4) * 100.
 * Result is one of 0, 25, 50, 75, or 100.
 */
export function computeEliteProgress(metrics: DoraMetrics): number {
  let eliteCount = 0;
  if (metrics.deploymentFrequency >= DORA_ELITE_THRESHOLDS.deploymentFrequency) eliteCount++;
  if (metrics.leadTimeForChanges <= DORA_ELITE_THRESHOLDS.leadTimeForChanges) eliteCount++;
  if (metrics.changeFailureRate <= DORA_ELITE_THRESHOLDS.changeFailureRate) eliteCount++;
  if (metrics.mttr <= DORA_ELITE_THRESHOLDS.mttr) eliteCount++;
  return (eliteCount / 4) * 100;
}
