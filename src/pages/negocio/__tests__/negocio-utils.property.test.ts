import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { truncateName, getFulfillmentColor } from "../negocio-utils";

/**
 * Feature: negocio-value-realization, Property 1: Name truncation preserves short names and clips long ones
 * **Validates: Requirements 1.1**
 */
describe("Feature: negocio-value-realization, Property 1: Name truncation preserves short names and clips long ones", () => {
  it("should return the input unchanged when length <= 20", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 20 }),
        (s) => {
          expect(truncateName(s)).toBe(s);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should truncate to exactly 20 characters when input length > 20", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 21, maxLength: 200 }),
        (s) => {
          const result = truncateName(s);
          expect(result.length).toBe(20);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should end with ellipsis (U+2026) when input length > 20", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 21, maxLength: 200 }),
        (s) => {
          const result = truncateName(s);
          expect(result.endsWith("\u2026")).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve the first 17 characters of the original string when truncated", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 21, maxLength: 200 }),
        (s) => {
          const result = truncateName(s);
          expect(result.slice(0, 17)).toBe(s.slice(0, 17));
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: negocio-value-realization, Property 2: Fulfillment color matches threshold rules
 * Validates: Requirements 1.4, 1.5, 1.6, 1.10
 */
describe("Property 2: Fulfillment color matches threshold rules", () => {
  const RED = "#DC3545";
  const GREEN = "#00A651";
  const AMBER = "#FFC107";

  it("should return red when projectedValue is 0", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, noNaN: true, noDefaultInfinity: true }),
        (actualValue) => {
          const result = getFulfillmentColor(0, actualValue);
          expect(result).toBe(RED);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return green when fulfillment ratio >= 90%", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        fc.float({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
        (projectedValue, factor) => {
          // Generate actualValue such that ratio >= 90%
          // ratio = (actual / projected) * 100 >= 90
          // actual >= projected * 0.9
          const actualValue = projectedValue * (0.9 + factor * 0.1);
          const ratio = (actualValue / projectedValue) * 100;
          fc.pre(ratio >= 90);
          const result = getFulfillmentColor(projectedValue, actualValue);
          expect(result).toBe(GREEN);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return amber when fulfillment ratio is in [70, 90)", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        fc.float({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
        (projectedValue, factor) => {
          // Generate actualValue such that 70 <= ratio < 90
          // actual = projected * (0.7 + factor * 0.2) where factor in [0, 1)
          const actualValue = projectedValue * (0.7 + factor * 0.19999);
          const ratio = (actualValue / projectedValue) * 100;
          fc.pre(ratio >= 70 && ratio < 90);
          const result = getFulfillmentColor(projectedValue, actualValue);
          expect(result).toBe(AMBER);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return red when fulfillment ratio < 70%", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        fc.float({ min: 0, max: Math.fround(0.6999), noNaN: true, noDefaultInfinity: true }),
        (projectedValue, factor) => {
          // Generate actualValue such that ratio < 70%
          const actualValue = projectedValue * factor;
          const ratio = (actualValue / projectedValue) * 100;
          fc.pre(ratio < 70);
          const result = getFulfillmentColor(projectedValue, actualValue);
          expect(result).toBe(RED);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should always return one of the three valid colors for any non-negative inputs", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        fc.float({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        (projectedValue, actualValue) => {
          const result = getFulfillmentColor(projectedValue, actualValue);
          expect([RED, GREEN, AMBER]).toContain(result);
        }
      ),
      { numRuns: 100 }
    );
  });
});
