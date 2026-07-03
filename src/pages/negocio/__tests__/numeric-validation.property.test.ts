import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { validateNumericField } from "../negocio-utils";

/**
 * **Validates: Requirements 3.4, 3.6**
 */
describe("Feature: negocio-value-realization, Property 5: Numeric value validation accepts only positive numbers in range with max 2 decimals", () => {
  it("should accept valid numbers in range with max 2 decimals", () => {
    // Generate integers 1-99999999 then divide by 100 to get values 0.01-999999.99 with max 2 decimals
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99999999 }),
        (n) => {
          const value = (n / 100).toFixed(2);
          const num = parseFloat(value);
          // Only test if in valid range
          fc.pre(num >= 0.01 && num <= 999999.99);
          expect(validateNumericField(value)).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject non-numeric strings", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => isNaN(Number(s.trim())) || s.trim() === ""),
        (s) => {
          const result = validateNumericField(s);
          expect(result).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject negative numbers", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -999999, max: -1 }),
        (n) => {
          const result = validateNumericField(n.toString());
          expect(result).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject zero", () => {
    expect(validateNumericField("0")).not.toBeNull();
    expect(validateNumericField("0.00")).not.toBeNull();
  });

  it("should reject values above 999999.99", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000000, max: 9999999 }),
        (n) => {
          const result = validateNumericField(n.toString());
          expect(result).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject values with more than 2 decimal places", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999 }),
        fc.integer({ min: 100, max: 999 }),  // 3 digits = 3 decimal places
        (intPart, decPart) => {
          const value = `${intPart}.${decPart}`;
          const result = validateNumericField(value);
          expect(result).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
