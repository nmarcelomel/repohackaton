# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Versionamiento Semántico](https://semver.org/lang/es/).

## [No publicado]

### Agregado
- Se configuró entorno de testing con Vitest 3.1.4, React Testing Library 16.3.0, jest-dom 6.6.3, jsdom 25.0.1 y fast-check 4.1.1
- Se implementó módulo de Bienestar (/bienestar) con tres componentes: Termómetro Niko-Niko, Radar de Burnout y Muro de Kudos
- Se extrajo módulo `bienestar.utils.ts` con funciones puras de lógica de negocio para testing independiente
- Se creó componente NikoNikoThermometer para selección de ánimo del usuario con emojis interactivos
- Se creó componente BurnoutRadar que alerta cuando una célula excede su WIP limit y tiene ánimo promedio bajo
- Se creó componente KudosWall como feed tipo red social con reconocimientos entre compañeros y botón de envío

- Se crearon 6 property-based tests (fast-check) para funciones de bienestar: burnout detection, health score bounded, score classification, mood metamorphic, bar color threshold, trend direction
- Se crearon tests unitarios para funciones utilitarias: getAverageMood, calculateHealthScore, getCategoryEmoji, getUserName
- Se crearon tests de renderizado de componentes para BienestarPage (secciones Niko-Niko, Sostenibilidad, Burnout, Kudos, accesibilidad role="alert")
- Se crearon tests de interacción del Niko-Niko (confirmación al seleccionar ánimo, cambio de selección sin recarga)
- Se creó archivo de setup de testing `src/test-setup.ts` con @testing-library/jest-dom

### Cambiado
- Se actualizó mock-data.json para incluir escenario de riesgo de burnout en célula Siniestros (WIP 7/5, ánimo bajo)
