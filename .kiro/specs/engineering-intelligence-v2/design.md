# Diseño Técnico — Engineering Intelligence Platform v2

## Overview

Implementación de 6 nuevos requerimientos funcionales que completan la plataforma para el Hackathon. Se prioriza Login + Dashboard (P1) como base, seguido de DevEx y Reporte CTO (P2), y Lead Time Breakdown + Predictability (P3).

## Architecture

### Nuevos Componentes

```
Frontend (React)
├── /login              → LoginPage (NF-01)
├── /dashboard          → DashboardPage (NF-02)
├── /devex              → DevExPage (NF-03)
├── /report             → ExecutiveReportPage (NF-04)
├── /flow               → (extender con Lead Time Breakdown) (NF-05)
└── /predictability     → PredictabilityPage (NF-06)

Backend (FastAPI)
├── POST /api/v1/auth/login         → (ya existe)
├── GET  /api/v1/dashboard/summary  → (nuevo: dashboard consolidado)
├── POST /api/v1/devex/responses    → (nuevo: registrar respuesta)
├── GET  /api/v1/devex/results      → (nuevo: resultados agregados)
├── GET  /api/v1/report/executive   → (nuevo: reporte CTO)
├── GET  /api/v1/flow/{id}/lead-time-breakdown → (nuevo: lead time por etapa)
├── POST /api/v1/predictability     → (nuevo: registrar periodo)
├── GET  /api/v1/predictability     → (nuevo: historial)
```

### Nuevos Modelos de Datos

```python
# DevEx Survey
class DevExResponse(Base):
    id: int (PK)
    user_id: str (FK)
    team_id: str (FK)
    period: str  # "2026-07" formato año-mes
    facilidad_deploy: int (1-5)
    feedback_pr: int (1-5)
    interrupciones: int (1-5)
    claridad_reqs: int (1-5)
    satisfaccion_herramientas: int (1-5)
    created_at: datetime

# Predictability
class PredictabilityRecord(Base):
    id: int (PK)
    team_id: str (FK)
    period_name: str  # "Sprint 12" o "PI 2026-Q2"
    items_committed: int
    items_completed: int
    predictability_pct: float  # calculado
    deviation_cause: str  # scope_creep | dependencias | bugs | capacity
    created_at: datetime
```

### Auth Flow (Frontend)

```
LoginPage → POST /auth/login → JWT
         → setAuthToken(jwt) → redirect /dashboard
         
ProtectedRoute wrapper → si no hay token → redirect /login
                       → si hay token → render children

Topbar → mostrar nombre usuario (GET /auth/me)
       → botón "Cerrar sesión" → clearToken → redirect /login
```

### Dashboard Data Flow

```
DashboardPage mount → Parallel requests:
  1. GET /api/v1/dora → promedio deploy frequency
  2. GET /api/v1/flow/{first_team} → cycle time P50
  3. GET /api/v1/wip → equipos overloaded count
  4. GET /api/v1/demands → pendientes count
  5. GET /api/v1/dependencies?resolved=false → pending deps

Render:
  - 4 KPI cards (clickeables → navegan a detalle)
  - Alertas activas (list)
  - Ranking equipos por benchmark DORA
```

### Executive Report Logic

Recomendaciones automáticas generadas por reglas:
- Si WIP > 100% → "Considerar redistribuir carga de [equipo]"
- Si dependency aging > 5d → "Escalar bloqueo entre [A] y [B]"
- Si tech_debt + defects > 40% → "Revisar allocation de [equipo]"
- Si cycle_time P85 > 24h → "Investigar bottlenecks en [equipo]"

## Tokens SB-UI

| Componente | Uso |
|---|---|
| `sb-ui-card sb-ui-card--elevated` | Todas las tarjetas |
| `sb-ui-input` | Formularios (login, devex, predictability) |
| `sb-ui-select` | Dropdowns de equipo |
| `sb-ui-button--primary--fill` | Acciones principales |
| `sb-ui-button--secondary--stroke` | Acciones secundarias |
| `sb-ui-table--striped--hover` | Tablas de datos |
| `sb-ui-alert--info/success/warning/error` | Alertas y mensajes |
| `sb-ui-badge` | Badges de estado |
| `sb-ui-spinner` | Loading states |
| `sb-ui-radio` | Encuesta DevEx (escala) |
| `sb-ui-grid / sb-ui-col-*` | Layout responsivo |

## Archivos a Crear

| Archivo | Tipo |
|---|---|
| `backend/app/models/devex.py` | Modelo SQLAlchemy DevExResponse |
| `backend/app/models/predictability.py` | Modelo SQLAlchemy PredictabilityRecord |
| `backend/app/routers/devex_router.py` | POST/GET encuesta DevEx |
| `backend/app/routers/predictability_router.py` | POST/GET predictability |
| `backend/app/routers/dashboard_router.py` | GET dashboard consolidado |
| `backend/app/routers/report_router.py` | GET reporte ejecutivo |
| `src/pages/login/LoginPage.tsx` | UI Login |
| `src/pages/dashboard/DashboardPage.tsx` | Dashboard Cockpit |
| `src/pages/devex/DevExPage.tsx` | Encuesta + Resultados |
| `src/pages/report/ExecutiveReportPage.tsx` | Reporte CTO |
| `src/pages/predictability/PredictabilityPage.tsx` | Registro + Historial |
| `src/layouts/ProtectedRoute.tsx` | Wrapper de autenticación |
