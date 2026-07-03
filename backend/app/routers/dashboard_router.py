"""Router de Dashboard consolidado."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.entities import (
    DoraMetric, FlowItem, FlowStage, Team, Demand, DemandStatus, Dependency,
)

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


class AlertItem(BaseModel):
    """Alerta individual del dashboard."""

    team_id: str
    team_name: str
    type: str  # "wip_overload" | "high_cfr" | "low_predictability" | "pending_dep"
    message: str
    severity: str  # "critical" | "warning" | "info"


class TeamRankingItem(BaseModel):
    """Ranking de equipo por score compuesto."""

    team_id: str
    team_name: str
    deploy_freq: float
    cycle_time_p50: float
    score: float


class DashboardResponse(BaseModel):
    """Response consolidado del dashboard ejecutivo."""

    avg_deploy_freq: float
    avg_cycle_time_p50: float
    wip_overloaded_count: int
    pending_demands_count: int
    pending_deps_count: int
    alerts: list[AlertItem]
    team_ranking: list[TeamRankingItem]


@router.get("", response_model=DashboardResponse, summary="Dashboard consolidado de la plataforma")
async def get_dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    """Retorna KPIs consolidados, alertas y ranking de equipos."""
    teams = db.query(Team).all()
    team_map = {t.id: t.name for t in teams}

    # --- Avg Deploy Frequency (latest week per team) ---
    latest_dora_per_team = []
    for team in teams:
        latest = (
            db.query(DoraMetric)
            .filter(DoraMetric.team_id == team.id)
            .order_by(DoraMetric.week_start.desc())
            .first()
        )
        if latest:
            latest_dora_per_team.append(latest)

    avg_deploy_freq = round(
        sum(d.deployment_frequency for d in latest_dora_per_team) / len(latest_dora_per_team), 1
    ) if latest_dora_per_team else 0

    # --- Avg Cycle Time P50 ---
    cycle_times_p50 = []
    for team in teams:
        completed = (
            db.query(FlowItem.cycle_time_hours)
            .filter(FlowItem.team_id == team.id, FlowItem.cycle_time_hours.isnot(None))
            .all()
        )
        if completed:
            sorted_ct = sorted([c[0] for c in completed])
            p50 = sorted_ct[len(sorted_ct) // 2]
            cycle_times_p50.append(p50)

    avg_cycle_time_p50 = round(
        sum(cycle_times_p50) / len(cycle_times_p50), 1
    ) if cycle_times_p50 else 0

    # --- WIP Overloaded Count ---
    wip_overloaded_count = 0
    for team in teams:
        wip_current = (
            db.query(FlowItem)
            .filter(FlowItem.team_id == team.id, FlowItem.stage == FlowStage.IN_PROGRESS)
            .count()
        )
        if wip_current > team.wip_limit:
            wip_overloaded_count += 1

    # --- Pending Demands ---
    pending_demands_count = (
        db.query(Demand)
        .filter(Demand.status.in_([DemandStatus.BACKLOG, DemandStatus.PRIORITIZED]))
        .count()
    )

    # --- Pending Dependencies ---
    pending_deps_count = (
        db.query(Dependency)
        .filter(Dependency.is_resolved == False)
        .count()
    )

    # --- Alerts ---
    alerts: list[AlertItem] = []

    for team in teams:
        wip_current = (
            db.query(FlowItem)
            .filter(FlowItem.team_id == team.id, FlowItem.stage == FlowStage.IN_PROGRESS)
            .count()
        )
        if wip_current > team.wip_limit:
            alerts.append(AlertItem(
                team_id=team.id,
                team_name=team.name,
                type="wip_overload",
                message=f"WIP ({wip_current}) excede limite ({team.wip_limit})",
                severity="critical",
            ))

    for dora in latest_dora_per_team:
        if dora.change_failure_rate > 15:
            alerts.append(AlertItem(
                team_id=dora.team_id,
                team_name=team_map.get(dora.team_id, ""),
                type="high_cfr",
                message=f"Change Failure Rate alto: {dora.change_failure_rate}%",
                severity="warning",
            ))

    pending_deps = db.query(Dependency).filter(Dependency.is_resolved == False).all()
    for dep in pending_deps:
        alerts.append(AlertItem(
            team_id=dep.requester_team_id,
            team_name=team_map.get(dep.requester_team_id, ""),
            type="pending_dep",
            message=f"Dependencia pendiente con {team_map.get(dep.blocker_team_id, dep.blocker_team_id)}",
            severity="warning",
        ))

    # --- Team Ranking ---
    team_ranking: list[TeamRankingItem] = []
    for team in teams:
        latest_dora = next((d for d in latest_dora_per_team if d.team_id == team.id), None)
        if not latest_dora:
            continue

        completed = (
            db.query(FlowItem.cycle_time_hours)
            .filter(FlowItem.team_id == team.id, FlowItem.cycle_time_hours.isnot(None))
            .all()
        )
        if completed:
            sorted_ct = sorted([c[0] for c in completed])
            p50 = sorted_ct[len(sorted_ct) // 2]
        else:
            p50 = 0

        # Score: higher deploy freq is better, lower cycle time is better
        score = round(latest_dora.deployment_frequency * 10 - p50, 1)

        team_ranking.append(TeamRankingItem(
            team_id=team.id,
            team_name=team.name,
            deploy_freq=latest_dora.deployment_frequency,
            cycle_time_p50=round(p50, 1),
            score=score,
        ))

    team_ranking.sort(key=lambda x: x.score, reverse=True)

    return DashboardResponse(
        avg_deploy_freq=avg_deploy_freq,
        avg_cycle_time_p50=avg_cycle_time_p50,
        wip_overloaded_count=wip_overloaded_count,
        pending_demands_count=pending_demands_count,
        pending_deps_count=pending_deps_count,
        alerts=alerts,
        team_ranking=team_ranking,
    )
