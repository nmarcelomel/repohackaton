// Feature: talento-module, Property 1: Expert search filter correctness
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterUsersBySkill } from '../talento-utils';
import type { User, Skill } from '../../../types';

/**
 * **Validates: Requirements 1.2**
 *
 * Property 1: Expert search filter correctness
 * For any non-empty search string and any set of users with skills,
 * filterUsersBySkill SHALL return:
 * - Only users who possess at least one skill whose name contains the search string
 *   as a case-insensitive substring (correctness / no false positives)
 * - ALL such users from the input set (completeness / no false negatives)
 */

// Generator for a skill with alphanumeric name and level 1-5
const skillArb: fc.Arbitrary<Skill> = fc.record({
  name: fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/),
  level: fc.integer({ min: 1, max: 5 }) as fc.Arbitrary<1 | 2 | 3 | 4 | 5>,
});

// Generator for a user with random skills
const userArb: fc.Arbitrary<User> = fc.record({
  id: fc.uuid(),
  name: fc.stringMatching(/^[a-zA-Z ]{1,30}$/),
  role: fc.stringMatching(/^[a-zA-Z ]{1,20}$/),
  teamId: fc.uuid(),
  skills: fc.array(skillArb, { minLength: 0, maxLength: 8 }),
});

// Generator for a non-empty alphanumeric search term
const searchTermArb: fc.Arbitrary<string> = fc.stringMatching(/^[a-zA-Z0-9]{1,10}$/);

describe('Property 1: Expert search filter correctness', () => {
  it('should return only users with matching skills and never omit matching users', () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 1, maxLength: 20 }),
        searchTermArb,
        (users, searchTerm) => {
          const result = filterUsersBySkill(users, searchTerm);
          const termLower = searchTerm.toLowerCase();

          // Helper: check if a user has at least one skill matching the search term
          const hasMatchingSkill = (user: User): boolean =>
            user.skills.some((skill) =>
              skill.name.toLowerCase().includes(termLower)
            );

          // Correctness: every user in the result actually has a matching skill (no false positives)
          for (const user of result) {
            expect(hasMatchingSkill(user)).toBe(true);
          }

          // Completeness: every user in the original array that has a matching skill IS in the result (no false negatives)
          for (const user of users) {
            if (hasMatchingSkill(user)) {
              expect(result).toContain(user);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
