import mockData from "./mock-data.json";
import type { MockData, Team, User, Initiative, Kudos, MoodHistory, WellnessSuggestion } from "../types";

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

/** Obtiene el historial de ánimo semanal. */
export function getMoodHistory(): MoodHistory[] {
 return data.moodHistory;
}

/** Obtiene el historial de ánimo por equipo. */
export function getMoodHistoryByTeam(teamId: string): MoodHistory[] {
 return data.moodHistory.filter((m) => m.teamId === teamId);
}

/** Obtiene sugerencias de bienestar. */
export function getWellnessSuggestions(): WellnessSuggestion[] {
 return data.wellnessSuggestions;
}

/** Obtiene sugerencias por equipo. */
export function getWellnessSuggestionsByTeam(teamId: string): WellnessSuggestion[] {
 return data.wellnessSuggestions.filter((s) => s.teamId === teamId);
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
