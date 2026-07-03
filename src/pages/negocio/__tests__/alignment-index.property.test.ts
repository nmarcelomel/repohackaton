import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { calculateAlignmentIndex } from "../negocio-utils";
import type { Initiative } from "../../../types";

/**
 * Feature: negocio-value-realization, Property 3: Strategic alignment index calculation
 * Validates: Requirements 2.2, 2.4, 2.6
 */
describe("Property 3: Strategic Alignment Index Calculation", () => {
  const initiativeArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    teamId: fc.uuid(),
    projectedValue: fc.integer({ min: 0, max: 10000 }),
    actualValue: fc.integer({ min: 0, max: 10000 }),
    status: fc.constantFrom(
      "en_progreso" as const,
      "completada" as const,
      "en_riesgo" as const
    ),
  });

  it("should return 0 when total projected value is 0", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            teamId: fc.uuid(),
            projectedValue: fc.constant(0),
            actualValue: fc.integer({ min: 0, max: 10000 }),
            status: fc.constantFrom(
              "en_progreso" as const,
              "completada" as const,
              "en_riesgo" as const
            ),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (initiatives: Initiative[]) => {
          const result = calculateAlignmentIndex(initiatives);
          expect(result).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should calculate alignment index as (alignedValue / totalValue) * 100", () => {
    fc.assert(
      fc.property(
        fc.array(initiativeArb, { minLength: 1, maxLength: 20 }),
        (initiatives: Initiative[]) => {
          const totalValue = initiatives.reduce(
            (sum, i) => sum + i.projectedValue,
            0
          );
          const alignedValue = initiatives
            .filter(
              (i) => i.status === "completada" || i.status === "en_progreso"
            )
            .reduce((sum, i) => sum + i.projectedValue, 0);

          const result = calculateAlignmentIndex(initiatives);

          if (totalValue === 0) {
            expect(result).toBe(0);
          } else {
            const expected = (alignedValue / totalValue) * 100;
            expect(Math.abs(result - expected)).toBeLessThan(0.0001);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return 100 when all initiatives are aligned (completada or en_progreso)", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            teamId: fc.uuid(),
            projectedValue: fc.integer({ min: 1, max: 10000 }),
            actualValue: fc.integer({ min: 0, max: 10000 }),
            status: fc.constantFrom(
              "en_progreso" as const,
              "completada" as const
            ),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (initiatives: Initiative[]) => {
          const result = calculateAlignmentIndex(initiatives);
          expect(Math.abs(result - 100)).toBeLessThan(0.0001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return 0 when all initiatives are en_riesgo with non-zero projected values", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            teamId: fc.uuid(),
            projectedValue: fc.integer({ min: 1, max: 10000 }),
            actualValue: fc.integer({ min: 0, max: 10000 }),
            status: fc.constant("en_riesgo" as const),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (initiatives: Initiative[]) => {
          const result = calculateAlignmentIndex(initiatives);
          expect(result).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
