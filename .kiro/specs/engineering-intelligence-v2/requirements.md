# Requerimientos Funcionales — Engineering Intelligence Platform v2

## Análisis de Cobertura Actual vs. Entregables Requeridos

### ✅ Ya Implementado

| HU | Funcionalidad | Estado |
|----|---------------|--------|
| HU-M01 | 5 DORA metrics con tendencia y benchmark | ✅ Completo |
| HU-M02 | Cycle time (P50/P85/P95), throughput, flow efficiency | ✅ Completo |
| HU-M03 | CFD (Cumulative Flow Diagram) | ✅ Básico (barras apiladas) |
| HU-M04 | CRUD Demanda con WSJF | ✅ Completo |
| HU-M05 | Capacity vs Demand con alertas | ✅ Completo |
| HU-M06 | Allocation por tipo (features/defects/debt/risk) | ✅ Completo |
| HU-M07 | Dependencias entre células con aging y SLA | ✅ Completo |
| HU-M08 | Lead time desglosado (concept/commit/deploy/value) | ⚠️ Datos en DB, sin UI dedicada |
| HU-M11 | WIP alerts con límites | ✅ Completo |
| HU-M13 | AI Impact Chart (IA vs Tradicional) | ✅ Completo |
| RT-04 | API REST OpenAPI | ✅ Swagger en /docs |
| RT-05 | PostgreSQL/SQLite con modelos | ✅ Completo |
| RT-06 | JWT Auth | ✅ Endpoints funcionales |
| RT-07 | Separación de capas | ✅ Router/Service/Model |
| RT-10 | Endpoint /api/v1/flujo/summary estandarizado | ✅ Completo |

### ❌ No Implementado — Oportunidades

| HU | Funcionalidad | Gap |
|----|---------------|-----|
| HU-M09 | Encuesta DevEx (5 preguntas, escala 1-5) | No existe |
| HU-M10 | Reporte Ejecutivo para CTO (one-pager) | Solo endpoint, sin UI |
| HU-M12 | Retrospectiva PI (predictability score) | No existe |
| — | Login UI (pantalla de autenticación) | Backend listo, frontend sin UI |
| — | Dashboard unificado (cockpit) | No existe |
| — | Notificaciones de alertas en tiempo real | No existe |

---

## Nuevos Requerimientos Funcionales

### Requerimiento NF-01: Pantalla de Login con JWT

**Historia de Usuario:** Como usuario, quiero poder autenticarme con email y contraseña para acceder a la plataforma de forma segura.

#### Criterios de Aceptación

- NF-01.1 LA página de Login DEBERÁ mostrar un formulario con campos email y contraseña usando componentes SB-UI (sb-ui-input, sb-ui-button).
- NF-01.2 CUANDO las credenciales sean válidas, el sistema DEBERÁ guardar el JWT en estado de la aplicación y redirigir al dashboard.
- NF-01.3 CUANDO las credenciales sean inválidas, DEBERÁ mostrar un sb-ui-alert--error con mensaje "Credenciales inválidas".
- NF-01.4 SI el usuario no tiene token válido, DEBERÁ ser redirigido al login automáticamente.
- NF-01.5 DEBERÁ existir un botón de "Cerrar sesión" en el Topbar que elimina el token y redirige al login.

### Requerimiento NF-02: Dashboard Ejecutivo / Cockpit

**Historia de Usuario:** Como CTO, quiero un dashboard unificado que muestre el estado de salud de engineering en un vistazo, con los KPIs principales y alertas activas.

#### Criterios de Aceptación

- NF-02.1 EL Dashboard DEBERÁ ser la página principal después del login (ruta `/dashboard`).
- NF-02.2 DEBERÁ mostrar 4 tarjetas resumen: Deploy Frequency promedio, Cycle Time P50 promedio, WIP (equipos sobrecargados), Demandas pendientes.
- NF-02.3 DEBERÁ mostrar una sección "Alertas Activas" con: equipos en Overload_State, dependencias que superan SLA (>5 días), allocation con debt+defects >40%.
- NF-02.4 DEBERÁ mostrar un ranking de equipos por salud (basado en benchmark DORA).
- NF-02.5 Cada tarjeta DEBERÁ ser clickeable y navegar a la página de detalle correspondiente.

### Requerimiento NF-03: Encuesta DevEx (HU-M09)

**Historia de Usuario:** Como desarrollador, quiero responder una encuesta corta de experiencia de desarrollo para que mi equipo pueda mejorar el entorno de trabajo.

#### Criterios de Aceptación

- NF-03.1 LA encuesta DEBERÁ tener 5 preguntas con escala 1-5:
  1. "¿Qué tan fácil es hacer deploy?" (facilidad_deploy)
  2. "¿Qué tan rápido recibes feedback en tus PRs?" (feedback_pr)
  3. "¿Cuántas interrupciones tienes al día?" (interrupciones — invertida)
  4. "¿Qué tan claros son los requerimientos?" (claridad_reqs)
  5. "¿Qué tan satisfecho estás con las herramientas?" (satisfaccion_herramientas)
- NF-03.2 EL formulario DEBERÁ usar componentes SB-UI (sb-ui-radio o slider visual).
- NF-03.3 AL enviar, los resultados DEBERÁN persistir en backend (POST /api/v1/devex/responses).
- NF-03.4 DEBERÁ existir una vista de resultados agregados por equipo con promedios y tendencia mensual.
- NF-03.5 EL usuario solo puede responder una vez por periodo (validación backend).

### Requerimiento NF-04: Reporte Ejecutivo CTO (HU-M10 — UI)

**Historia de Usuario:** Como VP de Tecnología, quiero ver un reporte ejecutivo one-pager con el estado de delivery, bottlenecks y recomendaciones para presentar al board.

#### Criterios de Aceptación

- NF-04.1 LA página de reporte DEBERÁ mostrar: tabla DORA por equipo con semáforo (verde/amarillo/rojo), top 3 bottlenecks, balance de allocation actual vs target.
- NF-04.2 DEBERÁ incluir "Recomendaciones automáticas" generadas por lógica de negocio (ej: "Equipo Siniestros tiene WIP 120% — considerar redistribuir carga").
- NF-04.3 DEBERÁ tener un botón "Exportar PDF" que genera un snapshot descargable (o copiar al portapapeles).
- NF-04.4 Los datos DEBERÁN actualizarse al cargar la página (no cache).

### Requerimiento NF-05: Lead Time Breakdown (HU-M08 — UI)

**Historia de Usuario:** Como usuario de Métodos, quiero ver el lead time desglosado por etapa (concept-to-commit, commit-to-deploy, deploy-to-value) para identificar dónde se pierde tiempo.

#### Criterios de Aceptación

- NF-05.1 DEBERÁ mostrar un breakdown visual (stacked bar horizontal) del lead time por etapa para la célula seleccionada.
- NF-05.2 DEBERÁ mostrar el promedio de cada etapa y el total.
- NF-05.3 DEBERÁ resaltar visualmente la etapa que consume >50% del tiempo total.
- NF-05.4 DEBERÁ poder filtrar por equipo.

### Requerimiento NF-06: Retrospectiva de PI / Predictability Score (HU-M12)

**Historia de Usuario:** Como Agile Coach, quiero registrar lo comprometido vs. lo entregado por sprint/PI para calcular el predictability score y mejorar la planificación.

#### Criterios de Aceptación

- NF-06.1 DEBERÁ existir un formulario para registrar: periodo (sprint/PI), items comprometidos, items completados, por equipo.
- NF-06.2 EL sistema DEBERÁ calcular Predictability = (completados / comprometidos) × 100.
- NF-06.3 DEBERÁ mostrar tendencia de predictability (últimos 4-6 periodos) por equipo.
- NF-06.4 DEBERÁ clasificar causas de desvío: scope_creep, dependencias, bugs, capacity.
- NF-06.5 DEBERÁ tener un selector de equipo y mostrar el histórico.

---

## Priorización para MVP del Hackathon

| Prioridad | Requerimiento | Justificación |
|-----------|---------------|---------------|
| 🔴 P1 | NF-01: Login UI | Sin auth el producto no se demuestra completo |
| 🔴 P1 | NF-02: Dashboard Ejecutivo | El CTO necesita un "landing" con la foto completa |
| 🟡 P2 | NF-03: Encuesta DevEx | Diferenciador "people first" del equipo |
| 🟡 P2 | NF-04: Reporte CTO | Demuestra valor ejecutivo de la plataforma |
| 🟢 P3 | NF-05: Lead Time Breakdown | Ya hay datos, solo falta UI |
| 🟢 P3 | NF-06: Predictability | Requiere nuevo modelo + CRUD |
