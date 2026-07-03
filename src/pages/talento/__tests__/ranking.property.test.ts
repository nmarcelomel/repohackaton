// @vitest-environment node
// Feature: talento-module, Property 8: Technical Maturity Index calculation
// Feature: talento-module, Property 9: Ranking sort with tie-breaking
// Feature: talento-module, Property 10: TechMaster badge assignment

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeMaturityIndex, computeRanking } from '../talento-utils';
import type { User, Skill } from '../../../types';

// --- Generators ---

const skillLevelArb = fc.integer({ min: 1, max: 5 }) as fc.Arbitrary<1 | 2 | 3 | 4 | 5>;

const skillArb: fc.Arbitrary<Skill> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 20 }),
  level: skillLevelArb,
});

const userArb = (skillsArb: fc.Arbitrary<Skill[]> = fc.array(skillArb, { minLength: 0, maxLength: 10 })): fc.Arbitrary<User> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    role: fc.string({ minLength: 1, maxLength: 20 }),
    teamId: fc.string({ minLength: 1, maxLength: 10 }),
    skills: skillsArb,
  });

const userWithSkillsArb: fc.Arbitrary<User> = userArb(fc.array(skillArb, { minLength: 1, maxLength: 10 }));
const userWithNoSkillsArb: fc.Arbitrary<User> = userArb(fc.constant([]));

const usersArrayArb: fc.Arbitrary<User[]> = fc.array(userArb(), { minLength: 1, maxLength: 20 });

// --- Property 8: Technical Maturity Index calculation ---
// **Validates: Requirements 5.2, 5.9**

describe('Property 8: Technical Maturity Index calculation', () => {
  it('for a user with N > 0 skills, computeMaturityIndex equals the arithmetic mean rounded to 1 decimal', () => {
    fc.assert(
      fc.property(userWithSkillsArb, (user) => {
        const result = computeMaturityIndex(user);
        const sum = user.skills.reduce((acc, s) => acc + s.level, 0);
        const expectedMean = Math.round((sum / user.skills.length) * 10) / 10;
        expect(result).toBe(expectedMean);
      }),
      { numRuns: 100 }
    );
  });

  it('for a user with 0 skills, computeMaturityIndex returns 0', () => {
    fc.assert(
      fc.property(userWithNoSkillsArb, (user) => {
        const result = computeMaturityIndex(user);
        expect(result).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});

// --- Property 9: Ranking sort with tie-breaking ---
// **Validates: Requirements 5.3, 5.4, 5.8**

describe('Property 9: Ranking sort with tie-breaking', () => {
  it('ranking is sorted descending by maturity index', () => {
    fc.assert(
      fc.property(usersArrayArb, (users) => {
        const ranked = computeRanking(users);
        for (let i = 1; i < ranked.length; i++) {
          expect(ranked[i].index).toBeLessThanOrEqual(ranked[i - 1].index);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('users with identical indices share the same position number', () => {
    fc.assert(
      fc.property(usersArrayArb, (users) => {
        const ranked = computeRanking(users);
        for (let i = 1; i < ranked.length; i++) {
          if (ranked[i].index === ranked[i - 1].index) {
            expect(ranked[i].position).toBe(ranked[i - 1].position);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('users with identical indices are sorted alphabetically by name', () => {
    fc.assert(
      fc.property(usersArrayArb, (users) => {
        const ranked = computeRanking(users);
        for (let i = 1; i < ranked.length; i++) {
          if (ranked[i].index === ranked[i - 1].index) {
            expect(
              ranked[i - 1].user.name.localeCompare(ranked[i].user.name)
            ).toBeLessThanOrEqual(0);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('positions increment correctly after a group of tied users', () => {
    fc.assert(
      fc.property(usersArrayArb, (users) => {
        const ranked = computeRanking(users);
        for (let i = 1; i < ranked.length; i++) {
          if (ranked[i].index < ranked[i - 1].index) {
            // Position should be i+1 (1-indexed)
            expect(ranked[i].position).toBe(i + 1);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});

// --- Property 10: TechMaster badge assignment ---
// **Validates: Requirements 5.5**

describe('Property 10: TechMaster badge assignment', () => {
  it('isTechMaster is true if and only if user has at least one skill with level 5', () => {
    fc.assert(
      fc.property(usersArrayArb, (users) => {
        const ranked = computeRanking(users);
        for (const entry of ranked) {
          const hasLevel5 = entry.user.skills.some((s) => s.level === 5);
          expect(entry.isTechMaster).toBe(hasLevel5);
        }
      }),
      { numRuns: 100 }
    );
  });
});
