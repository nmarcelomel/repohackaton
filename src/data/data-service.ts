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
