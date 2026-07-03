"""Router de Gestión de Demanda con WSJF (HU-M04)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.responses import DemandCreateRequest, DemandUpdateRequest, DemandResponse
from app.models.entities import Demand, DemandStatus

router = APIRouter(prefix="/api/v1/demands", tags=["Gestión de Demanda"])


@router.get("", response_model=list[DemandResponse], summary="Listar demandas ordenadas por WSJF")
async def list_demands(
    team_id: str = None,
    status: str = None,
    db: Session = Depends(get_db),
) -> list[DemandResponse]:
    """Lista demandas con filtro opcional por equipo y estado. Ordenadas por WSJF desc."""
    query = db.query(Demand)
    if team_id:
        query = query.filter(Demand.team_id == team_id)
    if status:
        query = query.filter(Demand.status == status)
    demands = query.order_by(Demand.wsjf_score.desc()).all()
    return [DemandResponse.model_validate(d) for d in demands]


@router.post("", response_model=DemandResponse, status_code=201, summary="Crear solicitud de demanda")
async def create_demand(request: DemandCreateRequest, db: Session = Depends(get_db)) -> DemandResponse:
    """Crea una solicitud de demanda con cálculo automático de WSJF."""
    wsjf = round((request.business_value + request.urgency) / request.size, 2)
    demand = Demand(
        team_id=request.team_id,
        title=request.title,
        requester=request.requester,
        business_value=request.business_value,
        urgency=request.urgency,
        size=request.size,
        wsjf_score=wsjf,
    )
    db.add(demand)
    db.commit()
    db.refresh(demand)
    return DemandResponse.model_validate(demand)


@router.put("/{demand_id}", response_model=DemandResponse, summary="Actualizar demanda")
async def update_demand(demand_id: int, request: DemandUpdateRequest, db: Session = Depends(get_db)) -> DemandResponse:
    """Actualiza campos de una demanda y recalcula WSJF si cambian los inputs."""
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(404, detail="Demanda no encontrada")

    if request.title is not None:
        demand.title = request.title
    if request.business_value is not None:
        demand.business_value = request.business_value
    if request.urgency is not None:
        demand.urgency = request.urgency
    if request.size is not None:
        demand.size = request.size
    if request.status is not None:
        demand.status = request.status

    demand.wsjf_score = round((demand.business_value + demand.urgency) / demand.size, 2)
    db.commit()
    db.refresh(demand)
    return DemandResponse.model_validate(demand)


@router.delete("/{demand_id}", status_code=204, summary="Eliminar demanda")
async def delete_demand(demand_id: int, db: Session = Depends(get_db)):
    """Elimina una solicitud de demanda."""
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(404, detail="Demanda no encontrada")
    db.delete(demand)
    db.commit()
