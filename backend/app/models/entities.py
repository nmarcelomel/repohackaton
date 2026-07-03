"""Modelos SQLAlchemy para Engineering Intelligence Platform."""

from datetime import date, datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    LEAD = "lead"
    MEMBER = "member"


class DemandStatus(str, enum.Enum):
    BACKLOG = "backlog"
    PRIORITIZED = "prioritized"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"


class AllocationCategory(str, enum.Enum):
    FEATURE = "feature"
    DEFECT = "defect"
    TECH_DEBT = "tech_debt"
    RISK_COMPLIANCE = "risk_compliance"


class FlowStage(str, enum.Enum):
    BACKLOG = "backlog"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    TESTING = "testing"
    DONE = "done"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.MEMBER)
    team_id = Column(String, ForeignKey("teams.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="members")


class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    wip_limit = Column(Integer, default=5)
    capacity_points = Column(Integer, default=40)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("User", back_populates="team")
    dora_metrics = relationship("DoraMetric", back_populates="team", order_by="DoraMetric.week_start.desc()")
    flow_items = relationship("FlowItem", back_populates="team")
    demands = relationship("Demand", back_populates="team")
    allocations = relationship("Allocation", back_populates="team")


class DoraMetric(Base):
    __tablename__ = "dora_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    week_start = Column(Date, nullable=False)
    deployment_frequency = Column(Float, default=0)
    lead_time_hours = Column(Float, default=0)
    change_failure_rate = Column(Float, default=0)
    mttr_hours = Column(Float, default=0)
    deployment_rework_rate = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="dora_metrics")


class FlowItem(Base):
    __tablename__ = "flow_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(SAEnum(AllocationCategory), default=AllocationCategory.FEATURE)
    stage = Column(SAEnum(FlowStage), default=FlowStage.BACKLOG)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    cycle_time_hours = Column(Float, nullable=True)
    is_ai_assisted = Column(Boolean, default=False)
    concept_to_commit_hours = Column(Float, nullable=True)
    commit_to_deploy_hours = Column(Float, nullable=True)
    deploy_to_value_hours = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="flow_items")


class Demand(Base):
    __tablename__ = "demands"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    title = Column(String, nullable=False)
    requester = Column(String, nullable=False)
    business_value = Column(Integer, nullable=False)
    urgency = Column(Integer, nullable=False)
    size = Column(Integer, nullable=False)
    wsjf_score = Column(Float, nullable=False)
    status = Column(SAEnum(DemandStatus), default=DemandStatus.BACKLOG)
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="demands")


class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    features_pct = Column(Float, default=0)
    defects_pct = Column(Float, default=0)
    tech_debt_pct = Column(Float, default=0)
    risk_compliance_pct = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="allocations")


class Dependency(Base):
    __tablename__ = "dependencies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    requester_team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    blocker_team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    item_description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    is_resolved = Column(Boolean, default=False)

    requester_team = relationship("Team", foreign_keys=[requester_team_id])
    blocker_team = relationship("Team", foreign_keys=[blocker_team_id])
