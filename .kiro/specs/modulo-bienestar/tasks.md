# Plan de Implementación: Módulo de Bienestar — Testing y Refactoring

## Resumen

La implementación funcional ya existe en `BienestarPage.tsx`. Este plan se enfoca en extraer funciones puras a un módulo testeable, agregar property-based tests (fast-check) para las 6 propiedades de correctitud del diseño, y escribir tests unitarios/integración con React Testing Library.

## Tareas

- [ ] 1. Extraer funciones utilitarias a módulo testeable
  - [x] 1.1 Crear archivo `src/pages/bienestar/bienestar.utils.ts` con las funciones puras
    - Extraer: `MOOD_SCORE`, `getAverageMood`, `calculateHealthScore`, `isAtBurnoutRisk`, `getScoreColor`, `getScoreBg`, `getScoreLabel`, `getCategoryEmoji`, `getUserName`
    - Exportar cada función y constante con `export`
    - Mantener las firmas de tipo existentes usando los tipos de `src/types/index.ts`
    - _Requisitos: 8.1, 8.3_

  - [x] 1.2 Actualizar `BienestarPage.tsx` para importar desde `bienestar.utils.ts`
    - Reemplazar las definiciones locales por imports del nuevo módulo
    - Verificar que la página sigue funcionando sin errores de tipo
    - _Requisitos: 8.1_

- [ ] 2. Configurar entorno de testing
  - [x] 2.1 Instalar dependencias de testing
    - Agregar `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `fast-check` al `devDependencies` con versiones exactas
    - Configurar Vitest en `vite.config.ts` con environment `jsdom`
    - Agregar script `"test": "vitest --run"` en `package.json`
    - _Requisitos: 5.1, 2.1_

- [ ] 3. Checkpoint - Verificar configuración
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Property-based tests para funciones de lógica de negocio
  - [x] 4.1 Crear archivo de tests `src/pages/bienestar/__tests__/bienestar.utils.pbt.test.ts`
    - Configurar imports de `vitest`, `fast-check` y funciones de `bienestar.utils.ts`
    - Definir generadores arbitrarios para `Team` con rangos válidos
    - _Requisitos: 2.1, 5.1_

  - [x] 4.2 Escribir property test — Propiedad 1: Invariante de detección de burnout
    - **Propiedad 1: Invariante de detección de burnout**
    - **Valida: Requisito 2.1**
    - Generador: `Team` con `wipCurrent` [0,20], `wipLimit` [1,10], `memberMood` con moods aleatorios
    - Verificar: `isAtBurnoutRisk(team) === true` ↔ `wipCurrent > wipLimit AND getAverageMood(team) < 3`
    - Mínimo 100 iteraciones

  - [x] 4.3 Escribir property test — Propiedad 2: Health score acotado
    - **Propiedad 2: Health score acotado**
    - **Valida: Requisito 5.1**
    - Generador: `Team` con DoraMetrics aleatorias (deployFreq [0,30], changeFailRate [0,100], wipCurrent [0,20], wipLimit [1,10])
    - Verificar: `0 <= calculateHealthScore(team) <= 100` para todo input válido
    - Mínimo 100 iteraciones

  - [x] 4.4 Escribir property test — Propiedad 3: Clasificación consistente del score
    - **Propiedad 3: Clasificación consistente del score**
    - **Valida: Requisitos 5.2, 5.3**
    - Generador: enteros [0, 100]
    - Verificar coherencia entre `getScoreLabel`, `getScoreColor` y `getScoreBg` según umbrales (≥75 → green/Saludable, ≥50 → yellow/Atención, <50 → red/Crítico)
    - Mínimo 100 iteraciones

  - [x] 4.5 Escribir property test — Propiedad 4: Ánimo promedio metamórfica
    - **Propiedad 4: Ánimo promedio metamórfica**
    - **Valida: Requisito 5.1**
    - Generador: `Team` con `memberMood` no vacío cuyo `getAverageMood > 1`
    - Verificar: agregar miembro con mood="critico" reduce estrictamente el promedio
    - Mínimo 100 iteraciones

  - [x] 4.6 Escribir property test — Propiedad 5: Color de barras por umbral de ánimo
    - **Propiedad 5: Color de barras por umbral de ánimo**
    - **Valida: Requisito 4.2**
    - Generador: floats [0, 5]
    - Verificar: avgMood ≥ 4 → "bg-green-400", 3 ≤ avgMood < 4 → "bg-yellow-400", avgMood < 3 → "bg-red-400"
    - Mínimo 100 iteraciones

  - [x] 4.7 Escribir property test — Propiedad 6: Dirección de tendencia
    - **Propiedad 6: Dirección de tendencia**
    - **Valida: Requisitos 4.3, 4.4**
    - Generador: pares de floats [0, 5] para `latest` y `previous`
    - Verificar: `(latest - previous) >= 0` ↔ flecha ascendente (verde), `< 0` ↔ flecha descendente (roja)
    - Mínimo 100 iteraciones

- [ ] 5. Checkpoint - Verificar property tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Tests unitarios y de integración de componentes
  - [x] 6.1 Crear tests unitarios para funciones utilitarias
    - Crear `src/pages/bienestar/__tests__/bienestar.utils.test.ts`
    - Tests de ejemplo para `getAverageMood` (equipo vacío retorna 3, valores conocidos)
    - Tests de ejemplo para `calculateHealthScore` con datos mock conocidos
    - Tests de ejemplo para `getCategoryEmoji` (mapeo exhaustivo de 4 categorías)
    - Tests de ejemplo para `getUserName` (ID válido e inválido)
    - _Requisitos: 2.1, 3.6, 5.1_

  - [x] 6.2 Crear tests de renderizado de componentes
    - Crear `src/pages/bienestar/__tests__/BienestarPage.test.tsx`
    - Verificar que `BienestarPage` renderiza sin errores
    - Verificar presencia de secciones principales (Niko-Niko, Sostenibilidad, Burnout, Kudos)
    - Verificar `role="alert"` en alertas de burnout
    - _Requisitos: 1.1, 2.5, 7.1_

  - [x] 6.3 Crear tests de interacción del Niko-Niko
    - Verificar que al hacer clic en una opción de ánimo se muestra confirmación
    - Verificar que se puede cambiar la selección sin recargar
    - _Requisitos: 1.2, 1.3, 1.5_

- [ ] 7. Checkpoint final - Verificar que todos los tests pasan
  - Ensure all tests pass, ask the user if questions arise.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los property tests validan las propiedades de correctitud universales del diseño
- Los tests unitarios validan ejemplos específicos y edge cases
- fast-check se usa como librería de PBT aprobada para el ecosistema JS/TS
