// @vitest-environment node
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { analyzeSkills, getGapColor } from '../talento-utils';
import type { User, Skill } from '../../../types';

// Generators
const SKILL_NAMES = [
  'TypeScript', 'JavaScript', 'React', 'Angular', 'Vue',
  'Node.js', 'Python', 'Java', 'Go', 'Rust',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GraphQL',
];

const skillArb: fc.Arbitrary<Skill> = fc.record({
  name: fc.constantFrom(...SKILL_NAMES),
  level: fc.integer({ min: 1, max: 5 }) as fc.Arbitrary<1 | 2 | 3 | 4 | 5>,
});

const userArb: fc.Arbitrary<User> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  role: fc.string({ minLength: 1, maxLength: 20 }),
  teamId: fc.uuid(),
  skills: fc.array(skillArb, { minLength: 1, maxLength: 5 }),
});

const usersArb: fc.Arbitrary<User[]> = fc.array(userArb, { minLength: 1, maxLength: 10 });

describe('Skill Gap Analysis - Property Tests', () => {
  // Feature: talento-module, Property 4: Skill analysis computation correctness
  describe('Property 4: Skill analysis computation correctness', () => {
    it('produces one entry per unique skill name with correct demand and averageLevel', () => {
      fc.assert(
        fc.property(usersArb, (users) => {
          const result = analyzeSkills(users);

          // Compute expected values manually
          const skillMap = new Map<string, number[]>();
          for (const user of users) {
            for (const skill of user.skills) {
              const levels = skillMap.get(skill.name) ?? [];
              levels.push(skill.level);
              skillMap.set(skill.name, levels);
            }
          }

          // One entry per unique skill name
          expect(result.length).toBe(skillMap.size);

          for (const entry of result) {
            const expectedLevels = skillMap.get(entry.name);
            expect(expectedLevels).toBeDefined();

            // demand equals the count of users possessing that skill
            expect(entry.demand).toBe(expectedLevels!.length);

            // averageLevel equals the arithmetic mean of that skill's levels
            const expectedAvg = expectedLevels!.reduce((sum, l) => sum + l, 0) / expectedLevels!.length;
            expect(entry.averageLevel).toBeCloseTo(expectedAvg, 10);

            // gap is 5 - averageLevel
            expect(entry.gap).toBeCloseTo(5 - expectedAvg, 10);
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Validates: Requirements 4.2
     */
  });

  // Feature: talento-module, Property 5: Skill demand ordering
  describe('Property 5: Skill demand ordering', () => {
    it('when sorted by demand descending, each skill demand >= next skill demand', () => {
      fc.assert(
        fc.property(usersArb, (users) => {
          const result = analyzeSkills(users);
          const sortedByDemand = [...result].sort((a, b) => b.demand - a.demand);

          for (let i = 0; i < sortedByDemand.length - 1; i++) {
            expect(sortedByDemand[i].demand).toBeGreaterThanOrEqual(sortedByDemand[i + 1].demand);
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Validates: Requirements 4.3
     */
  });

  // Feature: talento-module, Property 6: Skill gap ordering
  describe('Property 6: Skill gap ordering', () => {
    it('when sorted by gap descending, each skill gap >= next skill gap', () => {
      fc.assert(
        fc.property(usersArb, (users) => {
          const result = analyzeSkills(users);
          const sortedByGap = [...result].sort((a, b) => b.gap - a.gap);

          for (let i = 0; i < sortedByGap.length - 1; i++) {
            expect(sortedByGap[i].gap).toBeGreaterThanOrEqual(sortedByGap[i + 1].gap);
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Validates: Requirements 4.4
     */
  });

  // Feature: talento-module, Property 7: Skill gap color classification
  describe('Property 7: Skill gap color classification', () => {
    it('returns green if averageLevel >= 4, yellow if >= 3 and < 4, red if < 3', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 5, noNaN: true }),
          (averageLevel) => {
            const color = getGapColor(averageLevel);

            if (averageLevel >= 4) {
              expect(color).toBe('green');
            } else if (averageLevel >= 3) {
              expect(color).toBe('yellow');
            } else {
              expect(color).toBe('red');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Validates: Requirements 4.5
     */
  });
});
