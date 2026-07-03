"""Script de seed — carga datos realistas del sector asegurador colombiano."""

import sys
from datetime import date, datetime, timedelta
import random

from app.db.database import engine, SessionLocal, Base
from app.models.entities import (
    User, Team, DoraMetric, FlowItem, Demand, Allocation, Dependency,
    UserRole, DemandStatus, AllocationCategory, FlowStage
)
from app.models.devex import DevExResponse
from app.models.predictability import PredictabilityRecord
from app.models.roi import TeamCost
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed():
    """Crea tablas y carga datos de seed."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Team).first():
        print("DB already seeded. Skipping.")
        db.close()
        return

    # === Teams ===
    teams = [
        Team(id="team-openfinance", name="OpenFinance", wip_limit=5, capacity_points=40),
        Team(id="team-siniestros", name="Siniestros", wip_limit=5, capacity_points=35),
        Team(id="team-emision", name="Emisión", wip_limit=6, capacity_points=45),
        Team(id="team-vida", name="Vida y Salud", wip_limit=4, capacity_points=30),
        Team(id="team-digital", name="Canales Digitales", wip_limit=6, capacity_points=50),
    ]
    db.add_all(teams)

    # === Users ===
    users = [
        User(id="user-admin", email="admin@segurosbolivar.com", hashed_password=pwd_context.hash("admin123"), name="Admin Platform", role=UserRole.ADMIN, team_id=None),
        User(id="user-lead-01", email="carlos.martinez@segurosbolivar.com", hashed_password=pwd_context.hash("lead123"), name="Carlos Martínez", role=UserRole.LEAD, team_id="team-openfinance"),
        User(id="user-lead-02", email="laura.garcia@segurosbolivar.com", hashed_password=pwd_context.hash("lead123"), name="Laura García", role=UserRole.LEAD, team_id="team-siniestros"),
        User(id="user-lead-03", email="julian.torres@segurosbolivar.com", hashed_password=pwd_context.hash("lead123"), name="Julián Torres", role=UserRole.LEAD, team_id="team-emision"),
        User(id="user-member-01", email="ana.lopez@segurosbolivar.com", hashed_password=pwd_context.hash("member123"), name="Ana López", role=UserRole.MEMBER, team_id="team-openfinance"),
    ]
    db.add_all(users)

    # === DORA Metrics (4 weeks per team) ===
    today = date.today()
    dora_data = {
        "team-openfinance": {"df": [10, 11, 12, 14], "lt": [5.2, 4.8, 4.2, 3.9], "cfr": [10, 9, 8, 7], "mttr": [2.0, 1.8, 1.5, 1.3], "drr": [5, 4, 3, 3]},
        "team-siniestros": {"df": [4, 5, 6, 6], "lt": [14.0, 13.2, 12.5, 12.0], "cfr": [18, 16, 15, 14], "mttr": [5.0, 4.5, 4.0, 3.8], "drr": [12, 10, 9, 8]},
        "team-emision": {"df": [7, 7, 8, 9], "lt": [9.0, 8.5, 7.8, 7.2], "cfr": [12, 11, 10, 9], "mttr": [3.0, 2.8, 2.3, 2.1], "drr": [7, 6, 5, 5]},
        "team-vida": {"df": [3, 4, 4, 5], "lt": [18.0, 16.5, 15.0, 14.2], "cfr": [20, 18, 17, 16], "mttr": [6.0, 5.5, 5.0, 4.8], "drr": [15, 13, 12, 11]},
        "team-digital": {"df": [15, 16, 18, 20], "lt": [3.5, 3.2, 2.8, 2.5], "cfr": [5, 4, 4, 3], "mttr": [1.0, 0.9, 0.8, 0.7], "drr": [2, 2, 1, 1]},
    }

    for team_id, metrics in dora_data.items():
        for i in range(4):
            week_start = today - timedelta(weeks=(3 - i))
            db.add(DoraMetric(
                team_id=team_id,
                week_start=week_start,
                deployment_frequency=metrics["df"][i],
                lead_time_hours=metrics["lt"][i],
                change_failure_rate=metrics["cfr"][i],
                mttr_hours=metrics["mttr"][i],
                deployment_rework_rate=metrics["drr"][i],
            ))

    # === Flow Items (30+ per team) ===
    item_titles = [
        "Integración pasarela de pagos PSE", "Módulo de reclamaciones online",
        "API de cotización automática", "Formulario de vinculación digital",
        "Optimización de consulta de pólizas", "Dashboard de siniestralidad",
        "Notificaciones push de vencimiento", "Motor de reglas de suscripción",
        "Portal de intermediarios", "Chatbot de atención al asegurado",
        "Migración microservicio de emisión", "Automatización de renovaciones",
        "Endpoint de certificados digitales", "Validación biométrica de identidad",
        "Reporte de comisiones en tiempo real", "Pipeline de datos actuariales",
        "App móvil de inspección vehicular", "Integración con RUNT",
        "Módulo de coaseguro", "Sistema de alertas de fraude",
    ]

    for team in teams:
        for i in range(random.randint(25, 35)):
            started = datetime.now() - timedelta(days=random.randint(1, 60))
            is_done = random.random() > 0.35
            is_ai = random.random() > 0.6
            cycle = random.uniform(4, 48) if is_done else None
            if is_ai and cycle:
                cycle = cycle * 0.7

            stage = FlowStage.DONE if is_done else random.choice([FlowStage.IN_PROGRESS, FlowStage.REVIEW, FlowStage.TESTING])
            completed = started + timedelta(hours=cycle) if is_done and cycle else None

            c2c = random.uniform(2, 20) if is_done else None
            c2d = random.uniform(1, 10) if is_done else None
            d2v = random.uniform(0.5, 8) if is_done else None

            db.add(FlowItem(
                team_id=team.id,
                title=random.choice(item_titles) + f" #{i+1}",
                category=random.choice(list(AllocationCategory)),
                stage=stage,
                started_at=started,
                completed_at=completed,
                cycle_time_hours=cycle,
                is_ai_assisted=is_ai,
                concept_to_commit_hours=c2c,
                commit_to_deploy_hours=c2d,
                deploy_to_value_hours=d2v,
            ))

    # === Demands (20+) ===
    demand_titles = [
        "Portal de pagos con tarjeta de crédito", "Módulo de indemnizaciones express",
        "API de consulta de coberturas", "Firma electrónica en pólizas",
        "Reportería de siniestros para regulador", "Widget de cotización embebido",
        "Integración con asistencia vehicular", "App de telemedicina",
        "Automatización de underwriting", "Endpoint de cancelación de pólizas",
        "Dashboard de retención de clientes", "Motor de cross-selling",
        "Módulo de cobranza inteligente", "Sistema de scoring crediticio",
        "Portal de prevención de riesgos", "API de geolocalización de talleres",
        "Plataforma de capacitación agentes", "Módulo de reaseguro",
        "Sistema de gestión documental", "Integración con superintendencia",
        "Chatbot de ventas asistido por IA", "App de inspección con fotos",
    ]

    requesters = ["VP Comercial", "Gerencia Siniestros", "Dirección Digital", "VP Operaciones", "Gerencia Riesgos", "CTO"]

    for i, title in enumerate(demand_titles):
        bv = random.randint(3, 10)
        urg = random.randint(2, 10)
        size = random.randint(1, 10)
        wsjf = round((bv + urg) / size, 2)
        team_id = random.choice([t.id for t in teams])
        status = random.choice([DemandStatus.BACKLOG, DemandStatus.PRIORITIZED, DemandStatus.IN_PROGRESS, DemandStatus.DONE])

        db.add(Demand(
            team_id=team_id,
            title=title,
            requester=random.choice(requesters),
            business_value=bv,
            urgency=urg,
            size=size,
            wsjf_score=wsjf,
            status=status,
        ))

    # === Allocations (last 3 periods per team) ===
    for team in teams:
        for i in range(3):
            period_start = today - timedelta(days=90 * (2 - i))
            period_end = period_start + timedelta(days=89)
            features = random.uniform(55, 75)
            defects = random.uniform(8, 18)
            debt = random.uniform(10, 25)
            risk = 100 - features - defects - debt

            db.add(Allocation(
                team_id=team.id,
                period_start=period_start,
                period_end=period_end,
                features_pct=round(features, 1),
                defects_pct=round(defects, 1),
                tech_debt_pct=round(debt, 1),
                risk_compliance_pct=round(max(risk, 2), 1),
            ))

    # === Dependencies ===
    deps = [
        ("team-openfinance", "team-emision", "API de emisión de pólizas para portal de pagos"),
        ("team-siniestros", "team-digital", "Componente de upload de fotos para reclamaciones"),
        ("team-vida", "team-openfinance", "Endpoint de validación de medios de pago"),
        ("team-digital", "team-siniestros", "Servicio de consulta de estado de siniestro"),
        ("team-emision", "team-vida", "Tablas de mortalidad actualizadas para cotizador"),
    ]

    for req_id, blocker_id, desc in deps:
        days_ago = random.randint(2, 15)
        is_resolved = random.random() > 0.6
        db.add(Dependency(
            requester_team_id=req_id,
            blocker_team_id=blocker_id,
            item_description=desc,
            created_at=datetime.now() - timedelta(days=days_ago),
            resolved_at=datetime.now() - timedelta(days=1) if is_resolved else None,
            is_resolved=is_resolved,
        ))

    # === DevEx Responses (10+ per team) ===
    devex_users = ["user-lead-01", "user-lead-02", "user-lead-03", "user-member-01", "user-admin"]
    devex_periods = ["2026-04", "2026-05", "2026-06"]
    team_ids = [t.id for t in teams]

    for period in devex_periods:
        for user_id in devex_users:
            for team_id in random.sample(team_ids, k=2):
                db.add(DevExResponse(
                    user_id=user_id,
                    team_id=team_id,
                    period=period,
                    facilidad_deploy=random.randint(2, 5),
                    feedback_pr=random.randint(2, 5),
                    interrupciones=random.randint(1, 4),
                    claridad_reqs=random.randint(2, 5),
                    satisfaccion_herramientas=random.randint(3, 5),
                ))

    # === Predictability Records (5+ per team) ===
    sprint_names = ["Sprint 2026-01", "Sprint 2026-02", "Sprint 2026-03", "Sprint 2026-04", "Sprint 2026-05", "Sprint 2026-06"]
    for team in teams:
        for sprint in sprint_names:
            committed = random.randint(8, 15)
            completed = random.randint(int(committed * 0.6), committed)
            pct = round((completed / committed) * 100, 1)
            cause = None
            if pct < 80:
                cause = random.choice([
                    "Dependencia externa bloqueante",
                    "Incidencia en produccion no planificada",
                    "Requerimiento cambiado mid-sprint",
                    "Ausencia no planificada del equipo",
                ])
            db.add(PredictabilityRecord(
                team_id=team.id,
                period_name=sprint,
                items_committed=committed,
                items_completed=completed,
                predictability_pct=pct,
                deviation_cause=cause,
            ))

    # === Team Costs (ROI) ===
    team_costs_data = [
        ("team-openfinance", 45000, 52, 1800),
        ("team-siniestros", 38000, 45, 1200),
        ("team-emision", 50000, 55, 2000),
        ("team-vida", 32000, 40, 800),
        ("team-digital", 55000, 58, 2500),
    ]
    for tid, monthly, hourly, ai_cost in team_costs_data:
        db.add(TeamCost(team_id=tid, monthly_cost=monthly, hourly_rate=hourly, ai_licenses_cost=ai_cost))

    db.commit()
    db.close()
    print("✅ Seed completed: 5 teams, 5 users, 20 DORA records, 150+ flow items, 22 demands, 15 allocations, 5 dependencies, 30+ DevEx responses, 30 predictability records, 5 team costs")


if __name__ == "__main__":
    seed()
