"""Modelo de Developer Experience (DevEx) surveys."""

from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, UniqueConstraint

from app.db.database import Base


class DevExResponse(Base):
    """Respuesta individual de encuesta DevEx por periodo."""

    __tablename__ = "devex_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    team_id = Column(String, nullable=False)
    period = Column(String, nullable=False)  # YYYY-MM
    facilidad_deploy = Column(Integer, nullable=False)
    feedback_pr = Column(Integer, nullable=False)
    interrupciones = Column(Integer, nullable=False)
    claridad_reqs = Column(Integer, nullable=False)
    satisfaccion_herramientas = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "team_id", "period", name="uq_devex_user_team_period"),
    )
