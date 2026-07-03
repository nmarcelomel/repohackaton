/**
 * API Client — Engineering Intelligence Platform.
 * Consume el backend FastAPI en localhost:8000.
 */

const API_BASE = "http://localhost:8000/api/v1";

let authToken: string | null = localStorage.getItem("auth_token");

export function setAuthToken(token: string | null) {
 authToken = token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
 const stored = localStorage.getItem("auth_token");
 const token = authToken || stored;
 const headers: Record<string, string> = { "Content-Type": "application/json" };
 if (token) headers["Authorization"] = `Bearer ${token}`;

 const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...options.headers } });
 if (!res.ok) {
  const error = await res.json().catch(() => ({ detail: "Error de red" }));
  const detail = error.detail;
  const message = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((d: { msg?: string }) => d.msg || "Error").join(". ") : `HTTP ${res.status}`;
  throw new Error(message);
 }
 if (res.status === 204) return undefined as T;
 return res.json();
}

// === Auth ===
export async function login(email: string, password: string): Promise<{ access_token: string }> {
 return request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

// === Teams ===
export interface ApiTeam {
 id: string;
 name: string;
 wip_limit: number;
 capacity_points: number;
}
export async function fetchTeams(): Promise<ApiTeam[]> {
 return request("/teams");
}

// === Dashboard ===
export interface ApiDashboardAlert {
 team_id: string;
 team_name: string;
 message: string;
 severity: string;
}
export interface ApiDashboardTeamRank {
 team_id: string;
 team_name: string;
 deploy_freq: number;
 cycle_time_p50: number;
 change_failure_rate: number;
 score: number;
}
export interface ApiDashboard {
 avg_deploy_freq: number;
 avg_cycle_time_p50: number;
 wip_overloaded_count: number;
 pending_demands_count: number;
 pending_deps_count: number;
 alerts: ApiDashboardAlert[];
 team_ranking: ApiDashboardTeamRank[];
}
export async function fetchDashboard(): Promise<ApiDashboard> {
 return request("/dashboard");
}

// === DevEx ===
export interface ApiDevExPayload {
 user_id: string;
 team_id: string;
 period: string;
 facilidad_deploy: number;
 feedback_pr: number;
 interrupciones: number;
 claridad_reqs: number;
 satisfaccion_herramientas: number;
}
export async function submitDevEx(data: ApiDevExPayload): Promise<unknown> {
 return request("/devex/responses", { method: "POST", body: JSON.stringify(data) });
}

export interface ApiDevExResults {
 team_id: string;
 total_responses: number;
 avg_facilidad_deploy: number;
 avg_feedback_pr: number;
 avg_interrupciones: number;
 avg_claridad_reqs: number;
 avg_satisfaccion_herramientas: number;
 overall_score: number;
 [key: string]: string | number;
}
export async function fetchDevExResults(teamId: string): Promise<ApiDevExResults> {
 return request(`/devex/results?team_id=${teamId}`);
}

// === Predictability ===
export interface ApiPredictabilityPayload {
 team_id: string;
 period_name: string;
 items_committed: number;
 items_completed: number;
 deviation_cause: string;
}
export async function submitPredictability(data: ApiPredictabilityPayload): Promise<unknown> {
 return request("/predictability", { method: "POST", body: JSON.stringify(data) });
}

export interface ApiPredictabilityRecord {
 id: number;
 team_id: string;
 period_name: string;
 items_committed: number;
 items_completed: number;
 predictability_pct: number;
 deviation_cause: string;
 created_at: string;
}
export async function fetchPredictability(teamId: string): Promise<ApiPredictabilityRecord[]> {
 return request(`/predictability?team_id=${teamId}`);
}

// === Executive Report ===
export interface ApiDoraTableRow {
 team_id: string;
 team_name: string;
 deploy_freq: number;
 lead_time_hours: number;
 change_failure_rate: number;
 mttr_hours: number;
 benchmark: string;
}
export interface ApiBottleneck {
 description: string;
 team_name: string;
 impact: string;
 severity: string;
}
export interface ApiAllocationBalance {
 category: string;
 actual_pct: number;
 target_pct: number;
}
export interface ApiExecutiveReport {
 dora_table: ApiDoraTableRow[];
 bottlenecks: ApiBottleneck[];
 allocation_balance: ApiAllocationBalance[];
 recommendations: string[];
}
export async function fetchExecutiveReport(): Promise<ApiExecutiveReport> {
 return request("/report/executive");
}

// === Lead Time Breakdown ===
export interface ApiLeadTimeBreakdown {
 items_analyzed: number;
 avg_concept_to_commit_hours: number;
 avg_commit_to_deploy_hours: number;
 avg_deploy_to_value_hours: number;
 total_avg_lead_time_hours: number;
}
export async function fetchLeadTimeBreakdown(teamId: string): Promise<ApiLeadTimeBreakdown> {
 return request(`/flow/${teamId}/lead-time-breakdown`);
}

// === DORA ===
export interface ApiDoraMetric {
 id: number;
 team_id: string;
 week_start: string;
 deployment_frequency: number;
 lead_time_hours: number;
 change_failure_rate: number;
 mttr_hours: number;
 deployment_rework_rate: number;
}
export interface ApiDoraSummary {
 team_id: string;
 team_name: string;
 current: ApiDoraMetric;
 trend: ApiDoraMetric[];
 benchmark: string;
}
export async function fetchDora(teamId: string): Promise<ApiDoraSummary> {
 return request(`/dora/${teamId}`);
}
export async function fetchAllDora(): Promise<ApiDoraSummary[]> {
 return request("/dora");
}

// === Flow ===
export interface ApiFlowMetrics {
 team_id: string;
 cycle_time: { p50: number; p85: number; p95: number; histogram: number[] };
 throughput: { week_start: string; items_completed: number }[];
 flow_efficiency_pct: number;
 cfd: { date: string; backlog: number; in_progress: number; review: number; testing: number; done: number }[];
 ai_cycle_time_avg: number;
 traditional_cycle_time_avg: number;
}
export async function fetchFlowMetrics(teamId: string): Promise<ApiFlowMetrics> {
 return request(`/flow/${teamId}`);
}

// === Demands ===
export interface ApiDemand {
 id: number;
 team_id: string;
 title: string;
 requester: string;
 business_value: number;
 urgency: number;
 size: number;
 wsjf_score: number;
 status: string;
 created_at: string;
}
export async function fetchDemands(teamId?: string): Promise<ApiDemand[]> {
 const query = teamId ? `?team_id=${teamId}` : "";
 return request(`/demands${query}`);
}
export async function createDemand(data: { team_id: string; title: string; requester: string; business_value: number; urgency: number; size: number }): Promise<ApiDemand> {
 return request("/demands", { method: "POST", body: JSON.stringify(data) });
}
export async function deleteDemand(id: number): Promise<void> {
 return request(`/demands/${id}`, { method: "DELETE" });
}

// === Capacity ===
export interface ApiCapacity {
 team_id: string;
 team_name: string;
 capacity_points: number;
 committed_points: number;
 utilization_pct: number;
 alert: string | null;
}
export async function fetchCapacity(): Promise<ApiCapacity[]> {
 return request("/capacity");
}

export interface ApiAllocation {
 id: number;
 team_id: string;
 period_start: string;
 period_end: string;
 features_pct: number;
 defects_pct: number;
 tech_debt_pct: number;
 risk_compliance_pct: number;
 alert: string | null;
}
export async function fetchAllocation(teamId: string): Promise<ApiAllocation[]> {
 return request(`/capacity/allocation/${teamId}`);
}

// === WIP ===
export interface ApiWipStatus {
 team_id: string;
 team_name: string;
 wip_current: number;
 wip_limit: number;
 is_overloaded: boolean;
 utilization_pct: number;
}
export async function fetchWipStatus(): Promise<ApiWipStatus[]> {
 return request("/wip");
}

// === Dependencies ===
export interface ApiDependency {
 id: number;
 requester_team_id: string;
 blocker_team_id: string;
 requester_team_name: string | null;
 blocker_team_name: string | null;
 item_description: string;
 created_at: string;
 resolved_at: string | null;
 is_resolved: boolean;
 days_waiting: number;
}
export async function fetchDependencies(resolved?: boolean): Promise<ApiDependency[]> {
 const query = resolved !== undefined ? `?resolved=${resolved}` : "";
 return request(`/dependencies${query}`);
}
export async function resolveDependency(id: number): Promise<ApiDependency> {
 return request(`/dependencies/${id}/resolve`, { method: "PATCH" });
}

// === Summary ===
export interface ApiSummary {
 status: string;
 kpi_principal: string;
 trend: string;
 alerts_count: number;
}
export async function fetchSummary(): Promise<ApiSummary> {
 return request("/flujo/summary");
}
