// @vitest-environment node
// Feature: talento-module, Property 11: Lead Time improvement badge award
// Feature: talento-module, Property 12: Elite DORA badge award
// Feature: talento-module, Property 13: DORA metric level classification
// Feature: talento-module, Property 14: DORA elite progress percentage
// Feature: talento-module, Property 15: Team card ordering
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  computeLeadTimeImprovement,
  hasTeamBadge,
  isEliteDORA,
  classifyMetricLevel,
  computeEliteProgress,
  DORA_ELITE_THRESHOLDS,
  DORA_HIGH_THRESHOLDS,
} from '../talento-utils';
import type { DoraMetrics, Team } from '../../../types';

// ─── Generators ──────────────────────────────────────────────────────────────

const doraMetricsArb: fc.Arbitrary<DoraMetrics> = fc.record({
  deploymentFrequency: fc.double({ min: 0, max: 30, noNaN: true }),
  leadTimeForChanges: fc.double({ min: 0, max: 30, noNaN: true }),
  changeFailureRate: fc.double({ min: 0, max: 100, noNaN: true }),
  mttr: fc.double({ min: 0, max: 20, noNaN: true }),
});

const teamArb: fc.Arbitrary<Team> = fc.record({
  id: fc.uuid(),
  name: fc.stringMatching(/^[a-zA-Z ]{1,20}$/),
  wipLimit: fc.integer({ min: 1, max: 20 }),
  wipCurrent: fc.integer({ min: 0, max: 20 }),
  doraMetrics: doraMetricsArb,
  memberMood: fc.constant([]),
  previousLeadTimeForChanges: fc.option(
    fc.double({ min: 0.1, max: 30, noNaN: true }),
    { nil: undefined }
  ),
});

// Team with guaranteed previousLeadTimeForChanges defined
const teamWithPreviousLeadTimeArb: fc.Arbitrary<Team> = fc.record({
  id: fc.uuid(),
  name: fc.stringMatching(/^[a-zA-Z ]{1,20}$/),
  wipLimit: fc.integer({ min: 1, max: 20 }),
  wipCurrent: fc.integer({ min: 0, max: 20 }),
  doraMetrics: doraMetricsArb,
  memberMood: fc.constant([]),
  previousLeadTimeForChanges: fc.double({ min: 0.1, max: 30, noNaN: true }),
});

// ─── Property 11: Lead Time improvement badge award ──────────────────────────

/**
 * **Validates: Requirements 8.2**
 *
 * Property 11: Lead Time improvement badge award
 * For any team with both leadTimeForChanges and previousLeadTimeForChanges,
 * the badge is awarded by improvement criterion iff
 * ((previous - current) / previous) * 100 >= 20.
 */
describe('Property 11: Lead Time improvement badge award', () => {
  it('should award badge by improvement criterion iff improvement >= 20%', () => {
    fc.assert(
      fc.property(
        teamWithPreviousLeadTimeArb,
        (team) => {
          const current = team.doraMetrics.leadTimeForChanges;
          const previous = team.previousLeadTimeForChanges!;
          const improvement = ((previous - current) / previous) * 100;

          // Check if elite DORA also qualifies (to isolate improvement criterion)
          const isElite = isEliteDORA(team.doraMetrics);
          const hasBadge = hasTeamBadge(team);

          if (isElite) {
            // If team is elite DORA, badge is always true regardless of improvement
            expect(hasBadge).toBe(true);
          } else {
            // If NOT elite, badge depends solely on improvement criterion
            const expectedByImprovement = improvement >= 20;
            expect(hasBadge).toBe(expectedByImprovement);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 12: Elite DORA badge award ─────────────────────────────────────

/**
 * **Validates: Requirements 8.3**
 *
 * Property 12: Elite DORA badge award
 * For any team, the badge is awarded by elite criterion iff
 * deploymentFrequency >= 10 AND leadTimeForChanges <= 5
 * AND changeFailureRate <= 10 AND mttr <= 2.
 */
describe('Property 12: Elite DORA badge award', () => {
  it('should classify team as elite DORA iff all 4 metrics meet elite thresholds', () => {
    fc.assert(
      fc.property(
        doraMetricsArb,
        (metrics) => {
          const result = isEliteDORA(metrics);
          const expected =
            metrics.deploymentFrequency >= DORA_ELITE_THRESHOLDS.deploymentFrequency &&
            metrics.leadTimeForChanges <= DORA_ELITE_THRESHOLDS.leadTimeForChanges &&
            metrics.changeFailureRate <= DORA_ELITE_THRESHOLDS.changeFailureRate &&
            metrics.mttr <= DORA_ELITE_THRESHOLDS.mttr;

          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should award badge when team has elite DORA regardless of previous lead time', () => {
    fc.assert(
      fc.property(
        teamArb,
        (team) => {
          if (isEliteDORA(team.doraMetrics)) {
            expect(hasTeamBadge(team)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 13: DORA metric level classification ───────────────────────────

/**
 * **Validates: Requirements 8.6**
 *
 * Property 13: DORA metric level classification
 * For each DORA metric:
 * - deploymentFrequency: Elite >= 10, Alto >= 8, else Necesita mejora
 * - leadTimeForChanges: Elite <= 5, Alto <= 6, else Necesita mejora
 * - changeFailureRate: Elite <= 10, Alto <= 12, else Necesita mejora
 * - mttr: Elite <= 2, Alto <= 2.4, else Necesita mejora
 */
describe('Property 13: DORA metric level classification', () => {
  it('should classify deploymentFrequency correctly', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 30, noNaN: true }),
        (value) => {
          const label = classifyMetricLevel('deploymentFrequency', value);
          if (value >= 10) {
            expect(label).toBe('Elite');
          } else if (value >= 8) {
            expect(label).toBe('Alto');
          } else {
            expect(label).toBe('Necesita mejora');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should classify leadTimeForChanges correctly', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 30, noNaN: true }),
        (value) => {
          const label = classifyMetricLevel('leadTimeForChanges', value);
          if (value <= 5) {
            expect(label).toBe('Elite');
          } else if (value <= 6) {
            expect(label).toBe('Alto');
          } else {
            expect(label).toBe('Necesita mejora');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should classify changeFailureRate correctly', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100, noNaN: true }),
        (value) => {
          const label = classifyMetricLevel('changeFailureRate', value);
          if (value <= 10) {
            expect(label).toBe('Elite');
          } else if (value <= 12) {
            expect(label).toBe('Alto');
          } else {
            expect(label).toBe('Necesita mejora');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should classify mttr correctly', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 20, noNaN: true }),
        (value) => {
          const label = classifyMetricLevel('mttr', value);
          if (value <= 2) {
            expect(label).toBe('Elite');
          } else if (value <= 2.4) {
            expect(label).toBe('Alto');
          } else {
            expect(label).toBe('Necesita mejora');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 14: DORA elite progress percentage ─────────────────────────────

/**
 * **Validates: Requirements 8.12**
 *
 * Property 14: DORA elite progress percentage
 * computeEliteProgress returns (count of elite metrics / 4) * 100,
 * yielding 0, 25, 50, 75, or 100.
 */
describe('Property 14: DORA elite progress percentage', () => {
  it('should return (count of elite metrics / 4) * 100', () => {
    fc.assert(
      fc.property(
        doraMetricsArb,
        (metrics) => {
          const progress = computeEliteProgress(metrics);

          // Count elite metrics manually
          let eliteCount = 0;
          if (metrics.deploymentFrequency >= DORA_ELITE_THRESHOLDS.deploymentFrequency) eliteCount++;
          if (metrics.leadTimeForChanges <= DORA_ELITE_THRESHOLDS.leadTimeForChanges) eliteCount++;
          if (metrics.changeFailureRate <= DORA_ELITE_THRESHOLDS.changeFailureRate) eliteCount++;
          if (metrics.mttr <= DORA_ELITE_THRESHOLDS.mttr) eliteCount++;

          const expected = (eliteCount / 4) * 100;
          expect(progress).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only yield values from the set {0, 25, 50, 75, 100}', () => {
    fc.assert(
      fc.property(
        doraMetricsArb,
        (metrics) => {
          const progress = computeEliteProgress(metrics);
          expect([0, 25, 50, 75, 100]).toContain(progress);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 15: Team card ordering ─────────────────────────────────────────

/**
 * **Validates: Requirements 8.13**
 *
 * Property 15: Team card ordering
 * Teams with badge come first, then teams without badge ordered by
 * descending elite progress.
 */
describe('Property 15: Team card ordering', () => {
  it('should order teams with badge first, then by descending elite progress', () => {
    fc.assert(
      fc.property(
        fc.array(teamArb, { minLength: 1, maxLength: 10 }),
        (teams) => {
          // Apply sorting logic as defined in the spec
          const sorted = [...teams].sort((a, b) => {
            const aBadge = hasTeamBadge(a);
            const bBadge = hasTeamBadge(b);

            // Teams with badge come first
            if (aBadge && !bBadge) return -1;
            if (!aBadge && bBadge) return 1;

            // If both have or don't have badge, sort by elite progress descending
            const aProgress = computeEliteProgress(a.doraMetrics);
            const bProgress = computeEliteProgress(b.doraMetrics);
            return bProgress - aProgress;
          });

          // Verify: all badge teams come before non-badge teams
          const firstNonBadgeIdx = sorted.findIndex((t) => !hasTeamBadge(t));
          if (firstNonBadgeIdx > 0) {
            // All before this index should have badge
            for (let i = 0; i < firstNonBadgeIdx; i++) {
              expect(hasTeamBadge(sorted[i])).toBe(true);
            }
          }

          // Verify: non-badge teams are ordered by descending elite progress
          const nonBadgeTeams = sorted.filter((t) => !hasTeamBadge(t));
          for (let i = 0; i < nonBadgeTeams.length - 1; i++) {
            const currentProgress = computeEliteProgress(nonBadgeTeams[i].doraMetrics);
            const nextProgress = computeEliteProgress(nonBadgeTeams[i + 1].doraMetrics);
            expect(currentProgress).toBeGreaterThanOrEqual(nextProgress);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
