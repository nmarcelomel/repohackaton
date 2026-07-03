import { describe, it, expect } from "vitest";
import {
  getAverageMood,
  calculateHealthScore,
  getCategoryEmoji,
  getUserName,
} from "../bienestar.utils";
import type { Team, User } from "../../../types";

/**
 * Unit Tests para funciones utilitarias del Módulo de Bienestar.
 * Patrón: Given / When / Then (Arrange / Act / Assert).
 * Requisitos validados: 2.1, 3.6, 5.1
 */

describe("getAverageMood", () => {
  it("retorna 3 (neutral por defecto) cuando memberMood está vacío", () => {
    // Given
    const team: Team = {
      id: "team-empty",
      name: "Empty Team",
      wipLimit: 5,
      wipCurrent: 2,
      doraMetrics: {
        deploymentFrequency: 10,
        leadTimeForChanges: 5,
        changeFailureRate: 10,
        mttr: 2,
      },
      memberMood: [],
    };

    // When
    const result = getAverageMood(team);

    // Then
    expect(result).toBe(3);
  });

  it("retorna el promedio correcto para valores conocidos ([excelente, bajo] → (5+2)/2 = 3.5)", () => {
    // Given
    const team: Team = {
      id: "team-known",
      name: "Known Team",
      wipLimit: 5,
      wipCurrent: 3,
      doraMetrics: {
        deploymentFrequency: 10,
        leadTimeForChanges: 5,
        changeFailureRate: 10,
        mttr: 2,
      },
      memberMood: [
        { userId: "u1", mood: "excelente", date: "2026-07-01" },
        { userId: "u2", mood: "bajo", date: "2026-07-01" },
      ],
    };

    // When
    const result = getAverageMood(team);

    // Then
    expect(result).toBe(3.5);
  });
});

describe("calculateHealthScore", () => {
  it("retorna un score alto para un equipo con valores perfectos", () => {
    // Given — mood=5 (all excelente), wip within limit, high deploy freq, low fail rate
    const team: Team = {
      id: "team-perfect",
      name: "Perfect Team",
      wipLimit: 10,
      wipCurrent: 5,
      doraMetrics: {
        deploymentFrequency: 15,
        leadTimeForChanges: 2,
        changeFailureRate: 0,
        mttr: 1,
      },
      memberMood: [
        { userId: "u1", mood: "excelente", date: "2026-07-01" },
        { userId: "u2", mood: "excelente", date: "2026-07-01" },
        { userId: "u3", mood: "excelente", date: "2026-07-01" },
      ],
    };

    // When
    const score = calculateHealthScore(team);

    // Then
    expect(score).toBeGreaterThanOrEqual(75);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("retorna un score bajo para un equipo con valores negativos", () => {
    // Given — mood=critico, wip way over limit, low deploy freq, high fail rate
    const team: Team = {
      id: "team-bad",
      name: "Struggling Team",
      wipLimit: 3,
      wipCurrent: 10,
      doraMetrics: {
        deploymentFrequency: 0,
        leadTimeForChanges: 30,
        changeFailureRate: 30,
        mttr: 10,
      },
      memberMood: [
        { userId: "u1", mood: "critico", date: "2026-07-01" },
        { userId: "u2", mood: "critico", date: "2026-07-01" },
        { userId: "u3", mood: "bajo", date: "2026-07-01" },
      ],
    };

    // When
    const score = calculateHealthScore(team);

    // Then
    expect(score).toBeLessThan(50);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("getCategoryEmoji", () => {
  it("mapea colaboracion → 🤝", () => {
    expect(getCategoryEmoji("colaboracion")).toBe("🤝");
  });

  it("mapea innovacion → 💡", () => {
    expect(getCategoryEmoji("innovacion")).toBe("💡");
  });

  it("mapea liderazgo → 🌟", () => {
    expect(getCategoryEmoji("liderazgo")).toBe("🌟");
  });

  it("mapea calidad → 🎯", () => {
    expect(getCategoryEmoji("calidad")).toBe("🎯");
  });
});

describe("getUserName", () => {
  const users: User[] = [
    {
      id: "user-01",
      name: "Carlos Martínez",
      role: "Tech Lead",
      teamId: "team-openfinance",
      skills: [{ name: "React", level: 5 }],
    },
    {
      id: "user-02",
      name: "Ana López",
      role: "Backend Developer",
      teamId: "team-openfinance",
      skills: [{ name: "Java", level: 5 }],
    },
  ];

  it("retorna el nombre del usuario cuando el ID es válido", () => {
    // Given
    const userId = "user-01";

    // When
    const name = getUserName(userId, users);

    // Then
    expect(name).toBe("Carlos Martínez");
  });

  it('retorna "Usuario" cuando el ID no existe', () => {
    // Given
    const userId = "user-nonexistent";

    // When
    const name = getUserName(userId, users);

    // Then
    expect(name).toBe("Usuario");
  });
});
