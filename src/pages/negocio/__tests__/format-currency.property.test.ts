import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { formatCurrency } from "../negocio-utils";

/**
 * **Validates: Requirements 1.8, 5.1**
 */
describe("Feature: negocio-value-realization, Property 6: Monetary value formatting", () => {
  it("should start with $ and end with M", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999999999 }),
        (n) => {
          const result = formatCurrency(n);
          expect(result.startsWith("$")).toBe(true);
          expect(result.endsWith("M")).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should have a numeric middle portion matching comma-separated thousands pattern", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999999999 }),
        (n) => {
          const result = formatCurrency(n);
          const middle = result.slice(1, -1); // Remove $ and M
          expect(middle).toMatch(/^\d{1,3}(,\d{3})*$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should represent the same numeric value as the input (rounded to integer)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999999999 }),
        (n) => {
          const result = formatCurrency(n);
          const middle = result.slice(1, -1); // Remove $ and M
          const parsed = Number(middle.replace(/,/g, ""));
          expect(parsed).toBe(Math.round(n));
        }
      ),
      { numRuns: 100 }
    );
  });
});
