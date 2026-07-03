# Implementation Plan: Observability Flujo Module

## Overview

Transformar la pagina /flujo de una vista estatica de tarjetas por equipo a un dashboard ejecutivo interactivo centrado en la celula seleccionada. Se implementan: selector de celula, tarjetas DORA (Deployment Frequency y Cycle Time), barra de alerta WIP con estado compartido, tooltips educativos con texto empatico, y grafico de impacto IA con CSS/Tailwind puro (sin librerias de charting externas) y React Context API para estado compartido.

## Tasks

- [x] 1. Definir interfaces TypeScript y extender datos mock
 - [x] 1.1 Crear interfaces de observabilidad en src/types/index.ts
 - Agregar interfaz ObservabilityMetrics con campos: deploymentFrequency, cycleTime, wipActual, wipLimit, aiCycleTime, traditionalCycleTime (todos number)
 - Agregar interfaz TeamOverloadState con campos: teamId (string), isOverloaded (boolean)
 - Agregar interfaz TeamStateContextType con el contrato del contexto compartido
 - _Requirements: 5.2, 2.9_

 - [x] 1.2 Extender src/data/mock-data.json con datos de observabilidad
 - Agregar campo observabilityMetrics a cada equipo con valores simulados de cycleTime y traditionalCycleTime
 - aiCycleTime debe ser 30 porciento menor que traditionalCycleTime
 - Validar que al menos un equipo tenga wipCurrent mayor que wipLimit para probar Overload_State
 - _Requirements: 5.1, 7.3_

 - [x] 1.3 Extender src/data/data-service.ts con funcion getObservabilityMetrics
 - Crear funcion getObservabilityMetrics(teamId: string) que retorna ObservabilityMetrics o undefined
 - Derivar deploymentFrequency del campo existente doraMetrics.deploymentFrequency
 - Crear cycleTime a partir de leadTimeForChanges
 - Calcular aiCycleTime como 70 porciento de traditionalCycleTime (reduccion 30 porciento con IA)
 - _Requirements: 5.1, 5.4, 7.3_

- [x] 2. Implementar TeamStateProvider (Context API)
 - [x] 2.1 Crear src/pages/flujo/context/TeamStateContext.tsx
 - Implementar React Context con TeamStateContextType
 - Exponer TeamStateProvider como wrapper con estado isOverloaded por equipo
 - Exponer hook useTeamState() para consumir el contexto
 - Exponer funcion updateTeamOverloadState(teamId, isOverloaded) en el contexto
 - _Requirements: 2.9_

 - [ ] 2.2 Escribir tests unitarios para TeamStateContext
 - Verificar que updateTeamOverloadState cambia correctamente el estado
 - Verificar que useTeamState retorna el estado actual
 - Verificar que multiples equipos mantienen estados independientes
 - _Requirements: 2.9_

- [x] 3. Checkpoint - Verificar tipos y contexto
 - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implementar componente EducationalTooltip
 - [x] 4.1 Crear src/pages/flujo/components/EducationalTooltip.tsx
 - Componente reutilizable con props: title, description, advice (strings)
 - Icono de informacion con clases Font Awesome (fa-solid fa-circle-info)
 - Popover al hover (onMouseEnter/onMouseLeave) y al focus (onFocus/onBlur)
 - Ancho maximo del popover: 280px (max-w-[280px])
 - Atributos ARIA: role=tooltip, aria-describedby, tabIndex=0 para teclado
 - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

 - [ ] 4.2 Escribir tests unitarios para EducationalTooltip
 - Verificar que el icono se renderiza
 - Verificar que el popover aparece al hover y desaparece al salir
 - Verificar que el popover aparece al focus de teclado
 - Verificar ancho maximo aplicado
 - _Requirements: 3.1, 3.4, 3.5, 3.6_

- [ ] 5. Implementar componente MetricCard
 - [x] 5.1 Crear src/pages/flujo/components/MetricCard.tsx
 - Props: title, value, unit, tooltipDescription, tooltipAdvice, isLoading
 - Tarjeta individual con clases SB_UI (sb-ui-card sb-ui-card--elevated)
 - Titulo con EducationalTooltip integrado
 - Valor numerico grande con unidad de medida
 - Indicador de carga (skeleton) cuando isLoading es true
 - _Requirements: 1.3, 1.5, 1.6, 1.7, 3.1_

 - [ ] 5.2 Escribir tests unitarios para MetricCard
 - Verificar renderizado de titulo, valor y unidad
 - Verificar que muestra skeleton al estar en loading
 - Verificar integracion con EducationalTooltip
 - _Requirements: 1.3, 1.7_

- [ ] 6. Implementar componente DoraMetricsCards
 - [x] 6.1 Crear src/pages/flujo/components/DoraMetricsCards.tsx
 - Componente contenedor con props: metrics (ObservabilityMetrics o undefined), isLoading
 - Renderizar dos MetricCard: Deployment Frequency (unidad: despliegues/sem) y Cycle Time (unidad: horas)
 - Layout responsivo: fila horizontal en desktop (lg:flex-row), apilado en mobile (flex-col)
 - Textos de tooltip con descripcion y consejo metodologico para cada metrica
 - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 6.3_

 - [ ] 6.2 Escribir tests unitarios para DoraMetricsCards
 - Verificar que renderiza ambas tarjetas con valores correctos
 - Verificar layout responsivo con clases Tailwind
 - Verificar estado de carga delegado a MetricCard
 - _Requirements: 1.1, 1.2, 1.7, 6.3_

- [ ] 7. Implementar componente WipAlertBar
 - [x] 7.1 Crear src/pages/flujo/components/WipAlertBar.tsx
 - Barra de progreso horizontal con props: wipActual, wipLimit (numbers)
 - Valores numericos X / Y adyacentes a la barra
 - Porcentaje de llenado: (wipActual / wipLimit) * 100, clamped a 100 porciento visual
 - Color verde/neutro cuando wipActual es menor o igual a wipLimit, rojo cuando es mayor
 - Etiqueta Sobrecarga de trabajo cuando en Overload_State
 - Caso wipLimit igual a 0 o undefined: mostrar Sin limite WIP definido y barra vacia
 - Integrar EducationalTooltip con texto empatico del Req 3.7
 - Llamar a updateTeamOverloadState del contexto cuando detecte Overload_State
 - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 2.9, 3.7_

 - [ ] 7.2 Escribir tests unitarios para WipAlertBar
 - Verificar renderizado de porcentaje correcto
 - Verificar color verde cuando dentro del limite
 - Verificar color rojo y label Sobrecarga de trabajo en Overload_State
 - Verificar manejo de wipLimit igual a 0
 - Verificar actualizacion del contexto compartido en sobrecarga
 - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.8, 2.9_

- [x] 8. Checkpoint - Verificar componentes individuales
 - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implementar componente AIImpactChart
 - [x] 9.1 Crear src/pages/flujo/components/AIImpactChart.tsx
 - Grafico de barras comparativas con CSS/Tailwind puro (sin librerias de charting)
 - Props: aiCycleTime, traditionalCycleTime (numbers)
 - Dos barras horizontales: Cycle Time Promedio con IA (verde corporativo bg-bolivar-green) y Cycle Time Promedio Tradicional (gris neutro)
 - Ancho relativo de cada barra basado en el valor maximo
 - Valores numericos al lado de cada barra con unidad horas
 - Leyenda descriptiva y titulo del componente
 - _Requirements: 7.1, 7.2, 7.3, 7.4_

 - [ ] 9.2 Escribir tests unitarios para AIImpactChart
 - Verificar renderizado de ambas barras
 - Verificar que la barra IA tiene color corporativo verde
 - Verificar que los valores numericos se muestran correctamente
 - _Requirements: 7.2, 7.4_

- [ ] 10. Implementar componente CellSelector
 - [x] 10.1 Crear src/pages/flujo/components/CellSelector.tsx
 - Props: teams (Team[]), selectedTeamId (string), onTeamChange (callback)
 - Lista/dropdown de celulas disponibles con distincion visual de la seleccionada
 - Clases SB_UI para consistencia visual
 - Accesibilidad: aria-label, role adecuado
 - _Requirements: 4.1, 4.2, 4.3, 4.4_

 - [ ] 10.2 Escribir tests unitarios para CellSelector
 - Verificar renderizado de lista de equipos
 - Verificar callback onTeamChange al seleccionar
 - Verificar distincion visual del equipo seleccionado
 - _Requirements: 4.1, 4.2, 4.4_

- [ ] 11. Integrar componentes en FlujoPage refactorizada
 - [x] 11.1 Refactorizar src/pages/flujo/FlujoPage.tsx
 - Reemplazar contenido actual con nueva estructura de componentes
 - Wrappear con TeamStateProvider
 - Estado local: selectedTeamId (default: primer equipo)
 - Datos via getTeams() y getObservabilityMetrics(selectedTeamId) del Data_Service
 - Manejar estado de carga y error (mensaje amigable si datos vacios)
 - Componer: CellSelector, DoraMetricsCards, AIImpactChart, WipAlertBar
 - Layout responsivo con Tailwind: space-y-6, grid/flex segun viewport
 - Actualizar componentes al cambiar celula seleccionada
 - _Requirements: 1.1, 1.2, 1.4, 2.7, 4.2, 4.3, 5.1, 5.3, 6.1, 6.2, 6.4, 7.1_

 - [ ] 11.2 Escribir tests unitarios para FlujoPage
 - Verificar que al cargar muestra datos de la primera celula
 - Verificar que cambiar celula actualiza todas las metricas
 - Verificar que muestra estado vacio cuando no hay datos
 - Verificar layout responsivo (clases Tailwind correctas)
 - _Requirements: 1.1, 1.4, 4.3, 5.3_

- [x] 12. Final checkpoint - Validacion completa del modulo
 - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with * are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- No external charting libraries are used: AI Impact Chart uses pure CSS/Tailwind bars
- The TeamStateProvider exposes isOverloaded for consumption by the Bienestar module
- All data flows through the Data_Service layer (never direct HTTP calls or JSON imports in components)
- The design uses TypeScript explicitly: all components must have strict typing
- Tests should use Vitest + React Testing Library following Given/When/Then pattern

## Task Dependency Graph

```json
{
 "waves": [
 { "id": 0, "tasks": ["1.1"] },
 { "id": 1, "tasks": ["1.2", "1.3"] },
 { "id": 2, "tasks": ["2.1", "4.1"] },
 { "id": 3, "tasks": ["2.2", "4.2", "5.1"] },
 { "id": 4, "tasks": ["5.2", "6.1", "7.1", "10.1"] },
 { "id": 5, "tasks": ["6.2", "7.2", "9.1", "10.2"] },
 { "id": 6, "tasks": ["9.2", "11.1"] },
 { "id": 7, "tasks": ["11.2"] }
 ]
}
```
