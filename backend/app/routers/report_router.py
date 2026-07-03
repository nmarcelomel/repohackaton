"""Router de Executive Report."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.models.entities import (
    DoraMetric, FlowItem, FlowStage, Team, Allocation, Dependency,
)

router = APIRouter(prefix="/api/v1/report", tags=["Executive Report"])


class DoraTrafficLightItem(BaseModel):
    """Semaforo DORA por equipo."""

    team_id: str
    team_name: str
    deployment_frequency: float
    lead_time_hours: float
    change_failure_rate: float
    mttr_hours: float
    benchmark: str  # "Elite" | "High" | "Medium" | "Low"
    color: str  # "green" | "yellow" | "red"


class BottleneckItem(BaseModel):
    """Cuello de botella identificado."""

    rank: int
    team_id: str
    team_name: str
    issue: str
    impact: str
    recommendation: str


class AllocationBalanceItem(BaseModel):
    """Balance de allocation por equipo."""

    team_id: str
    team_name: str
    features_pct: float
    defects_pct: float
    tech_debt_pct: float
    risk_compliance_pct: float
    alert: Optional[str] = None


class ExecutiveReportResponse(BaseModel):
    """Response del reporte ejecutivo."""

    dora_table: list[DoraTrafficLightItem]
    top_bottlenecks: list[BottleneckItem]
    allocation_balance: list[AllocationBalanceItem]
    recommendations: list[str]


def classify_dora_color(metric: DoraMetric) -> tuple[str, str]:
    """Clasifica equipo y asigna color semaforo."""
    if metric.deployment_frequency >= 15 and metric.lead_time_hours <= 3:
        return "Elite", "green"
    elif metric.deployment_frequency >= 8 and metric.lead_time_hours <= 8:
        return "High", "green"
    elif metric.deployment_frequency >= 4 and metric.lead_time_hours <= 15:
        return "Medium", "yellow"
    return "Low", "red"


@router.get("/executive", response_model=ExecutiveReportResponse, summary="Reporte ejecutivo con semaforo DORA")
async def get_executive_report(db: Session = Depends(get_db)) -> ExecutiveReportResponse:
    """Genera reporte ejecutivo: tabla DORA con semaforo, top 3 cuellos de botella, balance allocation, recomendaciones."""
    teams = db.query(Team).all()
    team_map = {t.id: t.name for t in teams}

    # --- DORA Traffic Light Table ---
    dora_table: list[DoraTrafficLightItem] = []
    latest_dora_map: dict[str, DoraMetric] = {}

    for team in teams:
        latest = (
            db.query(DoraMetric)
            .filter(DoraMetric.team_id == team.id)
            .order_by(DoraMetric.week_start.desc())
            .first()
        )
        if latest:
            benchmark, color = classify_dora_color(latest)
            latest_dora_map[team.id] = latest
            dora_table.append(DoraTrafficLightItem(
                team_id=team.id,
                team_name=team.name,
                deployment_frequency=latest.deployment_frequency,
                lead_time_hours=latest.lead_time_hours,
                change_failure_rate=latest.change_failure_rate,
                mttr_hours=latest.mttr_hours,
                benchmark=benchmark,
                color=color,
            ))

    # --- Top 3 Bottlenecks ---
    bottlenecks: list[BottleneckItem] = []

    # Bottleneck 1: Highest lead time team
    if latest_dora_map:
        worst_lt = max(latest_dora_map.values(), key=lambda d: d.lead_time_hours)
        bottlenecks.append(BottleneckItem(
            rank=1,
            team_id=worst_lt.team_id,
            team_name=team_map.get(worst_lt.team_id, ""),
            issue=f"Lead time elevado: {worst_lt.lead_time_hours}h",
            impact="Ciclos de entrega lentos reducen capacidad de respuesta al negocio",
            recommendation="Reducir batch size y automatizar etapas de review/deploy",
        ))

    # Bottleneck 2: Highest change failure rate
    if latest_dora_map:
        worst_cfr = max(latest_dora_map.values(), key=lambda d: d.change_failure_rate)
        bottlenecks.append(BottleneckItem(
            rank=2,
            team_id=worst_cfr.team_id,
            team_name=team_map.get(worst_cfr.team_id, ""),
            issue=f"Change Failure Rate alto: {worst_cfr.change_failure_rate}%",
            impact="Alta tasa de rollbacks y retrabajos degrada confianza en releases",
            recommendation="Incrementar cobertura de tests y code review pre-merge",
        ))

    # Bottleneck 3: WIP overload or pending deps
    pending_deps_count = db.query(Dependency).filter(Dependency.is_resolved == False).count()
    if pending_deps_count > 0:
        bottlenecks.append(BottleneckItem(
            rank=3,
            team_id="platform",
            team_name="Cross-team",
            issue=f"{pending_deps_count} dependencias pendientes entre equipos",
            impact="Bloqueos inter-equipo incrementan lead time y reducen flow",
            recommendation="Implementar dependency boards y SLA de resolucion de 48h",
        ))
    else:
        # Fallback: WIP overload
        for team in teams:
            wip = (
                db.query(FlowItem)
                .filter(FlowItem.team_id == team.id, FlowItem.stage == FlowStage.IN_PROGRESS)
                .count()
            )
            if wip > team.wip_limit:
                bottlenecks.append(BottleneckItem(
                    rank=3,
                    team_id=team.id,
                    team_name=team.name,
                    issue=f"WIP ({wip}) excede limite ({team.wip_limit})",
                    impact="Sobrecarga de trabajo en progreso incrementa cycle time",
                    recommendation="Aplicar politica stop-starting-start-finishing",
                ))
                break

    # --- Allocation Balance ---
    allocation_balance: list[AllocationBalanceItem] = []
    for team in teams:
        alloc = (
            db.query(Allocation)
            .filter(Allocation.team_id == team.id)
            .order_by(Allocation.period_end.desc())
            .first()
        )
        if alloc:
            alert = None
            if alloc.tech_debt_pct < 10:
                alert = "Tech debt bajo: riesgo de acumulacion"
            elif alloc.features_pct < 50:
                alert = "Poco foco en features: revisar priorizacion"

            allocation_balance.append(AllocationBalanceItem(
                team_id=team.id,
                team_name=team.name,
                features_pct=alloc.features_pct,
                defects_pct=alloc.defects_pct,
                tech_debt_pct=alloc.tech_debt_pct,
                risk_compliance_pct=alloc.risk_compliance_pct,
                alert=alert,
            ))

    # --- Auto Recommendations ---
    recommendations: list[str] = []

    avg_deploy = (
        sum(d.deployment_frequency for d in latest_dora_map.values()) / len(latest_dora_map)
        if latest_dora_map else 0
    )
    if avg_deploy < 10:
        recommendations.append("Incrementar frecuencia de deploy promedio: considerar CI/CD trunk-based")

    high_cfr_teams = [d for d in latest_dora_map.values() if d.change_failure_rate > 12]
    if high_cfr_teams:
        recommendations.append(
            f"{len(high_cfr_teams)} equipo(s) con CFR > 12%: reforzar quality gates pre-produccion"
        )

    if pending_deps_count > 2:
        recommendations.append(
            "Multiples dependencias bloqueadas: evaluar reorganizacion de squads o APIs internas"
        )

    low_debt_teams = [a for a in allocation_balance if a.tech_debt_pct < 12]
    if low_debt_teams:
        recommendations.append(
            f"{len(low_debt_teams)} equipo(s) con < 12% en tech debt: asignar sprint de reduccion de deuda"
        )

    if not recommendations:
        recommendations.append("Todos los indicadores dentro de parametros saludables")

    return ExecutiveReportResponse(
        dora_table=dora_table,
        top_bottlenecks=bottlenecks[:3],
        allocation_balance=allocation_balance,
        recommendations=recommendations,
    )
