"""Router de Predictability Records."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.models.predictability import PredictabilityRecord

router = APIRouter(prefix="/api/v1/predictability", tags=["Predictability"])


class PredictabilityCreateRequest(BaseModel):
    """Request para registrar predictabilidad de un periodo."""

    team_id: str
    period_name: str
    items_committed: int = Field(ge=1)
    items_completed: int = Field(ge=0)
    deviation_cause: Optional[str] = None


class PredictabilityResponse(BaseModel):
    """Response de un registro de predictabilidad."""

    id: int
    team_id: str
    period_name: str
    items_committed: int
    items_completed: int
    predictability_pct: float
    deviation_cause: Optional[str] = None

    class Config:
        from_attributes = True


@router.post("", response_model=PredictabilityResponse, status_code=201, summary="Registrar predictabilidad de periodo")
async def create_predictability_record(
    payload: PredictabilityCreateRequest, db: Session = Depends(get_db)
) -> PredictabilityResponse:
    """Crea un registro de predictabilidad. Calcula automáticamente el porcentaje."""
    predictability_pct = round(
        (payload.items_completed / payload.items_committed) * 100, 1
    )

    record = PredictabilityRecord(
        team_id=payload.team_id,
        period_name=payload.period_name,
        items_committed=payload.items_committed,
        items_completed=payload.items_completed,
        predictability_pct=predictability_pct,
        deviation_cause=payload.deviation_cause,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return PredictabilityResponse.model_validate(record)


@router.get("", response_model=list[PredictabilityResponse], summary="Historial de predictabilidad por equipo")
async def get_predictability_history(team_id: str, db: Session = Depends(get_db)) -> list[PredictabilityResponse]:
    """Retorna historial de predictabilidad para un equipo."""
    records = (
        db.query(PredictabilityRecord)
        .filter(PredictabilityRecord.team_id == team_id)
        .order_by(PredictabilityRecord.created_at.desc())
        .all()
    )

    if not records:
        raise HTTPException(404, detail="Sin datos de predictabilidad para este equipo")

    return [PredictabilityResponse.model_validate(r) for r in records]
