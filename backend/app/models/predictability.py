"""Modelo de Predictability Records por sprint/periodo."""

from datetime import datetime

from sqlalchemy import Column, String, Integer, Float, DateTime

from app.db.database import Base


class PredictabilityRecord(Base):
    """Registro de predictabilidad por equipo y periodo."""

    __tablename__ = "predictability_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(String, nullable=False)
    period_name = Column(String, nullable=False)
    items_committed = Column(Integer, nullable=False)
    items_completed = Column(Integer, nullable=False)
    predictability_pct = Column(Float, nullable=False)
    deviation_cause = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
