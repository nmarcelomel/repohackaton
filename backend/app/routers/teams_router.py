"""Router de equipos/células."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.responses import TeamResponse
from app.models.entities import Team

router = APIRouter(prefix="/api/v1/teams", tags=["Equipos"])


@router.get("", response_model=list[TeamResponse], summary="Listar todas las células")
async def list_teams(db: Session = Depends(get_db)) -> list[TeamResponse]:
    """Retorna todas las células de desarrollo."""
    teams = db.query(Team).all()
    return [TeamResponse.model_validate(t) for t in teams]
