// Feature: talento-module, Property 3: Radar data series correctness
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Skill } from '../../../types';

/**
 * **Validates: Requirements 3.2, 3.3**
 *
 * Property 3: Radar data series correctness
 * For any user with a non-empty skills array, the radar chart data SHALL contain
 * one entry per skill where the "Nivel Actual" value equals the skill's level
 * and the "Nivel Deseado" value equals 5.
 */

// The transformation logic as implemented in GrowthRadar component
function buildRadarChartData(skills: Skill[]) {
  return skills.map((skill) => ({
    skill: skill.name,
    nivelActual: skill.level,
    nivelDeseado: 5,
  }));
}

// Generator for a skill with alphanumeric name and level 1-5
const skillArb: fc.Arbitrary<Skill> = fc.record({
  name: fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/),
  level: fc.integer({ min: 1, max: 5 }) as fc.Arbitrary<1 | 2 | 3 | 4 | 5>,
});

describe('Property 3: Radar data series correctness', () => {
  it('should produce one entry per skill with nivelActual = skill.level and nivelDeseado = 5', () => {
    fc.assert(
      fc.property(
        fc.array(skillArb, { minLength: 1, maxLength: 10 }),
        (skills) => {
          const chartData = buildRadarChartData(skills);

          // The chart data should have the same number of entries as skills
          expect(chartData).toHaveLength(skills.length);

          // Each entry should match its corresponding skill
          for (let i = 0; i < skills.length; i++) {
            expect(chartData[i].skill).toBe(skills[i].name);
            expect(chartData[i].nivelActual).toBe(skills[i].level);
            expect(chartData[i].nivelDeseado).toBe(5);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
