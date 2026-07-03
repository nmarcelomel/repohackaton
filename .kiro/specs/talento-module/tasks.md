# Implementation Plan: Talento Module

## Overview

Reemplazar la implementación actual de `TalentoPage` con seis secciones gamificadas: Buscador de Expertos, Radar de Crecimiento, Skill Gap Analysis, Ranking TechMaster, Tech Rewards y Comunidades. Se instalan `recharts`, `canvas-confetti` y `fast-check`, se extienden los tipos y mock data, se implementan utilidades puras y componentes React funcionales con TypeScript + Tailwind CSS + sb-ui.

## Tasks

- [x] 1. Setup: dependencias, tipos y datos mock
  - [x] 1.1 Instalar dependencias necesarias (recharts, canvas-confetti, fast-check, @types/canvas-confetti, vitest, @testing-library/react, @testing-library/jest-dom, jsdom)
    - Ejecutar `npm install recharts canvas-confetti` y `npm install -D fast-check @types/canvas-confetti vitest @testing-library/react @testing-library/jest-dom jsdom`
    - Crear `vitest.config.ts` con environment jsdom y setup file
    - Crear `src/test-setup.ts` con import de `@testing-library/jest-dom`
    - _Requirements: 7.3_

  - [x] 1.2 Extender tipos e interfaces en `src/types/index.ts`
    - Añadir campo opcional `previousLeadTimeForChanges?: number` a la interfaz `Team`
    - _Requirements: 8.2, 8.4, 8.10, 8.11_

  - [x] 1.3 Actualizar `src/data/mock-data.json` con datos extendidos
    - Añadir `previousLeadTimeForChanges` a cada equipo (6.5, 15.0, 9.0)
    - Verificar que existan al menos 3 equipos y 9 usuarios con skills variados
    - _Requirements: 8.10, 7.3_

- [x] 2. Implementar utilidades puras (`talento-utils.ts`)
  - [x] 2.1 Crear `src/pages/talento/talento-utils.ts` con funciones de filtrado de expertos
    - Implementar `filterUsersBySkill(users, searchTerm)` con búsqueda case-insensitive por substring en skill names
    - Implementar `getMatchingSkills(user, searchTerm)` que retorna los skills que coinciden
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 2.2 Implementar funciones de Skill Gap Analysis en `talento-utils.ts`
    - Implementar `analyzeSkills(users)` que genera SkillAnalysis[] con demand, averageLevel y gap por skill único
    - Implementar `getGapColor(averageLevel)` retornando 'green' (>=4), 'yellow' (>=3 y <4), 'red' (<3)
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 2.3 Implementar funciones de Ranking TechMaster en `talento-utils.ts`
    - Implementar `computeMaturityIndex(user)` como promedio de skill levels (0 si no tiene skills)
    - Implementar `computeRanking(users)` con sort descendente por índice, tie-breaking alfabético, y detección de TechMaster badge (skill level 5)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.8, 5.9_

  - [x] 2.4 Implementar funciones de Tech Rewards en `talento-utils.ts`
    - Implementar constantes `DORA_ELITE_THRESHOLDS` y `DORA_HIGH_THRESHOLDS`
    - Implementar `classifyMetricLevel(metric, value)` retornando 'Elite' | 'Alto' | 'Necesita mejora'
    - Implementar `isEliteDORA(metrics)` que verifica las 4 métricas simultáneamente
    - Implementar `computeLeadTimeImprovement(current, previous)` como porcentaje de mejora
    - Implementar `hasTeamBadge(team)` que evalúa criterio elite OR mejora 20%
    - Implementar `computeEliteProgress(metrics)` retornando 0, 25, 50, 75 o 100
    - _Requirements: 8.2, 8.3, 8.6, 8.12_

  - [x] 2.5 Write property tests for expert search filter (Property 1)
    - **Property 1: Expert search filter correctness**
    - Generar arrays de User con skills aleatorios y searchTerms, verificar que solo se retornan usuarios con match case-insensitive y que no se omite ninguno
    - **Validates: Requirements 1.2**

  - [x] 2.6 Write property tests for Skill Gap Analysis (Properties 4, 5, 6, 7)
    - **Property 4: Skill analysis computation correctness**
    - **Property 5: Skill demand ordering**
    - **Property 6: Skill gap ordering**
    - **Property 7: Skill gap color classification**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**

  - [x] 2.7 Write property tests for Ranking TechMaster (Properties 8, 9, 10)
    - **Property 8: Technical Maturity Index calculation**
    - **Property 9: Ranking sort with tie-breaking**
    - **Property 10: TechMaster badge assignment**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.8, 5.9**

  - [x] 2.8 Write property tests for Tech Rewards (Properties 11, 12, 13, 14, 15)
    - **Property 11: Lead Time improvement badge award**
    - **Property 12: Elite DORA badge award**
    - **Property 13: DORA metric level classification**
    - **Property 14: DORA elite progress percentage**
    - **Property 15: Team card ordering**
    - **Validates: Requirements 8.2, 8.3, 8.6, 8.12, 8.13**

- [x] 3. Checkpoint - Verificar utilidades
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implementar componentes de secciones superiores
  - [x] 4.1 Crear `src/pages/talento/components/ExpertCard.tsx`
    - Implementar tarjeta con nombre, rol, equipo (o "Equipo no asignado"), skills como chips (max 10), botón "Solicitar Mentoría"
    - Usar clases sb-ui-card, sb-ui-card--elevated, sb-ui-chip, sb-ui-chip--soft
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.10_

  - [x] 4.2 Crear `src/pages/talento/components/ExpertSearch.tsx`
    - Campo de búsqueda con placeholder "Buscar experto por tecnología..."
    - Filtrado con debounce ≤300ms usando las utils
    - Grilla responsive: 1 col <640px, 2 col 640-1024px, 3 col >=1024px
    - Mensajes de estado: sin resultados muestra "No se encontraron expertos para '{term}'"
    - Integrar confetti con import dinámico al solicitar mentoría
    - Toast de éxito visible 3 segundos al solicitar mentoría
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.4, 2.8, 2.9, 2.10_

  - [x] 4.3 Crear `src/pages/talento/components/GrowthRadar.tsx`
    - Gráfico de radar con Recharts (ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend)
    - Serie "Nivel Actual" con valores del primer usuario, serie "Nivel Deseado" con valor fijo 5
    - Título con nombre del usuario actual
    - Rango de ejes 0-5, etiquetas de skills en ejes angulares
    - Mensaje cuando no hay skills
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 4.4 Write property test for radar data series (Property 3)
    - **Property 3: Radar data series correctness**
    - Generar usuarios con skills aleatorios, verificar que los datos del radar tengan "Nivel Actual" = skill.level y "Nivel Deseado" = 5 por cada skill
    - **Validates: Requirements 3.2, 3.3**

- [x] 5. Implementar componentes de secciones inferiores
  - [x] 5.1 Crear `src/pages/talento/components/SkillGapAnalysis.tsx`
    - Título "Mapa de Brechas" con icono Target de lucide-react
    - Subsección "Skills más demandados" ordenados por demanda desc con barras de progreso proporcionales
    - Subsección "Skills con mayor brecha" ordenados por gap desc con barras + indicador de gap
    - Colores diferenciados por nivel (verde >=4, amarillo >=3, rojo <3)
    - Mensaje si no hay datos
    - Usar sb-ui-card, sb-ui-card--elevated
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 5.2 Crear `src/pages/talento/components/TechMasterRanking.tsx`
    - Título "Ranking TechMaster" con icono Trophy, subtítulo "Líderes de Vanguardia Técnica"
    - Leaderboard con posición, avatar (UserCircle) con color oro/plata/bronce para top 3
    - Nombre, rol, Índice Madurez Técnica "X.X / 5.0"
    - Badge TechMaster (Award icon, chip dorado) si tiene skill level 5
    - Podio visual para posiciones 1-3
    - Manejo de empates (misma posición, orden alfabético)
    - Usar sb-ui-card, sb-ui-card--elevated
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [x] 5.3 Crear `src/pages/talento/components/TeamRewardCard.tsx`
    - Tarjeta de equipo con nombre, métricas DORA con niveles (Elite/Alto/Necesita mejora) coloreados
    - Badge dorada "Equipo TechMaster" con Trophy + Users icons si corresponde
    - Porcentaje de mejora en Lead Time o "Sin datos históricos"
    - Barra de progreso "En camino a TechMaster" si no tiene badge
    - Usar sb-ui-card, sb-ui-card--elevated
    - _Requirements: 8.4, 8.5, 8.6, 8.7, 8.9, 8.11, 8.12_

  - [x] 5.4 Crear `src/pages/talento/components/TechRewards.tsx`
    - Título "Tech Rewards" con icono Award, subtítulo "Reconocimiento y Madurez Técnica por Equipos"
    - Computar badges y progreso para cada equipo usando utils
    - Ordenar: equipos con badge primero, luego por progreso descendente
    - Grilla responsive: 1 col <768px, 3 col >=768px
    - _Requirements: 8.1, 8.2, 8.3, 8.8, 8.10, 8.13_

  - [x] 5.5 Crear `src/pages/talento/components/Communities.tsx`
    - Título "Comunidades TechMaster & TechLovers" con icono Users
    - 3 tarjetas hardcoded: TechLovers AI (128), TechMaster Frontend (95), TechLovers Cloud (64)
    - Botón "Unirme" → "Miembro ✓" (deshabilitado) al hacer clic
    - Estado local de membresías (no persiste entre navegaciones)
    - Diferenciación visual: dorado para TechMaster, azul/púrpura para TechLovers
    - Responsive: columnas >=768px, apiladas <768px
    - Usar sb-ui-card, sb-ui-card--elevated
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 6. Checkpoint - Verificar componentes individuales
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integrar y reemplazar TalentoPage
  - [x] 7.1 Reescribir `src/pages/talento/TalentoPage.tsx` como contenedor de las 6 secciones
    - Importar ExpertSearch, GrowthRadar, SkillGapAnalysis, TechMasterRanking, TechRewards, Communities
    - Layout vertical con spacing entre secciones (space-y-6 o similar)
    - Cada sección envuelta en contenedor card con icono y título
    - Paleta gamificada: dorado para logros, gradientes para podio, colores vibrantes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 7.2 Write unit tests for component rendering and interactions
    - Test ExpertSearch: búsqueda vacía muestra todos, búsqueda específica filtra, sin resultados muestra mensaje
    - Test ExpertCard: render con/sin equipo, max 10 skills, botón mentoría cambia estado
    - Test GrowthRadar: render con datos, mensaje sin skills
    - Test Communities: render 3 cards, join/unjoin states
    - Test TechRewards: render con badge, sin badge, "Sin datos históricos"
    - _Requirements: 1.1-1.6, 2.1-2.10, 3.1-3.7, 6.1-6.7, 8.1-8.13_

- [x] 8. Final checkpoint - Verificar integración completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases using @testing-library/react
- All components use TypeScript with React functional components
- canvas-confetti should be imported dynamically to optimize bundle size
- The project uses Vitest as test runner (compatible with Vite)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["2.5", "2.6", "2.7", "2.8"] },
    { "id": 4, "tasks": ["4.1", "4.3", "5.1", "5.2", "5.5"] },
    { "id": 5, "tasks": ["4.2", "4.4", "5.3"] },
    { "id": 6, "tasks": ["5.4"] },
    { "id": 7, "tasks": ["7.1"] },
    { "id": 8, "tasks": ["7.2"] }
  ]
}
```
