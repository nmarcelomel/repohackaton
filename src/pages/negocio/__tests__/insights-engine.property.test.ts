import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { generateInsight, calculateFulfillmentRatio, STATUS_TO_INSIGHT_TYPE } from "../insights-engine";
import type { Initiative } from "../../../types";
import type { InsightType } from "../insights-engine";

/**
 * Custom arbitrary for valid Initiative objects.
 * Generates initiatives with constrained fields matching the Initiative interface.
 */
const initiativeArbitrary: fc.Arbitrary<Initiative> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  teamId: fc.string({ minLength: 1, maxLength: 50 }),
  projectedValue: fc.float({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
  actualValue: fc.float({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
  status: fc.constantFrom("en_progreso" as const, "completada" as const, "en_riesgo" as const),
});

/**
 * Feature: initiative-status-insights, Property 1: Status-to-insight-type consistency
 * **Validates: Requirements 2.1, 3.1, 4.1, 5.4, 5.5**
 */
describe("Feature: initiative-status-insights, Property 1: Status-to-insight-type consistency", () => {
  const EXPECTED_TITLES: Record<Initiative["status"], string> = {
    en_progreso: "Mejora Continua",
    en_riesgo: "Predicción de Riesgo",
    completada: "Resumen de Éxito",
  };

  it("should produce an InsightResult whose type equals STATUS_TO_INSIGHT_TYPE[initiative.status]", () => {
    fc.assert(
      fc.property(
        initiativeArbitrary,
        (initiative) => {
          const result = generateInsight(initiative);
          expect(result.type).toBe(STATUS_TO_INSIGHT_TYPE[initiative.status]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should produce an InsightResult whose title matches the expected title for the status", () => {
    fc.assert(
      fc.property(
        initiativeArbitrary,
        (initiative) => {
          const result = generateInsight(initiative);
          expect(result.title).toBe(EXPECTED_TITLES[initiative.status]);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: initiative-status-insights, Property 2: Fulfillment ratio formula correctness
 * **Validates: Requirements 5.2**
 */
describe("Feature: initiative-status-insights, Property 2: Fulfillment ratio formula correctness", () => {
  it("should return (actualValue / projectedValue) * 100 when projectedValue > 0", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 100000, noNaN: true }),
        fc.double({ min: 0, max: 100000, noNaN: true }),
        (projectedValue, actualValue) => {
          const result = calculateFulfillmentRatio(projectedValue, actualValue);
          const expected = (actualValue / projectedValue) * 100;
          expect(Math.abs(result - expected)).toBeLessThan(1e-9);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return 0 when projectedValue is 0 or less", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100000, noNaN: true }),
        (actualValue) => {
          const result = calculateFulfillmentRatio(0, actualValue);
          expect(result).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Custom arbitrary for valid Initiative objects with projectedValue including 0 as edge case.
 */
const initiativeWithZeroEdgeCaseArb: fc.Arbitrary<Initiative> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  teamId: fc.string({ minLength: 1, maxLength: 50 }),
  projectedValue: fc.oneof(
    fc.constant(0),
    fc.float({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true })
  ),
  actualValue: fc.float({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
  status: fc.constantFrom("en_progreso" as const, "completada" as const, "en_riesgo" as const),
});

/**
 * Feature: initiative-status-insights, Property 3: Structural completeness of InsightResult
 * **Validates: Requirements 5.3**
 */
describe("Feature: initiative-status-insights, Property 3: Structural completeness of InsightResult", () => {
  const VALID_INSIGHT_TYPES: InsightType[] = ["improvement", "risk_prediction", "success_summary"];

  it("result.title is a non-empty string for any valid Initiative", () => {
    fc.assert(
      fc.property(initiativeWithZeroEdgeCaseArb, (initiative: Initiative) => {
        const result = generateInsight(initiative);
        expect(typeof result.title).toBe("string");
        expect(result.title.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("result.description is a non-empty string for any valid Initiative", () => {
    fc.assert(
      fc.property(initiativeWithZeroEdgeCaseArb, (initiative: Initiative) => {
        const result = generateInsight(initiative);
        expect(typeof result.description).toBe("string");
        expect(result.description.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("result.metrics is a non-empty array for any valid Initiative", () => {
    fc.assert(
      fc.property(initiativeWithZeroEdgeCaseArb, (initiative: Initiative) => {
        const result = generateInsight(initiative);
        expect(Array.isArray(result.metrics)).toBe(true);
        expect(result.metrics.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("each metric has non-empty label and value for any valid Initiative", () => {
    fc.assert(
      fc.property(initiativeWithZeroEdgeCaseArb, (initiative: Initiative) => {
        const result = generateInsight(initiative);
        for (const metric of result.metrics) {
          expect(typeof metric.label).toBe("string");
          expect(metric.label.length).toBeGreaterThan(0);
          expect(typeof metric.value).toBe("string");
          expect(metric.value.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("result.recommendation is a non-empty string for any valid Initiative", () => {
    fc.assert(
      fc.property(initiativeWithZeroEdgeCaseArb, (initiative: Initiative) => {
        const result = generateInsight(initiative);
        expect(typeof result.recommendation).toBe("string");
        expect(result.recommendation.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("result.type is one of the valid InsightType values for any valid Initiative", () => {
    fc.assert(
      fc.property(initiativeWithZeroEdgeCaseArb, (initiative: Initiative) => {
        const result = generateInsight(initiative);
        expect(VALID_INSIGHT_TYPES).toContain(result.type);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: initiative-status-insights, Property 4: In-progress threshold-based suggestions
 * **Validates: Requirements 2.2, 2.3, 2.4**
 */
describe("Feature: initiative-status-insights, Property 4: In-progress threshold-based suggestions", () => {
  /**
   * Generator: Initiative with status fixed to "en_progreso" and projectedValue > 0.
   * actualValue >= 0 to keep things simple (implementation treats negatives as 0).
   */
  const inProgressInitiativeArbitrary: fc.Arbitrary<Initiative> = fc.double({
    min: 1,
    max: 1_000_000,
    noNaN: true,
    noDefaultInfinity: true,
  }).chain((projectedValue) =>
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      teamId: fc.string({ minLength: 1, maxLength: 20 }),
      projectedValue: fc.constant(projectedValue),
      actualValue: fc.double({ min: 0, max: projectedValue * 2, noNaN: true, noDefaultInfinity: true }),
      status: fc.constant("en_progreso" as const),
    })
  );

  it("should contain 'camino óptimo' when fulfillment ratio >= 90%", () => {
    fc.assert(
      fc.property(
        inProgressInitiativeArbitrary,
        (initiative) => {
          const ratio = (initiative.actualValue / initiative.projectedValue) * 100;
          if (ratio >= 90) {
            const result = generateInsight(initiative);
            expect(result.description).toContain("camino óptimo");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should contain 'brecha moderada' when fulfillment ratio is in [70, 90)", () => {
    fc.assert(
      fc.property(
        inProgressInitiativeArbitrary,
        (initiative) => {
          const ratio = (initiative.actualValue / initiative.projectedValue) * 100;
          if (ratio >= 70 && ratio < 90) {
            const result = generateInsight(initiative);
            expect(result.description).toContain("brecha moderada");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should contain 'brecha significativa' when fulfillment ratio < 70%", () => {
    fc.assert(
      fc.property(
        inProgressInitiativeArbitrary,
        (initiative) => {
          const ratio = (initiative.actualValue / initiative.projectedValue) * 100;
          if (ratio < 70) {
            const result = generateInsight(initiative);
            expect(result.description).toContain("brecha significativa");
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: initiative-status-insights, Property 5: At-risk threshold-based diagnosis
 * **Validates: Requirements 3.2, 3.3, 3.4, 3.5**
 */
describe("Feature: initiative-status-insights, Property 5: At-risk threshold-based diagnosis", () => {
  /**
   * Generator: Initiative with status fixed to "en_riesgo" and projectedValue > 0.
   * actualValue is generated as a double from 0 to projectedValue * 2 to cover all ratio ranges.
   */
  const atRiskInitiativeArbitrary: fc.Arbitrary<Initiative> = fc.double({
    min: 1,
    max: 10000,
    noNaN: true,
  }).chain((projectedValue) =>
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      teamId: fc.string({ minLength: 1, maxLength: 20 }),
      projectedValue: fc.constant(projectedValue),
      actualValue: fc.double({ min: 0, max: projectedValue * 2, noNaN: true }),
      status: fc.constant("en_riesgo" as const),
    })
  );

  it("should produce description matching fulfillment ratio threshold", () => {
    fc.assert(
      fc.property(
        atRiskInitiativeArbitrary,
        (initiative) => {
          const result = generateInsight(initiative);
          const ratio = (initiative.actualValue / initiative.projectedValue) * 100;

          if (ratio < 50) {
            expect(result.description).toContain("Desviación crítica de valor");
          } else if (ratio >= 50 && ratio < 70) {
            expect(result.description).toContain("Entrega de valor por debajo del objetivo");
          } else {
            // ratio >= 70: graceful handling
            expect(result.description).toContain("Riesgo moderado");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should include value gap formatted as currency in metrics", () => {
    fc.assert(
      fc.property(
        atRiskInitiativeArbitrary,
        (initiative) => {
          const result = generateInsight(initiative);

          const gapMetric = result.metrics.find(
            (m) => m.label === "Brecha de valor:"
          );
          expect(gapMetric).toBeDefined();
          expect(gapMetric!.value).toContain("de brecha");
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: initiative-status-insights, Property 6: Completed success/shortfall message
 * **Validates: Requirements 4.3, 4.4**
 */
describe("Feature: initiative-status-insights, Property 6: Completed success/shortfall message", () => {
  /**
   * Generator: Initiative with status fixed to "completada" and projectedValue > 0.
   * Uses chain to derive actualValue relative to projectedValue (0 to 2x).
   */
  const completedInitiativeArbitrary: fc.Arbitrary<Initiative> = fc.double({
    min: 1,
    max: 10000,
    noNaN: true,
    noDefaultInfinity: true,
  }).chain((projectedValue) =>
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      teamId: fc.string({ minLength: 1, maxLength: 20 }),
      projectedValue: fc.constant(projectedValue),
      actualValue: fc.double({ min: 0, max: projectedValue * 2, noNaN: true, noDefaultInfinity: true }),
      status: fc.constant("completada" as const),
    })
  );

  it("should contain 'superó' when actualValue >= projectedValue", () => {
    fc.assert(
      fc.property(
        completedInitiativeArbitrary,
        (initiative) => {
          if (initiative.actualValue >= initiative.projectedValue) {
            const result = generateInsight(initiative);
            expect(result.description).toContain("superó");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should contain 'alcanzó el' and the formatted ratio when actualValue < projectedValue", () => {
    fc.assert(
      fc.property(
        completedInitiativeArbitrary,
        (initiative) => {
          if (initiative.actualValue < initiative.projectedValue) {
            const result = generateInsight(initiative);
            const ratio = (initiative.actualValue / initiative.projectedValue) * 100;
            const formattedRatio = `${ratio.toFixed(1)}%`;

            expect(result.description).toContain("alcanzó el");
            expect(result.description).toContain(formattedRatio);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: initiative-status-insights, Property 7: Fulfillment ratio formatting in metrics
 * **Validates: Requirements 2.5, 4.2**
 */
describe("Feature: initiative-status-insights, Property 7: Fulfillment ratio formatting in metrics", () => {
  /**
   * Generator: Initiative with any valid status and projectedValue > 0.
   * projectedValue uses fc.double with min > 0 to guarantee a calculable ratio.
   * actualValue uses fc.double with min >= 0.
   */
  const initiativeWithPositiveProjectedArb: fc.Arbitrary<Initiative> = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    teamId: fc.string({ minLength: 1, maxLength: 50 }),
    projectedValue: fc.double({ min: 0.01, max: 100000, noNaN: true, noDefaultInfinity: true }),
    actualValue: fc.double({ min: 0, max: 100000, noNaN: true, noDefaultInfinity: true }),
    status: fc.constantFrom("en_progreso" as const, "completada" as const, "en_riesgo" as const),
  });

  it("metrics should contain an entry with label 'Cumplimiento actual:' whose value matches /^\\d+\\.\\d%$/", () => {
    fc.assert(
      fc.property(
        initiativeWithPositiveProjectedArb,
        (initiative) => {
          const result = generateInsight(initiative);

          // Find the metric with label "Cumplimiento actual:"
          const fulfillmentMetric = result.metrics.find(
            (m) => m.label === "Cumplimiento actual:"
          );

          // Must exist
          expect(fulfillmentMetric).toBeDefined();

          // Value must match pattern: one or more digits, a dot, exactly one digit, then %
          // e.g., "81.7%", "100.0%", "0.0%", "12345.6%"
          const formatRegex = /^\d+\.\d%$/;
          expect(fulfillmentMetric!.value).toMatch(formatRegex);
        }
      ),
      { numRuns: 100 }
    );
  });
});
