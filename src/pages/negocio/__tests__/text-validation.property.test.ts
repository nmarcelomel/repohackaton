import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { validateTextField } from "../negocio-utils";

describe("Feature: negocio-value-realization, Property 4: Text field validation accepts non-empty trimmed strings within max length", () => {
  /**
   * **Validates: Requirements 3.2, 3.3, 3.5**
   */

  it("should return null (valid) for non-empty trimmed strings within maxLen", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        (maxLen) => {
          // Generate a valid string: non-empty trimmed, length within maxLen
          return fc.assert(
            fc.property(
              fc.string({ minLength: 1, maxLength: maxLen }).filter(s => s.trim().length >= 1 && s.trim().length <= maxLen),
              (s) => {
                expect(validateTextField(s, maxLen)).toBeNull();
              }
            ),
            { numRuns: 10 }
          );
        }
      ),
      { numRuns: 10 }
    );
  });

  it("should return error for whitespace-only strings", () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(" ", "\t", "\n", "\r"), { minLength: 0, maxLength: 50 }),
        fc.integer({ min: 1, max: 200 }),
        (s, maxLen) => {
          const result = validateTextField(s, maxLen);
          expect(result).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return error when trimmed length exceeds maxLen", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (maxLen) => {
          // Generate a string longer than maxLen (when trimmed)
          const longStr = "a".repeat(maxLen + 1);
          const result = validateTextField(longStr, maxLen);
          expect(result).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return null for valid inputs and non-null for invalid inputs (general property)", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 300 }),
        fc.integer({ min: 1, max: 200 }),
        (s, maxLen) => {
          const result = validateTextField(s, maxLen);
          const trimmed = s.trim();
          if (trimmed.length >= 1 && trimmed.length <= maxLen) {
            expect(result).toBeNull();
          } else {
            expect(result).not.toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
