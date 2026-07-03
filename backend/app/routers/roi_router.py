"""Router de ROI, Value Stream y Health Scores."""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.entities import Team, DoraMetric, FlowItem, FlowStage, Dependency, Allocation
from app.models.roi import TeamCost

router = APIRouter(prefix="/api/v1/roi", tags=["ROI & Value Stream"])


@router.get("/overview", summary="ROI consolidado de engineering")
async def get_roi_overview(db: Session = Depends(get_db)):
    """Retorna métricas de ROI para todos los equipos."""
    teams = db.query(Team).all()
    team_results = []
    total_value = 0
    total_cost = 0
    total_ai_savings = 0

    for team in teams:
        cost = db.query(TeamCost).filter(TeamCost.team_id == team.id).first()
        if not cost:
            continue

        # Deployments this month (items completed recently)
        month_ago = datetime.utcnow() - timedelta(days=30)
        deployments = db.query(FlowItem).filter(
            FlowItem.team_id == team.id,
            FlowItem.stage == FlowStage.DONE,
            FlowItem.completed_at >= month_ago
        ).count()

        cost_per_deploy = round(cost.monthly_cost / max(deployments, 1), 2)

        # AI savings: hours saved * hourly_rate
        ai_items = db.query(FlowItem).filter(
            FlowItem.team_id == team.id, FlowItem.is_ai_assisted == True,
            FlowItem.cycle_time_hours.isnot(None)
        ).all()
        trad_items = db.query(FlowItem).filter(
            FlowItem.team_id == team.id, FlowItem.is_ai_assisted == False,
            FlowItem.cycle_time_hours.isnot(None)
        ).all()

        avg_ai = sum(i.cycle_time_hours for i in ai_items) / max(len(ai_items), 1)
        avg_trad = sum(i.cycle_time_hours for i in trad_items) / max(len(trad_items), 1)
        hours_saved = (avg_trad - avg_ai) * len(ai_items) if avg_trad > avg_ai else 0
        savings = round(hours_saved * cost.hourly_rate, 2)
        ai_roi = round(savings - cost.ai_licenses_cost, 2)

        # Engineering ROI = (value delivered - cost) / cost
        value_delivered = deployments * 2500  # estimated value per deployment
        eng_roi = round(((value_delivered - cost.monthly_cost) / max(cost.monthly_cost, 1)) * 100, 1)

        total_value += value_delivered
        total_cost += cost.monthly_cost
        total_ai_savings += ai_roi

        team_results.append({
            "team_id": team.id,
            "team_name": team.name,
            "monthly_cost": cost.monthly_cost,
            "deployments_month": deployments,
            "cost_per_deployment": cost_per_deploy,
            "savings_from_automation": savings,
            "ai_roi": ai_roi,
            "engineering_roi_pct": eng_roi,
        })

    total_roi = round(((total_value - total_cost) / max(total_cost, 1)) * 100, 1)

    return {
        "teams": team_results,
        "total_engineering_roi_pct": total_roi,
        "total_ai_savings": total_ai_savings,
    }


@router.get("/value-stream/{team_id}", summary="Value Stream Map de una célula")
async def get_value_stream(team_id: str, db: Session = Depends(get_db)):
    """Retorna tiempos promedio por etapa del flujo de valor."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(404, "Equipo no encontrado")

    completed = db.query(FlowItem).filter(
        FlowItem.team_id == team_id, FlowItem.cycle_time_hours.isnot(None)
    ).all()

    # Calculate avg time per stage
    c2c = [i.concept_to_commit_hours for i in completed if i.concept_to_commit_hours]
    c2d = [i.commit_to_deploy_hours for i in completed if i.commit_to_deploy_hours]
    d2v = [i.deploy_to_value_hours for i in completed if i.deploy_to_value_hours]

    avg_c2c = round(sum(c2c) / max(len(c2c), 1), 1)
    avg_c2d = round(sum(c2d) / max(len(c2d), 1), 1)
    avg_d2v = round(sum(d2v) / max(len(d2v), 1), 1)

    # Items currently in each stage
    in_progress = db.query(FlowItem).filter(FlowItem.team_id == team_id, FlowItem.stage == FlowStage.IN_PROGRESS).count()
    in_review = db.query(FlowItem).filter(FlowItem.team_id == team_id, FlowItem.stage == FlowStage.REVIEW).count()
    in_testing = db.query(FlowItem).filter(FlowItem.team_id == team_id, FlowItem.stage == FlowStage.TESTING).count()
    in_backlog = db.query(FlowItem).filter(FlowItem.team_id == team_id, FlowItem.stage == FlowStage.BACKLOG).count()
    done = db.query(FlowItem).filter(FlowItem.team_id == team_id, FlowItem.stage == FlowStage.DONE).count()

    stages = [
        {"name": "Backlog", "avg_hours": 0, "items_in_stage": in_backlog},
        {"name": "Development", "avg_hours": avg_c2c, "items_in_stage": in_progress},
        {"name": "Review", "avg_hours": round(avg_c2d * 0.4, 1), "items_in_stage": in_review},
        {"name": "Testing", "avg_hours": round(avg_c2d * 0.6, 1), "items_in_stage": in_testing},
        {"name": "Deployment", "avg_hours": avg_d2v, "items_in_stage": 0},
        {"name": "Done", "avg_hours": 0, "items_in_stage": done},
    ]

    total = avg_c2c + avg_c2d + avg_d2v
    active_time = avg_c2c + avg_d2v
    flow_eff = round((active_time / max(total, 1)) * 100, 1)

    # Bottleneck = stage with highest avg_hours
    bottleneck = max(stages, key=lambda s: s["avg_hours"])["name"]

    return {
        "team_id": team_id,
        "stages": stages,
        "total_lead_time_hours": round(total, 1),
        "flow_efficiency_pct": flow_eff,
        "bottleneck": bottleneck,
    }


@router.get("/health-scores", summary="Health Score compuesto por equipo")
async def get_health_scores(db: Session = Depends(get_db)):
    """Retorna score 0-100 por equipo combinando DORA + Flow + DevEx + WIP + Predictability."""
    teams = db.query(Team).all()
    results = []

    for team in teams:
        # DORA score (30%)
        latest_dora = db.query(DoraMetric).filter(DoraMetric.team_id == team.id).order_by(DoraMetric.week_start.desc()).first()
        if latest_dora:
            if latest_dora.deployment_frequency >= 15 and latest_dora.lead_time_hours <= 3:
                dora_score = 100
            elif latest_dora.deployment_frequency >= 8 and latest_dora.lead_time_hours <= 8:
                dora_score = 75
            elif latest_dora.deployment_frequency >= 4 and latest_dora.lead_time_hours <= 15:
                dora_score = 50
            else:
                dora_score = 25
        else:
            dora_score = 0

        # Flow efficiency (20%)
        completed = db.query(FlowItem).filter(FlowItem.team_id == team.id, FlowItem.cycle_time_hours.isnot(None)).all()
        if completed:
            total_cycle = sum(i.cycle_time_hours for i in completed)
            active = sum((i.commit_to_deploy_hours or 0) for i in completed)
            flow_score = min(round((active / max(total_cycle, 1)) * 100, 0), 100)
        else:
            flow_score = 50

        # DevEx (20%) - from devex_responses
        from app.models.devex import DevExResponse
        devex_responses = db.query(DevExResponse).filter(DevExResponse.team_id == team.id).all()
        if devex_responses:
            avg_devex = sum(
                (r.facilidad_deploy + r.feedback_pr + r.interrupciones + r.claridad_reqs + r.satisfaccion_herramientas) / 5
                for r in devex_responses
            ) / len(devex_responses)
            devex_score = round((avg_devex / 5) * 100, 0)
        else:
            devex_score = 50

        # WIP health (15%)
        wip_current = db.query(FlowItem).filter(FlowItem.team_id == team.id, FlowItem.stage == FlowStage.IN_PROGRESS).count()
        wip_score = 100 if wip_current <= team.wip_limit else max(0, round(100 - (wip_current - team.wip_limit) * 25, 0))

        # Predictability (15%)
        from app.models.predictability import PredictabilityRecord
        pred_records = db.query(PredictabilityRecord).filter(PredictabilityRecord.team_id == team.id).all()
        if pred_records:
            pred_score = round(sum(r.predictability_pct for r in pred_records) / len(pred_records), 0)
        else:
            pred_score = 50

        # Composite
        health = round(dora_score * 0.3 + flow_score * 0.2 + devex_score * 0.2 + wip_score * 0.15 + pred_score * 0.15, 0)

        # Priority area
        scores = {"DORA": dora_score, "Flow": flow_score, "DevEx": devex_score, "WIP": wip_score, "Predictability": pred_score}
        priority = min(scores, key=scores.get)

        results.append({
            "team_id": team.id,
            "team_name": team.name,
            "health_score": health,
            "dora_score": dora_score,
            "flow_score": flow_score,
            "devex_score": devex_score,
            "wip_score": wip_score,
            "predictability_score": pred_score,
            "priority_area": priority,
        })

    results.sort(key=lambda x: x["health_score"], reverse=True)
    return results
