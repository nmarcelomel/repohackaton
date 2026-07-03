# Implementation Plan: Engineering Intelligence v2 — Nuevas Funcionalidades

## Overview

6 nuevos módulos funcionales que completan la plataforma: Login con JWT, Dashboard Ejecutivo, Encuesta DevEx, Reporte CTO, Lead Time Breakdown, y Predictability Score. Todo con interacción real (CRUD, formularios, navegación protegida) y componentes SB-UI estrictos.

## Tasks

- [x] 1. Backend: Nuevos modelos y endpoints
  - [x] 1.1 Crear modelo DevExResponse en backend/app/models/devex.py
    - Campos: id, user_id, team_id, period, facilidad_deploy, feedback_pr, interrupciones, claridad_reqs, satisfaccion_herramientas, created_at
    - Constraint: unique(user_id, team_id, period) — un usuario solo responde una vez por periodo
    - _Requirements: NF-03.3, NF-03.5_

  - [x] 1.2 Crear modelo PredictabilityRecord en backend/app/models/predictability.py
    - Campos: id, team_id, period_name, items_committed, items_completed, predictability_pct (calculado), deviation_cause, created_at
    - _Requirements: NF-06.1, NF-06.2_

  - [x] 1.3 Crear router backend/app/routers/devex_router.py
    - POST /api/v1/devex/responses — registrar respuesta de encuesta
    - GET /api/v1/devex/results?team_id={id} — resultados agregados por equipo
    - Validar que no se duplique respuesta por usuario/periodo
    - _Requirements: NF-03.3, NF-03.4, NF-03.5_

  - [x] 1.4 Crear router backend/app/routers/predictability_router.py
    - POST /api/v1/predictability — registrar periodo (calcula predictability_pct automáticamente)
    - GET /api/v1/predictability?team_id={id} — historial por equipo
    - _Requirements: NF-06.1, NF-06.2, NF-06.3_

  - [x] 1.5 Crear router backend/app/routers/dashboard_router.py
    - GET /api/v1/dashboard — datos consolidados: avg deploy freq, avg cycle time p50, wip overloaded count, pending demands, pending deps, team ranking
    - _Requirements: NF-02.1, NF-02.2, NF-02.3, NF-02.4_

  - [x] 1.6 Crear router backend/app/routers/report_router.py
    - GET /api/v1/report/executive — reporte CTO: tabla DORA con semáforo, top 3 bottlenecks, allocation balance, recomendaciones automáticas
    - _Requirements: NF-04.1, NF-04.2_

  - [x] 1.7 Agregar endpoint GET /api/v1/flow/{team_id}/lead-time-breakdown al flow_router
    - Promedio de concept_to_commit, commit_to_deploy, deploy_to_value para items completados
    - _Requirements: NF-05.1, NF-05.2_

  - [x] 1.8 Registrar nuevos routers en main.py y actualizar seed con datos DevEx y Predictability
    - _Requirements: Infraestructura_

- [x] 2. Frontend: Auth Flow
  - [x] 2.1 Crear src/pages/login/LoginPage.tsx
    - Formulario con sb-ui-input (email, password) y sb-ui-button
    - Manejo de error con sb-ui-alert--error
    - Llamada a login() del api-client, guardar token en estado
    - Redirect a /dashboard on success
    - _Requirements: NF-01.1, NF-01.2, NF-01.3_

  - [x] 2.2 Crear src/layouts/ProtectedRoute.tsx
    - Si no hay token → redirect a /login
    - Si hay token → render children
    - _Requirements: NF-01.4_

  - [x] 2.3 Actualizar Topbar con nombre de usuario y botón "Cerrar sesión"
    - _Requirements: NF-01.5_

  - [x] 2.4 Actualizar App.tsx con rutas protegidas y login público
    - Ruta /login → LoginPage (pública)
    - Todas las demás rutas → ProtectedRoute wrapper
    - Nueva ruta /dashboard → DashboardPage
    - Nuevas rutas: /devex, /report, /predictability
    - _Requirements: NF-01.4, NF-02.1_

- [x] 3. Frontend: Dashboard Ejecutivo
  - [x] 3.1 Crear src/pages/dashboard/DashboardPage.tsx
    - 4 KPI cards clickeables (sb-ui-card): Deploy Freq avg, Cycle Time P50, WIP Alerts, Demands pendientes
    - Sección "Alertas Activas" con sb-ui-alert por cada alerta
    - Ranking de equipos por benchmark DORA (sb-ui-table)
    - Consume GET /api/v1/dashboard
    - _Requirements: NF-02.1, NF-02.2, NF-02.3, NF-02.4, NF-02.5_

- [x] 4. Frontend: Encuesta DevEx
  - [x] 4.1 Crear src/pages/devex/DevExPage.tsx
    - Dos tabs: "Responder Encuesta" y "Ver Resultados"
    - Formulario con 5 preguntas (sb-ui-radio, escala 1-5)
    - Al enviar → POST /api/v1/devex/responses → sb-ui-alert--success
    - Resultados: tabla con promedios por pregunta por equipo
    - _Requirements: NF-03.1, NF-03.2, NF-03.3, NF-03.4_

- [x] 5. Frontend: Reporte Ejecutivo CTO
  - [x] 5.1 Crear src/pages/report/ExecutiveReportPage.tsx
    - Tabla DORA por equipo con semáforo (badge verde/amarillo/rojo)
    - Top 3 Bottlenecks con descripción
    - Balance de allocation (actual vs target 70/15/10/5)
    - Recomendaciones automáticas (list)
    - _Requirements: NF-04.1, NF-04.2, NF-04.3_

- [x] 6. Frontend: Lead Time Breakdown (integrar en FlowPage)
  - [x] 6.1 Agregar sección Lead Time Breakdown en FlowPage.tsx
    - Stacked bar horizontal: concept_to_commit | commit_to_deploy | deploy_to_value
    - Etiquetas con horas promedio
    - Highlight de etapa >50% del total
    - _Requirements: NF-05.1, NF-05.2, NF-05.3_

- [x] 7. Frontend: Predictability Score
  - [x] 7.1 Crear src/pages/predictability/PredictabilityPage.tsx
    - Formulario para registrar periodo: selector equipo, nombre periodo, items comprometidos, items completados, causa de desvío
    - Tabla historial con predictability_pct y tendencia
    - Barra visual de predictability (verde >85%, amarillo 70-85%, rojo <70%)
    - _Requirements: NF-06.1, NF-06.2, NF-06.3, NF-06.4, NF-06.5_

- [x] 8. Actualizar navegación (Sidebar) con nuevas rutas
  - Agregar: Dashboard, DevEx, Reporte CTO, Predictability
  - _Requirements: Navegación_

- [x] 9. Verificación final
  - [x] 9.1 TypeScript build sin errores
  - [x] 9.2 Backend endpoints verificados con curl
  - [x] 9.3 Frontend navega correctamente entre todas las páginas

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "1.5", "1.6", "1.7"] },
    { "id": 2, "tasks": ["1.8"] },
    { "id": 3, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 4, "tasks": ["3.1", "4.1", "5.1", "6.1", "7.1"] },
    { "id": 5, "tasks": ["8"] },
    { "id": 6, "tasks": ["9.1", "9.2", "9.3"] }
  ]
}
```

## Notes

- El Login es simplificado para el Hackathon: no usa httpOnly cookies sino estado en memoria (perdido al refrescar). Esto es intencionado para demo — en producción se migraría a cookies.
- Credenciales de demo: admin@segurosbolivar.com / admin123
- Todos los formularios validan en frontend Y en backend (double validation)
- Las recomendaciones del reporte ejecutivo son rule-based, no IA generativa (determinísticas y explicables)
- El DevEx usa periodo formato "YYYY-MM" para agrupar respuestas mensuales
- El Predictability Score se calcula server-side al crear el registro
