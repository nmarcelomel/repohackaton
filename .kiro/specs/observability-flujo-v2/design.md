# Diseño Técnico: Módulo de Observabilidad v2 (/flujo) — Full Stack

## Overview

Implementación full-stack del módulo `/flujo`. Incluye un backend con FastAPI que expone APIs REST de observabilidad (equipos, métricas DORA, WIP, impacto IA) y un frontend React que consume esos endpoints. El frontend aplica los criterios de aceptación definitivos del Hackathon.

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Backend | Python 3.12 + FastAPI | Stack aprobado corporativo, ideal para APIs rápidas |
| Validación | Pydantic | Tipado estricto de request/response |
| Frontend | React 18 + TypeScript + Vite | Ya existente en el proyecto |
| HTTP Client | Fetch API nativo | Sin dependencias adicionales para MVP |
| Estado | React Context API | Estado compartido isOverloaded entre módulos |

## Architecture

### Diagrama General

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React + Vite) — localhost:5173            │
│                                                     │
│  FlujoPage                                          │
│  ├── CellSelector (sb-ui-select)                    │
│  ├── DoraMetricsCards → MetricCard × 2              │
│  ├── WipAlertBar → Shared_Team_State (Context)      │
│  └── AIImpactChart                                  │
│                                                     │
│  src/data/api-client.ts ←── HTTP fetch ───┐         │
└───────────────────────────────────────────┼─────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────┐
│  Backend (FastAPI) — localhost:8000                  │
│                                                     │
│  GET /api/v1/teams                                  │
│  GET /api/v1/teams/{teamId}/observability           │
│                                                     │
│  Capas:                                             │
│  ├── router (observability_router.py)               │
│  ├── service (observability_service.py)             │
│  └── data (mock en memoria, reemplazable por DB)    │
└─────────────────────────────────────────────────────┘
```

### Endpoints API

| Método | Path | Response | Descripción |
|--------|------|----------|-------------|
| GET | `/api/v1/teams` | `Team[]` | Lista todas las células |
| GET | `/api/v1/teams/{teamId}/observability` | `ObservabilityMetrics` | Métricas DORA, WIP, IA para una célula |

### Modelos Pydantic (Backend)

```python
class DoraMetricsResponse(BaseModel):
    deployment_frequency: int
    lead_time_for_changes: float
    change_failure_rate: float
    mttr: float

class ObservabilityMetricsResponse(BaseModel):
    deployment_frequency: int
    cycle_time: float
    wip_actual: int
    wip_limit: int
    ai_cycle_time: float
    traditional_cycle_time: float

class TeamResponse(BaseModel):
    id: str
    name: str
    wip_limit: int
    wip_current: int
    dora_metrics: DoraMetricsResponse
```

### Frontend — API Client

Se crea `src/data/api-client.ts` que reemplaza la importación directa de `mock-data.json`. Funciones async que hacen fetch al backend:

```typescript
const API_BASE = "http://localhost:8000/api/v1";

export async function fetchTeams(): Promise<Team[]> { ... }
export async function fetchObservabilityMetrics(teamId: string): Promise<ObservabilityMetrics> { ... }
```

### Frontend — Custom Hook

Se crea `src/pages/flujo/hooks/useObservabilityData.ts`:
- Maneja loading, error, y data
- Llama a `fetchTeams()` al montar
- Llama a `fetchObservabilityMetrics(teamId)` cuando cambia la célula
- Expone: `{ teams, metrics, isLoading, error, selectedTeamId, setSelectedTeamId }`

## Decisiones de Diseño

### Separación Backend/Frontend

Aunque el requerimiento menciona "Data_Service (mock-data.json)", para la demostración del Hackathon un backend real muestra madurez técnica y permite:
- Simular latencia y loading states reales
- Demostrar arquitectura de capas
- Facilitar conexión futura a bases de datos reales
- El frontend consume vía HTTP, igual que en producción

### CORS

El backend habilita CORS para `localhost:5173` (desarrollo). En producción se restringe al dominio corporativo.

### Mock Data en Backend

Los datos se mantienen en memoria (dict/list) dentro del backend. No se usa base de datos para el MVP — se puede conectar PostgreSQL después sin cambiar la API.

### CellSelector como sb-ui-select

Requerimiento 5.1 exige "Dropdown de la SB_UI". Se usa `<select class="sb-ui-select">`.

### Textos Exactos

- WIP Tooltip (req 3.2): "Un WIP alto dilata las entregas. En lugar de presionar al equipo, te sugerimos apoyarte en un experto técnico (búscalo en Talento) para destrabar los pases a producción."
- Overload (req 2.4): "🚨 Sobrecarga de trabajo"
- WIP labels (req 2.2): "Actual: X / Límite: Y"
- AI Chart (req 4.2): "Cycle Time Tradicional" / "Cycle Time con Asistencia IA"

## Estructura de Archivos

```
RepoBase/
├── backend/                          ← NUEVO
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   ← FastAPI app, CORS, router mount
│   │   ├── models.py                 ← Pydantic models
│   │   ├── mock_data.py              ← Datos en memoria
│   │   ├── observability_service.py  ← Lógica de negocio
│   │   └── observability_router.py   ← Endpoints REST
│   └── requirements.txt              ← fastapi, uvicorn
├── src/
│   ├── data/
│   │   ├── api-client.ts             ← NUEVO: fetch al backend
│   │   ├── data-service.ts           ← Se mantiene como fallback
│   │   └── mock-data.json            ← Se mantiene
│   ├── pages/flujo/
│   │   ├── hooks/
│   │   │   └── useObservabilityData.ts  ← NUEVO: custom hook async
│   │   ├── components/
│   │   │   ├── CellSelector.tsx      ← MODIFICADO: dropdown sb-ui-select
│   │   │   ├── WipAlertBar.tsx       ← MODIFICADO: textos exactos
│   │   │   ├── AIImpactChart.tsx     ← MODIFICADO: labels exactos
│   │   │   ├── DoraMetricsCards.tsx  ← Sin cambios
│   │   │   ├── MetricCard.tsx        ← Sin cambios
│   │   │   └── EducationalTooltip.tsx← Sin cambios
│   │   ├── context/
│   │   │   └── TeamStateContext.tsx  ← Sin cambios
│   │   └── FlujoPage.tsx             ← MODIFICADO: usa hook async
```

## Tokens SB_UI utilizados

| Uso | Clase/Token |
|---|---|
| Cards | `sb-ui-card sb-ui-card--elevated` |
| Select/Dropdown | `sb-ui-select` |
| Texto label | `sb-ui-text-label` |
| Heading | `sb-ui-heading-h6` |
| Color primario | `bg-bolivar-green` |
| Color error | `text-red-600` / `bg-red-500` |
| Color neutro | `bg-bolivar-gray-light` / `text-bolivar-gray-muted` |
| Ícono info | `fa-solid fa-circle-info` |
