"""Modelo de costos de equipo para cálculos de ROI."""

from datetime import datetime

from sqlalchemy import Column, String, Integer, Float, DateTime

from app.db.database import Base


class TeamCost(Base):
    """Costo mensual y por hora de cada equipo de ingeniería."""

    __tablename__ = "team_costs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(String, nullable=False)
    monthly_cost = Column(Float, nullable=False)  # USD
    hourly_rate = Column(Float, nullable=False)  # USD per dev hour
    ai_licenses_cost = Column(Float, default=0)  # monthly AI tools cost
    created_at = Column(DateTime, default=datetime.utcnow)
