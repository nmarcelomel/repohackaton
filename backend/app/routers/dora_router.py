"""Router de métricas DORA (HU-M01)."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.responses import DoraMetricResponse, DoraSummaryResponse
from app.models.entities import DoraMetric, Team

router = APIRouter(prefix="/api/v1/dora", tags=["DORA Metrics"])


def classify_benchmark(metric: DoraMetric) -> str:
    """Clasifica equipo según estándares DORA 2026."""
    if metric.deployment_frequency >= 15 and metric.lead_time_hours <= 3:
        return "Elite"
    elif metric.deployment_frequency >= 8 and metric.lead_time_hours <= 8:
        return "High"
    elif metric.deployment_frequency >= 4 and metric.lead_time_hours <= 15:
        return "Medium"
    return "Low"


@router.get("/{team_id}", response_model=DoraSummaryResponse, summary="DORA metrics con tendencia y benchmark")
async def get_dora_metrics(team_id: str, db: Session = Depends(get_db)) -> DoraSummaryResponse:
    """Retorna las 5 métricas DORA con tendencia (4 semanas) y clasificación benchmark."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        from fastapi import HTTPException
        raise HTTPException(404, detail="Equipo no encontrado")

    metrics = (
        db.query(DoraMetric)
        .filter(DoraMetric.team_id == team_id)
        .order_by(DoraMetric.week_start.desc())
        .limit(4)
        .all()
    )

    if not metrics:
        from fastapi import HTTPException
        raise HTTPException(404, detail="Sin datos DORA para este equipo")

    current = metrics[0]
    benchmark = classify_benchmark(current)

    return DoraSummaryResponse(
        team_id=team_id,
        team_name=team.name,
        current=DoraMetricResponse.model_validate(current),
        trend=[DoraMetricResponse.model_validate(m) for m in metrics],
        benchmark=benchmark,
    )


@router.get("", response_model=list[DoraSummaryResponse], summary="DORA metrics de todos los equipos")
async def get_all_dora_metrics(db: Session = Depends(get_db)) -> list[DoraSummaryResponse]:
    """Retorna DORA summary para cada equipo."""
    teams = db.query(Team).all()
    results = []
    for team in teams:
        metrics = (
            db.query(DoraMetric)
            .filter(DoraMetric.team_id == team.id)
            .order_by(DoraMetric.week_start.desc())
            .limit(4)
            .all()
        )
        if metrics:
            current = metrics[0]
            results.append(DoraSummaryResponse(
                team_id=team.id,
                team_name=team.name,
                current=DoraMetricResponse.model_validate(current),
                trend=[DoraMetricResponse.model_validate(m) for m in metrics],
                benchmark=classify_benchmark(current),
            ))
    return results
