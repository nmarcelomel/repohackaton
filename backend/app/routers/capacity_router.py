"""Router de Capacity vs Demand (HU-M05) y Allocation (HU-M06)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.responses import CapacityResponse, AllocationResponse
from app.models.entities import Team, FlowItem, FlowStage, Allocation

router = APIRouter(prefix="/api/v1/capacity", tags=["Capacity & Allocation"])


@router.get("", response_model=list[CapacityResponse], summary="Capacity vs Demand de todos los equipos")
async def get_all_capacity(db: Session = Depends(get_db)) -> list[CapacityResponse]:
    """Retorna utilización por equipo con alertas de sobrecarga/subutilización."""
    teams = db.query(Team).all()
    results = []
    for team in teams:
        committed = (
            db.query(FlowItem)
            .filter(FlowItem.team_id == team.id, FlowItem.stage.in_([FlowStage.IN_PROGRESS, FlowStage.REVIEW, FlowStage.TESTING]))
            .count()
        )
        utilization = round((committed / team.capacity_points) * 100, 1) if team.capacity_points > 0 else 0
        alert = None
        if utilization > 85:
            alert = "overloaded"
        elif utilization < 50:
            alert = "underutilized"

        results.append(CapacityResponse(
            team_id=team.id,
            team_name=team.name,
            capacity_points=team.capacity_points,
            committed_points=committed,
            utilization_pct=utilization,
            alert=alert,
        ))
    return results


@router.get("/allocation/{team_id}", response_model=list[AllocationResponse], summary="Allocation por tipo de trabajo")
async def get_allocation(team_id: str, db: Session = Depends(get_db)) -> list[AllocationResponse]:
    """Retorna allocation (features/defects/debt/risk) por periodo para un equipo."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(404, detail="Equipo no encontrado")

    allocations = (
        db.query(Allocation)
        .filter(Allocation.team_id == team_id)
        .order_by(Allocation.period_start.desc())
        .all()
    )

    results = []
    for alloc in allocations:
        alert = None
        if (alloc.tech_debt_pct + alloc.defects_pct) > 40:
            alert = "high_debt_defects"
        results.append(AllocationResponse(
            id=alloc.id,
            team_id=alloc.team_id,
            period_start=alloc.period_start,
            period_end=alloc.period_end,
            features_pct=alloc.features_pct,
            defects_pct=alloc.defects_pct,
            tech_debt_pct=alloc.tech_debt_pct,
            risk_compliance_pct=alloc.risk_compliance_pct,
            alert=alert,
        ))
    return results
