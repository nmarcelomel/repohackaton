"""Engineering Intelligence Platform — API principal."""

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth_router,
    teams_router,
    dora_router,
    flow_router,
    demand_router,
    capacity_router,
    wip_dependencies_router,
    summary_router,
    devex_router,
    predictability_router,
    dashboard_router,
    report_router,
    roi_router,
)

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

app = FastAPI(
    title="Engineering Intelligence Platform",
    version="1.0.0",
    description="Plataforma de métricas de flujo, DORA, allocation y demanda para Seguros Bolívar.",
    docs_url="/docs",
    openapi_url="/api/v1/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router.router)
app.include_router(teams_router.router)
app.include_router(dora_router.router)
app.include_router(flow_router.router)
app.include_router(demand_router.router)
app.include_router(capacity_router.router)
app.include_router(wip_dependencies_router.router)
app.include_router(summary_router.router)
app.include_router(devex_router.router)
app.include_router(predictability_router.router)
app.include_router(dashboard_router.router)
app.include_router(report_router.router)
app.include_router(roi_router.router)


@app.get("/health", tags=["Infraestructura"])
async def health_check() -> dict[str, str]:
    """Health check del servicio."""
    return {"status": "healthy", "service": "engineering-intelligence-api"}
