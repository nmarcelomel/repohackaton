# Implementation Plan: Initiative Status Insights

## Overview

Implementación de tooltips/popovers interactivos sobre los chips de estado de iniciativas en la tabla del módulo Negocio. Se divide en: un motor de insights con funciones puras (InsightsEngine), un componente de popover con posicionamiento y accesibilidad (InsightPopover), un wrapper que integra chip + popover (StatusChipWithInsight), property-based tests con fast-check, y la integración final en NegocioPage.

## Tasks

- [x] 1. Crear tipos e interfaces del InsightsEngine
  - [x] 1.1 Definir los tipos InsightType, InsightMetric, InsightResult y el mapeo STATUS_TO_INSIGHT_TYPE en `src/pages/negocio/insights-engine.ts`
    - Crear el archivo `src/pages/negocio/insights-engine.ts`
    - Exportar `InsightType = "improvement" | "risk_prediction" | "success_summary"`
    - Exportar `InsightMetric` con campos `label: string` y `value: string`
    - Exportar `InsightResult` con campos `type`, `title`, `description`, `metrics`, `recommendation`
    - Exportar constante `STATUS_TO_INSIGHT_TYPE` mapeando cada status de Initiative a su InsightType
    - _Requirements: 5.3, 5.4, 5.6_

- [x] 2. Implementar el InsightsEngine (funciones puras)
  - [x] 2.1 Implementar `calculateFulfillmentRatio` y `generateInsight` como función principal de routing
    - `calculateFulfillmentRatio(projectedValue, actualValue)` retorna `(actualValue / projectedValue) * 100` o 0 si projectedValue es 0
    - Tratar valores negativos como 0 (defensive coding)
    - `generateInsight(initiative)` despacha a la función interna correcta según `initiative.status`
    - _Requirements: 5.1, 5.2, 5.4_

  - [x] 2.2 Implementar `generateInProgressInsight` con lógica de umbrales
    - Ratio >= 90%: mensaje "camino óptimo", recomendar mantener ritmo
    - Ratio 70%-89%: mensaje "brecha moderada", recomendar revisar impedimentos
    - Ratio < 70%: mensaje "brecha significativa", recomendar revisión de alcance
    - projectedValue === 0: mensaje de ratio no calculable
    - Incluir métrica "Cumplimiento actual:" formateada con un decimal y "%"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 2.3 Implementar `generateAtRiskInsight` con lógica de umbrales de riesgo
    - Ratio < 50%: "Desviación crítica de valor", recomendar revisión ejecutiva
    - Ratio 50%-69%: "Entrega de valor por debajo del objetivo", recomendar seguimiento
    - projectedValue === 0: "Datos insuficientes para predicción"
    - Incluir métrica de brecha de valor formateada como "$XM de brecha"
    - Sección "Solución recomendada:" claramente separada en recommendation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 2.4 Implementar `generateCompletedInsight` con lógica de éxito
    - actualValue >= projectedValue: mensaje de expectativas superadas/alcanzadas
    - actualValue < projectedValue: porcentaje alcanzado + sugerir lecciones aprendidas
    - Incluir métrica "Valor entregado:" formateada como "$XM"
    - Incluir Fulfillment_Ratio formateado con un decimal
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 2.5 Write property test: Status-to-insight-type consistency
    - **Property 1: Status-to-insight-type consistency**
    - Para cualquier Initiative válida, `generateInsight` produce un InsightResult cuyo `type` equals `STATUS_TO_INSIGHT_TYPE[initiative.status]` y cuyo `title` coincide con el esperado
    - Crear archivo `src/pages/negocio/__tests__/insights-engine.property.test.ts`
    - Usar generador custom de Initiative con fast-check
    - **Validates: Requirements 2.1, 3.1, 4.1, 5.4, 5.5**

  - [x] 2.6 Write property test: Fulfillment ratio formula correctness
    - **Property 2: Fulfillment ratio formula correctness**
    - Para cualquier par (projectedValue, actualValue) no negativos, verificar fórmula y caso projectedValue === 0
    - **Validates: Requirements 5.2**

  - [x] 2.7 Write property test: Structural completeness of InsightResult
    - **Property 3: Structural completeness of InsightResult**
    - Para cualquier Initiative válida, verificar que todos los campos de InsightResult están poblados y no vacíos
    - **Validates: Requirements 5.3**

  - [x] 2.8 Write property test: In-progress threshold-based suggestions
    - **Property 4: In-progress threshold-based suggestions**
    - Para Initiative con status "en_progreso" y projectedValue > 0, verificar correspondencia entre ratio y mensaje
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [x] 2.9 Write property test: At-risk threshold-based diagnosis
    - **Property 5: At-risk threshold-based diagnosis**
    - Para Initiative con status "en_riesgo" y projectedValue > 0, verificar diagnóstico según umbral y formato de brecha
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

  - [x] 2.10 Write property test: Completed success/shortfall message
    - **Property 6: Completed success/shortfall message**
    - Para Initiative con status "completada" y projectedValue > 0, verificar mensaje según comparación actualValue vs projectedValue
    - **Validates: Requirements 4.3, 4.4**

  - [x] 2.11 Write property test: Fulfillment ratio formatting in metrics
    - **Property 7: Fulfillment ratio formatting in metrics**
    - Para cualquier Initiative con projectedValue > 0, verificar que metrics contiene entry con formato "X.Y%"
    - **Validates: Requirements 2.5, 4.2**

- [x] 3. Checkpoint - Verificar InsightsEngine
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implementar componente InsightPopover
  - [x] 4.1 Crear el hook `usePopoverPosition` y el componente `InsightPopover` en `src/pages/negocio/InsightPopover.tsx`
    - Implementar hook que calcula posición top/bottom usando `getBoundingClientRect()` y viewport
    - Renderizar contenedor con fondo blanco, border-radius 8px, sombra sb-ui-card--elevated
    - Ancho máximo 320px, scroll vertical si contenido excede 200px de altura
    - Incluir flecha/triángulo apuntando al chip
    - Aplicar colores de título según tipo: primary para improvement, error para risk_prediction, success para success_summary
    - Texto con font-size mínimo 12px, line-height 1.5
    - Padding 12-16px con gap de 8px entre secciones (Tailwind utilities)
    - Atributo `role="tooltip"` en el popover
    - _Requirements: 1.4, 1.5, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.2 Write unit tests for InsightPopover
    - Verificar que se renderizan título, descripción, métricas y recomendación
    - Verificar atributo role="tooltip"
    - Verificar clases CSS según tipo de insight
    - Verificar maxWidth 320px y overflow-y en contenido
    - _Requirements: 1.5, 1.8, 6.1, 6.2, 6.3_

- [x] 5. Implementar componente StatusChipWithInsight
  - [x] 5.1 Crear `src/pages/negocio/StatusChipWithInsight.tsx` con lógica de hover, focus y keyboard
    - Renderizar chip sb-ui existente con wrapper interactivo
    - Manejar mouseEnter/mouseLeave con delays (200ms show, 300ms hide)
    - Manejar focus/blur para accesibilidad por teclado
    - Manejar tecla Escape para cerrar el popover
    - Mantener popover visible mientras cursor está sobre él (cancelar timer de cierre)
    - Agregar `aria-describedby` al chip referenciando el popover
    - Try/catch alrededor de `generateInsight` — no mostrar popover si hay error, loguear console.warn
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8_

  - [x] 5.2 Write unit tests for StatusChipWithInsight
    - Simular hover → verificar que popover aparece
    - Simular mouseLeave → verificar cierre
    - Simular focus → verificar que popover aparece
    - Simular Escape → verificar cierre inmediato
    - Verificar aria-describedby en el chip
    - Verificar que error en generateInsight no crashea el componente
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8_

- [x] 6. Integrar StatusChipWithInsight en NegocioPage
  - [x] 6.1 Reemplazar el chip estático en `src/pages/negocio/NegocioPage.tsx` con `StatusChipWithInsight`
    - Importar `StatusChipWithInsight` en NegocioPage
    - Reemplazar el `<span className="sb-ui-chip...">` en la celda de Estado por `<StatusChipWithInsight initiative={init} chipClass={config.chipClass} label={config.label} />`
    - Verificar que la tabla mantiene su layout y funcionalidad existente
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 7. Checkpoint final - Validación completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design's 7 properties
- Unit tests validate specific examples, edge cases, and component behavior
- El InsightsEngine es un módulo de funciones puras sin dependencias de React, facilitando el testing con fast-check
- Los componentes React (InsightPopover, StatusChipWithInsight) se testean con @testing-library/react

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["2.5", "2.6", "2.7", "2.8", "2.9", "2.10", "2.11"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["4.2", "5.1"] },
    { "id": 6, "tasks": ["5.2", "6.1"] }
  ]
}
```
