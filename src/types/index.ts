﻿export interface DoraMetrics {
 deploymentFrequency: number;
 leadTimeForChanges: number;
 changeFailureRate: number;
 mttr: number;
}

export interface MemberMood {
 userId: string;
 mood: "excelente" | "bien" | "neutral" | "bajo" | "critico";
 date: string;
}

export interface Team {
 id: string;
 name: string;
 wipLimit: number;
 wipCurrent: number;
 doraMetrics: DoraMetrics;
 observabilityMetrics?: ObservabilityMetrics;
 memberMood: MemberMood[];
 previousLeadTimeForChanges?: number;
}

export interface Skill {
 name: string;
 level: 1 | 2 | 3 | 4 | 5;
}

export interface User {
 id: string;
 name: string;
 role: string;
 teamId: string;
 skills: Skill[];
 avatar?: string;
}

export interface Initiative {
 id: string;
 name: string;
 teamId: string;
 projectedValue: number;
 actualValue: number;
 status: "en_progreso" | "completada" | "en_riesgo";
}

export interface Kudos {
 id: string;
 fromUserId: string;
 toUserId: string;
 message: string;
 category: "colaboracion" | "innovacion" | "liderazgo" | "calidad";
 date: string;
}

export interface ObservabilityMetrics {
 deploymentFrequency: number;
 cycleTime: number;
 wipActual: number;
 wipLimit: number;
 aiCycleTime: number;
 traditionalCycleTime: number;
}

export interface TeamOverloadState {
 teamId: string;
 isOverloaded: boolean;
}

export interface TeamStateContextType {
 teamStates: TeamOverloadState[];
 updateTeamOverloadState: (teamId: string, isOverloaded: boolean) => void;
 isTeamOverloaded: (teamId: string) => boolean;
}

export interface MockData {
 teams: Team[];
 users: User[];
 initiatives: Initiative[];
 kudos: Kudos[];
}
