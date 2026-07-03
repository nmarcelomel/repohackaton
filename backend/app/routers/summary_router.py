"""Router de Reporte Ejecutivo y endpoint de integración (RT-10, HU-M10)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.responses import ModuleSummaryResponse
from app.models.entities import Team, DoraMetric, FlowItem, FlowStage, Dependency

router = APIRouter(prefix="/api/v1/flujo", tags=["Executive Summary"])


@router.get("/summary", response_model=ModuleSummaryResponse, summary="Summary estandarizado para Cockpit (RT-10)")
async def get_module_summary(db: Session = Depends(get_db)) -> ModuleSummaryResponse:
    """Endpoint de integración: status, KPI principal, trend, alertas."""
    teams = db.query(Team).all()

    # KPI principal: promedio de deployment frequency del último período
    total_df = 0
    count = 0
    for team in teams:
        latest = (
            db.query(DoraMetric)
            .filter(DoraMetric.team_id == team.id)
            .order_by(DoraMetric.week_start.desc())
            .first()
        )
        if latest:
            total_df += latest.deployment_frequency
            count += 1

    avg_df = round(total_df / count, 1) if count > 0 else 0

    # Alertas: equipos con WIP sobrecargado + dependencias sin resolver > 5 días
    alerts = 0
    for team in teams:
        wip = db.query(FlowItem).filter(FlowItem.team_id == team.id, FlowItem.stage == FlowStage.IN_PROGRESS).count()
        if wip > team.wip_limit:
            alerts += 1

    unresolved_deps = db.query(Dependency).filter(Dependency.is_resolved == False).count()
    alerts += unresolved_deps

    # Trend: comparar promedio actual vs anterior
    trend = "stable"
    if count > 0:
        prev_total = 0
        prev_count = 0
        for team in teams:
            metrics = (
                db.query(DoraMetric)
                .filter(DoraMetric.team_id == team.id)
                .order_by(DoraMetric.week_start.desc())
                .limit(2)
                .all()
            )
            if len(metrics) >= 2:
                prev_total += metrics[1].deployment_frequency
                prev_count += 1
        if prev_count > 0:
            prev_avg = prev_total / prev_count
            if avg_df > prev_avg * 1.05:
                trend = "up"
            elif avg_df < prev_avg * 0.95:
                trend = "down"

    # Status
    status = "healthy"
    if alerts > 3:
        status = "critical"
    elif alerts > 0:
        status = "warning"

    return ModuleSummaryResponse(
        status=status,
        kpi_principal=f"Deploy Frequency Avg: {avg_df}/sem",
        trend=trend,
        alerts_count=alerts,
    )
