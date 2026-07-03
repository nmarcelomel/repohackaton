"""Router de Developer Experience (DevEx) surveys."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.devex import DevExResponse

router = APIRouter(prefix="/api/v1/devex", tags=["Developer Experience"])


class DevExCreateRequest(BaseModel):
    """Request para crear una respuesta DevEx."""

    user_id: str
    team_id: str
    period: str  # YYYY-MM
    facilidad_deploy: int = Field(ge=1, le=5)
    feedback_pr: int = Field(ge=1, le=5)
    interrupciones: int = Field(ge=1, le=5)
    claridad_reqs: int = Field(ge=1, le=5)
    satisfaccion_herramientas: int = Field(ge=1, le=5)


class DevExItemResponse(BaseModel):
    """Response individual de DevEx."""

    id: int
    user_id: str
    team_id: str
    period: str
    facilidad_deploy: int
    feedback_pr: int
    interrupciones: int
    claridad_reqs: int
    satisfaccion_herramientas: int

    class Config:
        from_attributes = True


class DevExAggregatedResponse(BaseModel):
    """Response agregado de DevEx por equipo."""

    team_id: str
    total_responses: int
    avg_facilidad_deploy: float
    avg_feedback_pr: float
    avg_interrupciones: float
    avg_claridad_reqs: float
    avg_satisfaccion_herramientas: float
    overall_score: float


@router.post("/responses", response_model=DevExItemResponse, status_code=201, summary="Registrar respuesta DevEx")
async def create_devex_response(payload: DevExCreateRequest, db: Session = Depends(get_db)) -> DevExItemResponse:
    """Crea una respuesta de encuesta DevEx. Valida rango 1-5 y unicidad por user/team/period."""
    existing = (
        db.query(DevExResponse)
        .filter(
            DevExResponse.user_id == payload.user_id,
            DevExResponse.team_id == payload.team_id,
            DevExResponse.period == payload.period,
        )
        .first()
    )
    if existing:
        raise HTTPException(409, detail="Ya existe una respuesta para este usuario/equipo/periodo")

    record = DevExResponse(
        user_id=payload.user_id,
        team_id=payload.team_id,
        period=payload.period,
        facilidad_deploy=payload.facilidad_deploy,
        feedback_pr=payload.feedback_pr,
        interrupciones=payload.interrupciones,
        claridad_reqs=payload.claridad_reqs,
        satisfaccion_herramientas=payload.satisfaccion_herramientas,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return DevExItemResponse.model_validate(record)


@router.get("/results", response_model=DevExAggregatedResponse, summary="Resultados agregados DevEx por equipo")
async def get_devex_results(team_id: str, db: Session = Depends(get_db)) -> DevExAggregatedResponse:
    """Retorna promedios por pregunta para un equipo."""
    results = (
        db.query(
            func.count(DevExResponse.id).label("total"),
            func.avg(DevExResponse.facilidad_deploy).label("avg_fd"),
            func.avg(DevExResponse.feedback_pr).label("avg_fp"),
            func.avg(DevExResponse.interrupciones).label("avg_int"),
            func.avg(DevExResponse.claridad_reqs).label("avg_cr"),
            func.avg(DevExResponse.satisfaccion_herramientas).label("avg_sh"),
        )
        .filter(DevExResponse.team_id == team_id)
        .first()
    )

    if not results or results.total == 0:
        raise HTTPException(404, detail="Sin datos DevEx para este equipo")

    avg_fd = round(float(results.avg_fd), 2)
    avg_fp = round(float(results.avg_fp), 2)
    avg_int = round(float(results.avg_int), 2)
    avg_cr = round(float(results.avg_cr), 2)
    avg_sh = round(float(results.avg_sh), 2)
    overall = round((avg_fd + avg_fp + avg_int + avg_cr + avg_sh) / 5, 2)

    return DevExAggregatedResponse(
        team_id=team_id,
        total_responses=results.total,
        avg_facilidad_deploy=avg_fd,
        avg_feedback_pr=avg_fp,
        avg_interrupciones=avg_int,
        avg_claridad_reqs=avg_cr,
        avg_satisfaccion_herramientas=avg_sh,
        overall_score=overall,
    )
