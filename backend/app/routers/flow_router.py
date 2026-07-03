"""Router de Flow Metrics (HU-M02, HU-M03, HU-M08)."""

from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
import statistics

from app.db.database import get_db
from app.schemas.responses import FlowMetricsResponse, CycleTimeStats, ThroughputWeek, CfdDataPoint
from app.models.entities import FlowItem, FlowStage, Team


class LeadTimeBreakdownResponse(BaseModel):
    """Response de lead time breakdown por fases."""

    team_id: str
    items_analyzed: int
    avg_concept_to_commit_hours: float
    avg_commit_to_deploy_hours: float
    avg_deploy_to_value_hours: float
    total_avg_lead_time_hours: float

router = APIRouter(prefix="/api/v1/flow", tags=["Flow Metrics"])


@router.get("/{team_id}", response_model=FlowMetricsResponse, summary="Flow metrics completas de una célula")
async def get_flow_metrics(team_id: str, db: Session = Depends(get_db)) -> FlowMetricsResponse:
    """Retorna cycle time (percentiles), throughput, flow efficiency, CFD, y comparativa IA."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(404, detail="Equipo no encontrado")

    # Cycle Time Stats (items completados)
    completed_items = (
        db.query(FlowItem)
        .filter(FlowItem.team_id == team_id, FlowItem.cycle_time_hours.isnot(None))
        .all()
    )

    cycle_times = sorted([item.cycle_time_hours for item in completed_items]) if completed_items else [0]

    n = len(cycle_times)
    p50 = cycle_times[int(n * 0.5)] if n > 0 else 0
    p85 = cycle_times[int(n * 0.85)] if n > 0 else 0
    p95 = cycle_times[min(int(n * 0.95), n - 1)] if n > 0 else 0

    cycle_time_stats = CycleTimeStats(
        p50=round(p50, 1),
        p85=round(p85, 1),
        p95=round(p95, 1),
        histogram=[round(ct, 1) for ct in cycle_times[:50]],
    )

    # Throughput (last 4 weeks)
    today = date.today()
    throughput = []
    for i in range(4):
        week_start = today - timedelta(weeks=(3 - i))
        week_end = week_start + timedelta(days=7)
        count = (
            db.query(FlowItem)
            .filter(
                FlowItem.team_id == team_id,
                FlowItem.completed_at.isnot(None),
                func.date(FlowItem.completed_at) >= week_start,
                func.date(FlowItem.completed_at) < week_end,
            )
            .count()
        )
        throughput.append(ThroughputWeek(week_start=week_start, items_completed=count))

    # Flow Efficiency
    all_items = db.query(FlowItem).filter(FlowItem.team_id == team_id, FlowItem.cycle_time_hours.isnot(None)).all()
    total_cycle = sum(i.cycle_time_hours for i in all_items) if all_items else 1
    active_time = sum((i.commit_to_deploy_hours or 0) for i in all_items) if all_items else 0
    flow_efficiency = round((active_time / total_cycle) * 100, 1) if total_cycle > 0 else 0

    # CFD (last 4 weeks, weekly snapshots)
    cfd = []
    all_flow_items = db.query(FlowItem).filter(FlowItem.team_id == team_id).all()
    for i in range(4):
        snapshot_date = today - timedelta(weeks=(3 - i))
        backlog = sum(1 for item in all_flow_items if item.stage == FlowStage.BACKLOG)
        in_progress = sum(1 for item in all_flow_items if item.stage == FlowStage.IN_PROGRESS)
        review = sum(1 for item in all_flow_items if item.stage == FlowStage.REVIEW)
        testing = sum(1 for item in all_flow_items if item.stage == FlowStage.TESTING)
        done = sum(1 for item in all_flow_items if item.stage == FlowStage.DONE)
        cfd.append(CfdDataPoint(
            date=snapshot_date, backlog=backlog, in_progress=in_progress,
            review=review, testing=testing, done=done,
        ))

    # AI vs Traditional Cycle Time
    ai_items = [i for i in completed_items if i.is_ai_assisted]
    trad_items = [i for i in completed_items if not i.is_ai_assisted]
    ai_avg = round(statistics.mean([i.cycle_time_hours for i in ai_items]), 1) if ai_items else 0
    trad_avg = round(statistics.mean([i.cycle_time_hours for i in trad_items]), 1) if trad_items else 0

    return FlowMetricsResponse(
        team_id=team_id,
        cycle_time=cycle_time_stats,
        throughput=throughput,
        flow_efficiency_pct=flow_efficiency,
        cfd=cfd,
        ai_cycle_time_avg=ai_avg,
        traditional_cycle_time_avg=trad_avg,
    )


@router.get("/{team_id}/lead-time-breakdown", response_model=LeadTimeBreakdownResponse, summary="Breakdown de lead time por fases")
async def get_lead_time_breakdown(team_id: str, db: Session = Depends(get_db)) -> LeadTimeBreakdownResponse:
    """Retorna promedios de concept-to-commit, commit-to-deploy y deploy-to-value."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(404, detail="Equipo no encontrado")

    items = (
        db.query(FlowItem)
        .filter(
            FlowItem.team_id == team_id,
            FlowItem.concept_to_commit_hours.isnot(None),
            FlowItem.commit_to_deploy_hours.isnot(None),
            FlowItem.deploy_to_value_hours.isnot(None),
        )
        .all()
    )

    if not items:
        raise HTTPException(404, detail="Sin datos de lead time breakdown para este equipo")

    avg_c2c = round(statistics.mean([i.concept_to_commit_hours for i in items]), 2)
    avg_c2d = round(statistics.mean([i.commit_to_deploy_hours for i in items]), 2)
    avg_d2v = round(statistics.mean([i.deploy_to_value_hours for i in items]), 2)

    return LeadTimeBreakdownResponse(
        team_id=team_id,
        items_analyzed=len(items),
        avg_concept_to_commit_hours=avg_c2c,
        avg_commit_to_deploy_hours=avg_c2d,
        avg_deploy_to_value_hours=avg_d2v,
        total_avg_lead_time_hours=round(avg_c2c + avg_c2d + avg_d2v, 2),
    )
