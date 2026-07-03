# Implementation Plan: Negocio Value Realization

## Overview

Ampliar el módulo Negocio con tres componentes nuevos (ValueChart, AlignmentChart, IntakeForm) usando React 18.3, TypeScript, Recharts 2.12.7 y el sistema de diseño sb-ui. Se extraen funciones puras de utilidad para lógica de cálculo y validación, se integran los componentes en NegocioPage.tsx, y se validan las correctness properties con fast-check.

## Tasks

- [x] 1. Configurar dependencias y estructura base
  - [x] 1.1 Instalar dependencias del proyecto
    - Agregar `recharts` 2.12.7 como dependencia exacta en `package.json`
    - Agregar `fast-check` 3.19.0, `vitest` 1.6.0, `@testing-library/react` 16.0.0, `@testing-library/jest-dom` 6.4.6, y `jsdom` 24.1.0 como devDependencies exactas en `package.json`
    - Crear archivo `vitest.config.ts` en la raíz con configuración para jsdom environment
    - Ejecutar instalación de dependencias
    - _Requirements: 4.6_

  - [x] 1.2 Crear módulo de utilidades con funciones puras
    - Crear archivo `src/pages/negocio/negocio-utils.ts`
    - Implementar `truncateName(name: string): string` — trunca a 20 chars con "…" si excede
    - Implementar `getFulfillmentColor(projectedValue: number, actualValue: number): string` — retorna hex color según umbrales
    - Implementar `calculateAlignmentIndex(initiatives: Initiative[]): number` — calcula porcentaje de alineación estratégica
    - Implementar `validateTextField(value: string, maxLen: number): string | null` — retorna mensaje de error o null
    - Implementar `validateNumericField(value: string): string | null` — valida rango 0.01–999999.99 con max 2 decimales
    - Implementar `formatCurrency(value: number): string` — formatea como `$X,XXXM`
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.10, 2.4, 3.2, 3.3, 3.4, 3.5, 3.6, 5.1_

- [x] 2. Implementar componente ValueChart
  - [x] 2.1 Crear componente ValueChart con gráfico de barras agrupadas
    - Crear archivo `src/pages/negocio/ValueChart.tsx`
    - Importar `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `Legend`, `Cell`, `ResponsiveContainer` de recharts
    - Renderizar gráfico de barras agrupadas con eje X (nombres truncados) y eje Y (auto-escalado)
    - Implementar dos barras por iniciativa: "Promesa" (color neutral gris/azul) y "Realidad" (color dinámico según fulfillment ratio)
    - Aplicar colores condicionales usando `Cell` de Recharts y `getFulfillmentColor`
    - Implementar tooltip personalizado con nombre completo, valor formateado (`formatCurrency`) y fulfillment ratio con 1 decimal
    - Formatear eje Y con prefijo "$", separadores de miles y sufijo "M"
    - Asegurar tamaño de fuente mínimo de 12px en etiquetas
    - Renderizar leyenda visible identificando cada tipo de barra
    - Manejar estado vacío: mostrar mensaje "No hay datos de iniciativas disponibles"
    - Manejar projectedValue === 0: tratar ratio como 0%, barra roja
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 5.1, 5.5_

  - [x] 2.2 Escribir property test para truncación de nombres
    - **Property 1: Name Truncation Preserves Short Names and Clips Long Ones**
    - Usar fast-check para generar strings arbitrarios
    - Verificar: si length ≤ 20 → output === input; si length > 20 → output tiene 20 chars, termina en "…", primeros 17 chars coinciden
    - **Validates: Requirements 1.1**

  - [x] 2.3 Escribir property test para color de fulfillment
    - **Property 2: Fulfillment Color Matches Threshold Rules**
    - Usar fast-check para generar pares (projectedValue, actualValue) no negativos
    - Verificar: projectedValue===0 → rojo; ratio≥90 → verde; 70≤ratio<90 → ámbar; ratio<70 → rojo
    - **Validates: Requirements 1.4, 1.5, 1.6, 1.10**

  - [x] 2.4 Escribir property test para formateo de moneda
    - **Property 6: Monetary Value Formatting**
    - Usar fast-check para generar números no negativos enteros
    - Verificar: output coincide con patrón `$X,XXXM` con separadores de miles correctos
    - **Validates: Requirements 1.8, 5.1**

- [x] 3. Implementar componente AlignmentChart
  - [x] 3.1 Crear componente AlignmentChart con gráfico de dona
    - Crear archivo `src/pages/negocio/AlignmentChart.tsx`
    - Importar `PieChart`, `Pie`, `Cell`, `Tooltip`, `ResponsiveContainer` de recharts
    - Calcular Strategic Alignment Index usando `calculateAlignmentIndex`
    - Renderizar gráfico de dona con dos segmentos: "Esfuerzo alineado a OKRs" y "Esfuerzo no alineado"
    - Usar color primario sb-ui (`var(--sb-ui-color-primary-base)`) para segmento alineado y gris para no alineado
    - Renderizar etiqueta central con porcentaje entero y símbolo "%"
    - Implementar tooltip con porcentaje a un decimal
    - Asegurar contraste mínimo 3:1 entre segmentos
    - Asegurar tamaño de fuente mínimo 12px
    - Manejar estado vacío: mostrar dona con "0%"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 5.2, 5.5_

  - [x] 3.2 Escribir property test para cálculo de alineación estratégica
    - **Property 3: Strategic Alignment Index Calculation**
    - Usar fast-check para generar arrays de iniciativas con projectedValue no negativo y status válido
    - Verificar: index === (sum projectedValue where status in ["completada","en_progreso"]) / (sum all projectedValue) * 100; si total===0 → 0
    - **Validates: Requirements 2.2, 2.4, 2.6**

- [x] 4. Checkpoint - Verificar gráficos
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implementar componente IntakeForm
  - [x] 5.1 Crear componente IntakeForm con validación inline
    - Crear archivo `src/pages/negocio/IntakeForm.tsx`
    - Implementar formulario controlado con `useState` para campos (name, kpi, expectedValue) y errores
    - Renderizar campo "Nombre de la Iniciativa" con clases sb-ui-input, max 100 chars
    - Renderizar campo "KPI Asociado" con clases sb-ui-input, max 150 chars
    - Renderizar campo "Valor Esperado (ROI)" con clases sb-ui-input, tipo numérico
    - Implementar validación on-submit usando `validateTextField` y `validateNumericField`
    - Mostrar mensajes de error inline debajo de cada campo inválido
    - Al éxito: mostrar `sb-ui-alert` de confirmación y resetear todos los campos
    - Usar clases sb-ui para botón de envío (`sb-ui-btn sb-ui-btn--primary`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 5.2 Escribir property test para validación de campos de texto
    - **Property 4: Text Field Validation Accepts Non-Empty Trimmed Strings Within Max Length**
    - Usar fast-check para generar strings arbitrarios y maxLen positivos
    - Verificar: válido ↔ trim().length ≥ 1 AND trim().length ≤ maxLen; solo whitespace → inválido
    - **Validates: Requirements 3.2, 3.3, 3.5**

  - [x] 5.3 Escribir property test para validación numérica
    - **Property 5: Numeric Value Validation Accepts Only Positive Numbers in Range With Max 2 Decimals**
    - Usar fast-check para generar valores diversos (strings, negativos, cero, fuera de rango, decimales excesivos)
    - Verificar: válido ↔ numérico AND ≥ 0.01 AND ≤ 999999.99 AND max 2 decimales
    - **Validates: Requirements 3.4, 3.6**

  - [x] 5.4 Escribir property test para reset de formulario tras envío válido
    - **Property 7: Valid Form Submission Resets All Fields**
    - Usar fast-check para generar combinaciones de inputs válidos
    - Renderizar IntakeForm con @testing-library/react, simular envío, verificar que todos los campos queden vacíos
    - **Validates: Requirements 3.7**

- [x] 6. Integrar componentes en NegocioPage
  - [x] 6.1 Modificar NegocioPage.tsx para renderizar los nuevos componentes
    - Importar `ValueChart`, `AlignmentChart`, `IntakeForm` desde la misma carpeta
    - Agregar sección de gráficos debajo de la tabla existente con grid responsivo (`grid grid-cols-1 md:grid-cols-2 gap-6`)
    - Envolver ValueChart en `sb-ui-card sb-ui-card--elevated` con heading "Valor Prometido vs. Realizado" (clase `sb-ui-heading-h6`)
    - Envolver AlignmentChart en `sb-ui-card sb-ui-card--elevated` con heading "Alineación Estratégica" (clase `sb-ui-heading-h6`)
    - Agregar sección IntakeForm en ancho completo debajo de los gráficos, envuelta en `sb-ui-card sb-ui-card--elevated` con heading "Registrar Nueva Iniciativa"
    - Mantener espaciado vertical consistente (`space-y-6`) con el layout existente
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.3, 5.4_

- [x] 7. Final checkpoint - Validación completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All dependencies use exact pinned versions (no `^` or `~`) per project policy
- Utility functions are extracted as pure functions for independent testability
- recharts 2.12.7 is the selected charting library (React-first, typed, lightweight)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "3.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "6.1"] }
  ]
}
```
