# Implementation Plan: Observability Flujo v2 — Full Stack

## Overview

Implementación full-stack del módulo `/flujo`. Se crea un backend FastAPI con endpoints REST de observabilidad, un API client en el frontend, un custom hook async, y se ajustan los componentes existentes para cumplir los criterios de aceptación definitivos.

## Tasks

- [x] 1. Crear Backend FastAPI
  - [x] 1.1 Crear estructura del proyecto backend
    - Crear directorio `backend/app/`
    - Crear `backend/requirements.txt` con fastapi==0.115.0 y uvicorn==0.30.0
    - Crear `backend/app/__init__.py` vacío
    - _Requirements: Infraestructura_

  - [x] 1.2 Crear modelos Pydantic en backend/app/models.py
    - Clase DoraMetricsResponse: deployment_frequency (int), lead_time_for_changes (float), change_failure_rate (float), mttr (float)
    - Clase ObservabilityMetricsResponse: deployment_frequency (int), cycle_time (float), wip_actual (int), wip_limit (int), ai_cycle_time (float), traditional_cycle_time (float)
    - Clase TeamResponse: id (str), name (str), wip_limit (int), wip_current (int), dora_metrics (DoraMetricsResponse)
    - _Requirements: 1.1, 5.1_

  - [x] 1.3 Crear datos mock en backend/app/mock_data.py
    - Lista de equipos con datos equivalentes al mock-data.json del frontend
    - Equipo "Siniestros" con wip_current=7 > wip_limit=5 para probar Overload_State
    - ai_cycle_time = 70% de traditional_cycle_time por equipo
    - _Requirements: 2.4, 4.2_

  - [x] 1.4 Crear servicio de observabilidad en backend/app/observability_service.py
    - Función get_all_teams() → list[TeamResponse]
    - Función get_observability_metrics(team_id: str) → ObservabilityMetricsResponse
    - Raise HTTPException(404) si el team_id no existe
    - Cálculo de ai_cycle_time como 70% de traditional_cycle_time
    - _Requirements: 1.1, 1.3, 4.2_

  - [x] 1.5 Crear router REST en backend/app/observability_router.py
    - GET /api/v1/teams → lista de equipos (TeamResponse[])
    - GET /api/v1/teams/{team_id}/observability → ObservabilityMetricsResponse
    - Documentación OpenAPI con @Tag, @Operation summary
    - _Requirements: 1.1, 5.1_

  - [x] 1.6 Crear app principal en backend/app/main.py
    - FastAPI app con title, version, description
    - CORS middleware habilitando localhost:5173
    - Montar observability_router con prefix /api/v1
    - Health check en GET /health
    - _Requirements: Infraestructura_

- [x] 2. Crear API Client en Frontend
  - [x] 2.1 Crear src/data/api-client.ts
    - Constante API_BASE = "http://localhost:8000/api/v1"
    - Función async fetchTeams(): Promise<Team[]> — GET /api/v1/teams, mapea snake_case a camelCase
    - Función async fetchObservabilityMetrics(teamId: string): Promise<ObservabilityMetrics> — GET /api/v1/teams/{teamId}/observability, mapea snake_case a camelCase
    - Manejo de errores con throw en status != 200
    - _Requirements: 1.1, 5.1, 5.2_

  - [x] 2.2 Crear custom hook src/pages/flujo/hooks/useObservabilityData.ts
    - Estado: teams (Team[]), metrics (ObservabilityMetrics | null), isLoading (boolean), error (string | null), selectedTeamId (string)
    - useEffect para cargar teams al montar (con fallback a data-service si backend no disponible)
    - useEffect para cargar metrics cuando selectedTeamId cambia
    - Setter setSelectedTeamId expuesto
    - _Requirements: 1.1, 1.3, 1.4, 5.2_

- [x] 3. Ajustar Componentes Frontend según Criterios de Aceptación
  - [x] 3.1 Reescribir CellSelector.tsx como Dropdown sb-ui-select
    - Reemplazar grupo de botones por `<select class="sb-ui-select">`
    - Label "Célula de desarrollo" con clase sb-ui-input-label
    - Opciones generadas desde teams[]
    - onChange dispara onTeamChange(value)
    - aria-label para accesibilidad
    - _Requirements: 5.1, 5.2_

  - [x] 3.2 Actualizar WipAlertBar.tsx con textos exactos
    - Formato texto: "Actual: {wipActual} / Límite: {wipLimit}" (req 2.2)
    - Overload text: "🚨 Sobrecarga de trabajo" con emoji (req 2.4)
    - Tooltip description exacta: "Un WIP alto dilata las entregas. En lugar de presionar al equipo, te sugerimos apoyarte en un experto técnico (búscalo en Talento) para destrabar los pases a producción." (req 3.2)
    - _Requirements: 2.2, 2.4, 3.1, 3.2, 3.3_

  - [x] 3.3 Actualizar AIImpactChart.tsx con labels exactos
    - Renombrar "Con IA" → "Cycle Time con Asistencia IA"
    - Renombrar "Tradicional" → "Cycle Time Tradicional"
    - _Requirements: 4.2, 4.3_

- [x] 4. Integrar FlujoPage con Backend
  - [x] 4.1 Refactorizar FlujoPage.tsx para usar el custom hook
    - Reemplazar llamadas síncronas a data-service por useObservabilityData()
    - Mostrar skeleton/loading mientras isLoading es true
    - Mostrar mensaje de error si hay error
    - Mantener TeamStateProvider wrapping
    - Pasar isLoading a DoraMetricsCards
    - _Requirements: 1.1, 1.3, 1.4, 5.2_

- [x] 5. Verificación final
  - [x] 5.1 Verificar TypeScript sin errores (npx tsc --noEmit) ✅ 0 errores
  - [x] 5.2 Levantar backend (uvicorn) y verificar endpoints con curl ✅ 200 OK en /health, /api/v1/teams, /api/v1/teams/{id}/observability
  - [x] 5.3 Actualizar tasks.md con estado de completitud

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "1.5"] },
    { "id": 2, "tasks": ["1.6", "2.1"] },
    { "id": 3, "tasks": ["2.2", "3.1", "3.2", "3.3"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3"] }
  ]
}
```

## Notes

- Backend usa datos en memoria (mock) — sin base de datos para el MVP
- El frontend mantiene fallback al data-service local si el backend no responde
- CORS configurado solo para localhost:5173 (desarrollo)
- Se mantiene el data-service.ts original como fallback — no se elimina
- El custom hook maneja el ciclo de vida async completo (loading, error, data)
- Snake_case en backend (Python) → camelCase en frontend (TypeScript) vía mapeo en api-client
