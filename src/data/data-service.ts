import mockData from "./mock-data.json";
import type { MockData, Team, User, Initiative, Kudos, ObservabilityMetrics } from "../types";

const data: MockData = mockData as MockData;

/** Obtiene todas las células/equipos. */
export function getTeams(): Team[] {
 return data.teams;
}

/** Obtiene todos los usuarios. */
export function getUsers(): User[] {
 return data.users;
}

/** Obtiene todas las iniciativas. */
export function getInitiatives(): Initiative[] {
 return data.initiatives;
}

/** Obtiene todos los kudos. */
export function getKudos(): Kudos[] {
 return data.kudos;
}

/** Obtiene un equipo por ID. */
export function getTeamById(teamId: string): Team | undefined {
 return data.teams.find((t) => t.id === teamId);
}

/** Obtiene usuarios por equipo. */
export function getUsersByTeam(teamId: string): User[] {
 return data.users.filter((u) => u.teamId === teamId);
}

/** Obtiene iniciativas por equipo. */
export function getInitiativesByTeam(teamId: string): Initiative[] {
 return data.initiatives.filter((i) => i.teamId === teamId);
}

/** Obtiene métricas de observabilidad para un equipo dado. */
export function getObservabilityMetrics(teamId: string): ObservabilityMetrics | undefined {
 const team = data.teams.find((t) => t.id === teamId);
 if (!team) return undefined;

 if (team.observabilityMetrics) {
  return team.observabilityMetrics;
 }

 const traditionalCycleTime = team.doraMetrics.leadTimeForChanges;
 const aiCycleTime = Math.round(traditionalCycleTime * 0.7 * 10) / 10;

 return {
  deploymentFrequency: team.doraMetrics.deploymentFrequency,
  cycleTime: traditionalCycleTime,
  wipActual: team.wipCurrent,
  wipLimit: team.wipLimit,
  aiCycleTime,
  traditionalCycleTime,
 };
}

/** Obtiene historial de mood por equipo (simulado). */
export function getMoodHistoryByTeam(teamId: string) {
 const team = data.teams.find((t) => t.id === teamId);
 if (!team) return [];
 return [
  { week: "Sem 1", score: 3.8, avgMood: 3.8 },
  { week: "Sem 2", score: 4.0, avgMood: 4.0 },
  { week: "Sem 3", score: 3.6, avgMood: 3.6 },
  { week: "Sem 4", score: 4.2, avgMood: 4.2 },
 ];
}

/** Obtiene sugerencias de bienestar basadas en el mood del equipo. */
export function getWellnessSuggestions(_teamId?: string) {
 return [
  { id: "1", title: "Implementar no-meeting day", category: "focus", impact: "alto", type: "warning", message: "WIP elevado puede causar agotamiento", action: "Considerar reducir el trabajo en progreso", teamId: "team-siniestros" },
  { id: "2", title: "Sesión de retrospectiva de bienestar", category: "team", impact: "medio", type: "info", message: "El equipo reporta interrupciones frecuentes", action: "Implementar bloques de foco sin reuniones", teamId: "team-vida" },
  { id: "3", title: "Reducir WIP para disminuir multitasking", category: "flow", impact: "alto", type: "critical", message: "Mood bajo detectado 2 semanas consecutivas", action: "Agendar 1-on-1 con cada miembro del equipo", teamId: "team-siniestros" },
 ];
}
