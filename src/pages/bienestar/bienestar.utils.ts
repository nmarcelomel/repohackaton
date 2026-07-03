import type { Team, User, Kudos } from "../../types";

export const MOOD_SCORE: Record<string, number> = {
  excelente: 5,
  bien: 4,
  neutral: 3,
  bajo: 2,
  critico: 1,
};

/** Calcula el ánimo promedio del equipo basado en memberMood. Retorna 3 si no hay miembros. */
export function getAverageMood(team: Team): number {
  if (team.memberMood.length === 0) return 3;
  const total = team.memberMood.reduce(
    (sum, m) => sum + (MOOD_SCORE[m.mood] || 3),
    0
  );
  return total / team.memberMood.length;
}

/** Calcula un health score compuesto (0-100) basado en ánimo, WIP y DORA. */
export function calculateHealthScore(team: Team): number {
  const moodScore = (getAverageMood(team) / 5) * 40;
  const wipRatio = Math.min(team.wipCurrent / team.wipLimit, 2);
  const wipScore = (1 - (wipRatio - 1) / 1) * 30;
  const doraScore =
    ((Math.min(team.doraMetrics.deploymentFrequency, 15) / 15) * 15 +
      (1 - Math.min(team.doraMetrics.changeFailureRate, 30) / 30) * 15);
  return Math.max(0, Math.min(100, Math.round(moodScore + wipScore + doraScore)));
}

/** Determina si un equipo está en riesgo de burnout (WIP excedido y ánimo bajo). */
export function isAtBurnoutRisk(team: Team): boolean {
  return team.wipCurrent > team.wipLimit && getAverageMood(team) < 3;
}

/** Retorna la clase CSS de color de texto según el score de salud. */
export function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

/** Retorna las clases CSS de fondo según el score de salud. */
export function getScoreBg(score: number): string {
  if (score >= 75) return "bg-green-100 border-green-200";
  if (score >= 50) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

/** Retorna la etiqueta descriptiva según el score de salud. */
export function getScoreLabel(score: number): string {
  if (score >= 75) return "Saludable";
  if (score >= 50) return "Atención";
  return "Crítico";
}

/** Retorna el emoji correspondiente a la categoría de un Kudo. */
export function getCategoryEmoji(category: Kudos["category"]): string {
  const map: Record<Kudos["category"], string> = {
    colaboracion: "🤝",
    innovacion: "💡",
    liderazgo: "🌟",
    calidad: "🎯",
  };
  return map[category];
}

/** Busca el nombre de un usuario por ID. Retorna "Usuario" si no se encuentra. */
export function getUserName(userId: string, users: User[]): string {
  return users.find((u) => u.id === userId)?.name || "Usuario";
}
