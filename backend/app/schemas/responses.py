"""Schemas Pydantic para request/response de la API."""

from datetime import date, datetime
from pydantic import BaseModel, Field
from typing import Optional


# === Auth ===

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    team_id: Optional[str] = None

    class Config:
        from_attributes = True


# === Teams ===

class TeamResponse(BaseModel):
    id: str
    name: str
    wip_limit: int
    capacity_points: int

    class Config:
        from_attributes = True


# === DORA Metrics ===

class DoraMetricResponse(BaseModel):
    id: int
    team_id: str
    week_start: date
    deployment_frequency: float
    lead_time_hours: float
    change_failure_rate: float
    mttr_hours: float
    deployment_rework_rate: float

    class Config:
        from_attributes = True


class DoraSummaryResponse(BaseModel):
    team_id: str
    team_name: str
    current: DoraMetricResponse
    trend: list[DoraMetricResponse]
    benchmark: str  # Elite / High / Medium / Low


# === Flow Metrics ===

class FlowItemResponse(BaseModel):
    id: int
    team_id: str
    title: str
    category: str
    stage: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cycle_time_hours: Optional[float] = None
    is_ai_assisted: bool
    concept_to_commit_hours: Optional[float] = None
    commit_to_deploy_hours: Optional[float] = None
    deploy_to_value_hours: Optional[float] = None

    class Config:
        from_attributes = True


class CycleTimeStats(BaseModel):
    p50: float
    p85: float
    p95: float
    histogram: list[float]


class ThroughputWeek(BaseModel):
    week_start: date
    items_completed: int


class CfdDataPoint(BaseModel):
    date: date
    backlog: int
    in_progress: int
    review: int
    testing: int
    done: int


class FlowMetricsResponse(BaseModel):
    team_id: str
    cycle_time: CycleTimeStats
    throughput: list[ThroughputWeek]
    flow_efficiency_pct: float
    cfd: list[CfdDataPoint]
    ai_cycle_time_avg: float
    traditional_cycle_time_avg: float


# === Demand ===

class DemandCreateRequest(BaseModel):
    team_id: str
    title: str
    requester: str
    business_value: int = Field(ge=1, le=10)
    urgency: int = Field(ge=1, le=10)
    size: int = Field(ge=1, le=10)


class DemandUpdateRequest(BaseModel):
    title: Optional[str] = None
    business_value: Optional[int] = Field(None, ge=1, le=10)
    urgency: Optional[int] = Field(None, ge=1, le=10)
    size: Optional[int] = Field(None, ge=1, le=10)
    status: Optional[str] = None


class DemandResponse(BaseModel):
    id: int
    team_id: str
    title: str
    requester: str
    business_value: int
    urgency: int
    size: int
    wsjf_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# === Capacity & Allocation ===

class CapacityResponse(BaseModel):
    team_id: str
    team_name: str
    capacity_points: int
    committed_points: int
    utilization_pct: float
    alert: Optional[str] = None  # "overloaded" | "underutilized" | None


class AllocationResponse(BaseModel):
    id: int
    team_id: str
    period_start: date
    period_end: date
    features_pct: float
    defects_pct: float
    tech_debt_pct: float
    risk_compliance_pct: float
    alert: Optional[str] = None

    class Config:
        from_attributes = True


# === WIP ===

class WipStatusResponse(BaseModel):
    team_id: str
    team_name: str
    wip_current: int
    wip_limit: int
    is_overloaded: bool
    utilization_pct: float


# === Dependencies ===

class DependencyCreateRequest(BaseModel):
    requester_team_id: str
    blocker_team_id: str
    item_description: str


class DependencyResponse(BaseModel):
    id: int
    requester_team_id: str
    blocker_team_id: str
    requester_team_name: Optional[str] = None
    blocker_team_name: Optional[str] = None
    item_description: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    is_resolved: bool
    days_waiting: int

    class Config:
        from_attributes = True


# === Executive Summary (RT-10) ===

class ModuleSummaryResponse(BaseModel):
    status: str  # "healthy" | "warning" | "critical"
    kpi_principal: str
    trend: str  # "up" | "down" | "stable"
    alerts_count: int
