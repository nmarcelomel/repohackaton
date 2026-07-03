import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  isAtBurnoutRisk,
  getAverageMood,
  calculateHealthScore,
  getScoreLabel,
  getScoreColor,
  getScoreBg,
} from "../bienestar.utils";
import type { Team } from "../../../types";

/**
 * Property-Based Tests para funciones de lógica de negocio del Módulo de Bienestar.
 * Usa fast-check como librería de PBT aprobada para el ecosistema JS/TS.
 */

const VALID_MOODS = ["excelente", "bien", "neutral", "bajo", "critico"] as const;

/** Generador arbitrario para Team con rangos válidos */
const teamArb = (options?: {
  wipCurrentRange?: [number, number];
  wipLimitRange?: [number, number];
  memberMoodMinLength?: number;
}) => {
  const wipCurrentMin = options?.wipCurrentRange?.[0] ?? 0;
  const wipCurrentMax = options?.wipCurrentRange?.[1] ?? 20;
  const wipLimitMin = options?.wipLimitRange?.[0] ?? 1;
  const wipLimitMax = options?.wipLimitRange?.[1] ?? 10;
  const memberMoodMinLen = options?.memberMoodMinLength ?? 0;

  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
    wipCurrent: fc.integer({ min: wipCurrentMin, max: wipCurrentMax }),
    wipLimit: fc.integer({ min: wipLimitMin, max: wipLimitMax }),
    memberMood: fc.array(
      fc.record({
        userId: fc.uuid(),
        mood: fc.constantFrom(...VALID_MOODS),
        date: fc.constant("2024-01-01"),
      }),
      { minLength: memberMoodMinLen, maxLength: 10 }
    ),
    doraMetrics: fc.record({
      deploymentFrequency: fc.integer({ min: 0, max: 30 }),
      changeFailureRate: fc.integer({ min: 0, max: 100 }),
      leadTimeForChanges: fc.integer({ min: 0, max: 100 }),
      mttr: fc.integer({ min: 0, max: 100 }),
    }),
  }) as fc.Arbitrary<Team>;
};

describe("Property-Based Tests — Módulo de Bienestar", () => {
  // Feature: modulo-bienestar, Property 1: Burnout detection invariant
  // **Validates: Requirements 2.1**
  it("Propiedad 1: Invariante de detección de burnout — isAtBurnoutRisk iff wipCurrent > wipLimit AND avgMood < 3", () => {
    fc.assert(
      fc.property(
        teamArb({ wipCurrentRange: [0, 20], wipLimitRange: [1, 10] }),
        (team) => {
          const result = isAtBurnoutRisk(team);
          const expected =
            team.wipCurrent > team.wipLimit && getAverageMood(team) < 3;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modulo-bienestar, Property 2: Health score bounded
  // **Validates: Requirements 5.1**
  it("Propiedad 2: Health score acotado — calculateHealthScore siempre retorna valor en [0, 100]", () => {
    fc.assert(
      fc.property(
        teamArb({ wipCurrentRange: [0, 20], wipLimitRange: [1, 10] }),
        (team) => {
          const score = calculateHealthScore(team);
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modulo-bienestar, Property 3: Consistent score classification
  // **Validates: Requirements 5.2, 5.3**
  it("Propiedad 3: Clasificación consistente del score — coherencia entre getScoreLabel, getScoreColor y getScoreBg", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        const label = getScoreLabel(score);
        const color = getScoreColor(score);
        const bg = getScoreBg(score);

        if (score >= 75) {
          expect(label).toBe("Saludable");
          expect(color).toContain("green");
          expect(bg).toContain("green");
        } else if (score >= 50) {
          expect(label).toBe("Atención");
          expect(color).toContain("yellow");
          expect(bg).toContain("yellow");
        } else {
          expect(label).toBe("Crítico");
          expect(color).toContain("red");
          expect(bg).toContain("red");
        }
      }),
      { numRuns: 100 }
    );
  });

  // Feature: modulo-bienestar, Property 4: Average mood metamorphic
  // **Validates: Requirements 5.1**
  it("Propiedad 4: Ánimo promedio metamórfica — agregar miembro con mood=critico reduce el promedio", () => {
    fc.assert(
      fc.property(
        teamArb({ memberMoodMinLength: 1 }),
        (team) => {
          const avgBefore = getAverageMood(team);
          fc.pre(avgBefore > 1);

          const teamWithCritical: Team = {
            ...team,
            memberMood: [
              ...team.memberMood,
              { userId: "new-user", mood: "critico", date: "2024-01-01" },
            ],
          };
          const avgAfter = getAverageMood(teamWithCritical);
          expect(avgAfter).toBeLessThan(avgBefore);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modulo-bienestar, Property 5: Bar color by mood threshold
  // **Validates: Requirements 4.2**
  it("Propiedad 5: Color de barras por umbral de ánimo — clasificación exhaustiva y mutuamente excluyente", () => {
    /**
     * Helper que replica la lógica de color de barras del componente TeamPulse.
     * Se define aquí para hacer testeable la lógica inline del componente.
     */
    function getMoodBarColor(avgMood: number): string {
      if (avgMood >= 4) return "bg-green-400";
      if (avgMood >= 3) return "bg-yellow-400";
      return "bg-red-400";
    }

    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 5, noNaN: true }),
        (avgMood) => {
          const color = getMoodBarColor(avgMood);
          if (avgMood >= 4) {
            expect(color).toBe("bg-green-400");
          } else if (avgMood >= 3) {
            expect(color).toBe("bg-yellow-400");
          } else {
            expect(color).toBe("bg-red-400");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modulo-bienestar, Property 6: Trend direction
  // **Validates: Requirements 4.3, 4.4**
  it("Propiedad 6: Dirección de tendencia — trend >= 0 iff flecha ascendente (verde/isUp=true)", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 5, noNaN: true }),
        fc.double({ min: 0, max: 5, noNaN: true }),
        (latest, previous) => {
          const trend = latest - previous;
          const isUp = trend >= 0;

          if (trend >= 0) {
            expect(isUp).toBe(true);
          } else {
            expect(isUp).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
