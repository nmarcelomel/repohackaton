"""Router de WIP Alerts (HU-M11) y Dependencies (HU-M07)."""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.responses import WipStatusResponse, DependencyResponse, DependencyCreateRequest
from app.models.entities import Team, FlowItem, FlowStage, Dependency

router = APIRouter(prefix="/api/v1", tags=["WIP & Dependencies"])


# === WIP (HU-M11) ===

@router.get("/wip", response_model=list[WipStatusResponse], summary="Estado WIP de todos los equipos")
async def get_wip_status(db: Session = Depends(get_db)) -> list[WipStatusResponse]:
    """Retorna WIP actual vs límite por equipo con alerta de sobrecarga."""
    teams = db.query(Team).all()
    results = []
    for team in teams:
        wip_current = (
            db.query(FlowItem)
            .filter(FlowItem.team_id == team.id, FlowItem.stage == FlowStage.IN_PROGRESS)
            .count()
        )
        is_overloaded = wip_current > team.wip_limit
        utilization = round((wip_current / team.wip_limit) * 100, 1) if team.wip_limit > 0 else 0

        results.append(WipStatusResponse(
            team_id=team.id,
            team_name=team.name,
            wip_current=wip_current,
            wip_limit=team.wip_limit,
            is_overloaded=is_overloaded,
            utilization_pct=utilization,
        ))
    return results


# === Dependencies (HU-M07) ===

@router.get("/dependencies", response_model=list[DependencyResponse], summary="Tablero de dependencias entre células")
async def list_dependencies(resolved: bool = None, db: Session = Depends(get_db)) -> list[DependencyResponse]:
    """Lista dependencias con aging. Filtro opcional por estado de resolución."""
    query = db.query(Dependency)
    if resolved is not None:
        query = query.filter(Dependency.is_resolved == resolved)
    deps = query.order_by(Dependency.created_at.desc()).all()

    results = []
    for dep in deps:
        days_waiting = (datetime.utcnow() - dep.created_at).days if not dep.is_resolved else 0
        req_team = db.query(Team).filter(Team.id == dep.requester_team_id).first()
        blocker_team = db.query(Team).filter(Team.id == dep.blocker_team_id).first()
        results.append(DependencyResponse(
            id=dep.id,
            requester_team_id=dep.requester_team_id,
            blocker_team_id=dep.blocker_team_id,
            requester_team_name=req_team.name if req_team else None,
            blocker_team_name=blocker_team.name if blocker_team else None,
            item_description=dep.item_description,
            created_at=dep.created_at,
            resolved_at=dep.resolved_at,
            is_resolved=dep.is_resolved,
            days_waiting=days_waiting,
        ))
    return results


@router.post("/dependencies", response_model=DependencyResponse, status_code=201, summary="Registrar dependencia")
async def create_dependency(request: DependencyCreateRequest, db: Session = Depends(get_db)) -> DependencyResponse:
    """Registra una nueva dependencia entre células."""
    dep = Dependency(
        requester_team_id=request.requester_team_id,
        blocker_team_id=request.blocker_team_id,
        item_description=request.item_description,
    )
    db.add(dep)
    db.commit()
    db.refresh(dep)

    req_team = db.query(Team).filter(Team.id == dep.requester_team_id).first()
    blocker_team = db.query(Team).filter(Team.id == dep.blocker_team_id).first()
    return DependencyResponse(
        id=dep.id,
        requester_team_id=dep.requester_team_id,
        blocker_team_id=dep.blocker_team_id,
        requester_team_name=req_team.name if req_team else None,
        blocker_team_name=blocker_team.name if blocker_team else None,
        item_description=dep.item_description,
        created_at=dep.created_at,
        resolved_at=dep.resolved_at,
        is_resolved=dep.is_resolved,
        days_waiting=0,
    )


@router.patch("/dependencies/{dep_id}/resolve", response_model=DependencyResponse, summary="Resolver dependencia")
async def resolve_dependency(dep_id: int, db: Session = Depends(get_db)) -> DependencyResponse:
    """Marca una dependencia como resuelta."""
    dep = db.query(Dependency).filter(Dependency.id == dep_id).first()
    if not dep:
        raise HTTPException(404, detail="Dependencia no encontrada")
    dep.is_resolved = True
    dep.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(dep)

    req_team = db.query(Team).filter(Team.id == dep.requester_team_id).first()
    blocker_team = db.query(Team).filter(Team.id == dep.blocker_team_id).first()
    return DependencyResponse(
        id=dep.id,
        requester_team_id=dep.requester_team_id,
        blocker_team_id=dep.blocker_team_id,
        requester_team_name=req_team.name if req_team else None,
        blocker_team_name=blocker_team.name if blocker_team else None,
        item_description=dep.item_description,
        created_at=dep.created_at,
        resolved_at=dep.resolved_at,
        is_resolved=dep.is_resolved,
        days_waiting=0,
    )
