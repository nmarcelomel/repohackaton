# Requerimientos — Engineering Intelligence: ROI & Value Stream

## Investigación Base

### Fuentes de Investigación
- DORA State of DevOps 2024/2025: 5 métricas (Deployment Frequency, Lead Time, CFR, MTTR, Deployment Rework Rate)
- DevEx Framework (GitHub Research 2024): flow state, cognitive load, feedback loops
- DORA 2025 AI Report: AI amplifica lo que ya existe — equipos fuertes mejoran, sistemas frágiles se quiebran
- Value Stream Management (DevOps.com 2026): VSM como tejido conectivo entre product, engineering, ops
- Benchmarks DORA 2026: Elite (deploy multiple/day, LT <1h, CFR 0-5%, MTTR <1h)

### Principio Fundamental
"Sin medir individuos, midiendo el sistema" — La plataforma mide flujo de valor end-to-end, no productividad individual.

## Análisis de Funcionalidades Faltantes

| Funcionalidad | Impacto | Justificación |
|---|---|---|
| ROI de Engineering | 🔴 Crítico | El CTO necesita justificar inversión al board con números |
| Value Stream Map | 🔴 Crítico | Visualización end-to-end de dónde se pierde tiempo |
| AI Impact Tracker | 🟡 Alto | Cuantificar ROI de herramientas IA (Kiro, Copilot) |
| Investment Allocation | 🟡 Alto | Cuánto se invierte en cada categoría vs retorno |
| Health Score Compuesto | 🟢 Medio | Score único por equipo que resume todos los indicadores |

## Requerimientos

### REQ-ROI-01: Módulo de ROI de Engineering

**Historia de Usuario:** Como CTO, quiero ver el retorno sobre la inversión de engineering cuantificado en métricas financieras, para demostrar el valor de la organización técnica al board.

#### Criterios de Aceptación

- ROI-01.1 DEBERÁ calcular "Cost per Deployment" = (costo_equipo_mensual / deployments_mes) por célula.
- ROI-01.2 DEBERÁ calcular "Cost of Delay" = (valor_negocio_feature * días_retraso) acumulado.
- ROI-01.3 DEBERÁ calcular "Savings from Automation" = horas_ahorradas_mes * costo_hora_dev.
- ROI-01.4 DEBERÁ mostrar un KPI "Engineering ROI" = (valor_entregado - costo_equipo) / costo_equipo * 100.
- ROI-01.5 DEBERÁ permitir configurar costo mensual por equipo y costo hora promedio.
- ROI-01.6 DEBERÁ mostrar tendencia trimestral del ROI.

### REQ-ROI-02: Value Stream Map (End-to-End Flow)

**Historia de Usuario:** Como líder de Métodos, quiero ver un mapa visual del flujo de valor completo (idea → producción → valor) para identificar dónde se pierde tiempo sistémicamente.

#### Criterios de Aceptación

- ROI-02.1 DEBERÁ mostrar un diagrama horizontal con etapas: Idea → Backlog → Development → Review → Testing → Deployment → Value.
- ROI-02.2 Cada etapa DEBERÁ mostrar el tiempo promedio que pasan los items allí.
- ROI-02.3 DEBERÁ resaltar visualmente los "bottlenecks" (etapa con mayor tiempo de espera).
- ROI-02.4 DEBERÁ calcular "Flow Efficiency" = (tiempo_activo / tiempo_total) * 100.
- ROI-02.5 DEBERÁ filtrar por equipo.

### REQ-ROI-03: AI Investment Impact

**Historia de Usuario:** Como VP de Tecnología, quiero cuantificar el impacto de las herramientas de IA en la productividad del equipo, para justificar la inversión en licencias de IA.

#### Criterios de Aceptación

- ROI-03.1 DEBERÁ mostrar comparativa: cycle_time_con_ia vs cycle_time_sin_ia (datos reales de FlowItems).
- ROI-03.2 DEBERÁ calcular "AI ROI" = (horas_ahorradas_por_ia * costo_hora) - costo_licencias_ia.
- ROI-03.3 DEBERÁ mostrar % de items asistidos por IA vs total.
- ROI-03.4 DEBERÁ mostrar tendencia mensual del impacto de IA.

### REQ-ROI-04: Health Score Compuesto por Equipo

**Historia de Usuario:** Como gerente de engineering, quiero un score único (0-100) por equipo que resuma DORA + Flow + DevEx + Allocation, para comparar células de un vistazo.

#### Criterios de Aceptación

- ROI-04.1 EL Health Score DEBERÁ calcularse como promedio ponderado de:
  - DORA benchmark (Elite=100, High=75, Medium=50, Low=25) — peso 30%
  - Flow Efficiency — peso 20%
  - DevEx Overall Score (escala 1-5 → 0-100) — peso 20%
  - WIP Health (100 si bajo límite, 0 si sobrecargado) — peso 15%
  - Predictability Score — peso 15%
- ROI-04.2 DEBERÁ mostrar ranking de equipos por Health Score con visualización de barras.
- ROI-04.3 DEBERÁ indicar "Área de mejora prioritaria" por equipo (el componente con peor score).
