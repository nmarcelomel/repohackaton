# Documento de Requisitos — Módulo de Bienestar

## Introducción

El Módulo de Bienestar es una página React (`/bienestar`) dentro del dashboard de inteligencia de ingeniería. Su propósito es proporcionar visibilidad sobre el estado emocional y la carga de trabajo de los equipos (células), detectar riesgos de burnout de forma temprana, y fomentar una cultura de reconocimiento entre compañeros. El módulo prioriza la empatía visual y un estilo amigable y humano.

## Glosario

- **Sistema_Bienestar**: La página React renderizada en la ruta `/bienestar` y todos sus componentes hijos.
- **Termómetro_NikoNiko**: Componente de selección de estado de ánimo del usuario actual.
- **Radar_Burnout**: Componente de alertas que evalúa riesgo de burnout por célula.
- **Muro_Kudos**: Feed lateral estilo red social de reconocimientos entre compañeros.
- **Pulso_Equipo**: Componente que muestra la tendencia semanal de ánimo por célula.
- **Índice_Sostenibilidad**: Componente que calcula y muestra un health score compuesto por célula.
- **Sugerencias_Acción**: Componente que presenta recomendaciones inteligentes (IA) para equipos.
- **Célula**: Equipo de desarrollo (Team) con propiedades `wipLimit`, `wipCurrent` y `memberMood`.
- **WIP_Actual**: Número actual de items de trabajo en progreso de una célula (`wipCurrent`).
- **WIP_Límite**: Límite máximo de items de trabajo en progreso de una célula (`wipLimit`).
- **Ánimo_Promedio**: Media aritmética del ánimo de los miembros de una célula, mapeado numéricamente (excelente=5, bien=4, neutral=3, bajo=2, critico=1).
- **Kudo**: Reconocimiento público de un usuario hacia otro, con mensaje y categoría.
- **Mock_Data**: Datos estáticos servidos desde `src/data/mock-data.json` a través de `src/data/data-service.ts`.

## Requisitos

### Requisito 1: Termómetro Niko-Niko

**User Story:** Como usuario autenticado, quiero seleccionar mi estado de ánimo diario con un clic, para que el equipo tenga visibilidad sobre cómo me siento.

#### Criterios de Aceptación

1. THE Termómetro_NikoNiko SHALL presentar exactamente tres opciones de ánimo: 😃 ("Me siento genial"), 😐 ("Normal"), 😫 ("Agotado").
2. WHEN el usuario hace clic en una opción de ánimo, THE Termómetro_NikoNiko SHALL resaltar visualmente la opción seleccionada con un borde/anillo diferenciado y escala aumentada.
3. WHEN el usuario ha seleccionado un ánimo, THE Termómetro_NikoNiko SHALL mostrar un mensaje de confirmación: "¡Gracias por compartir! Tu bienestar nos importa 💚".
4. THE Termómetro_NikoNiko SHALL renderizarse en la parte superior de la página de bienestar.
5. THE Termómetro_NikoNiko SHALL permitir cambiar la selección haciendo clic en otra opción sin necesidad de recargar.

### Requisito 2: Radar de Burnout

**User Story:** Como líder de equipo, quiero ver alertas visuales cuando una célula tiene riesgo de burnout, para poder tomar acciones preventivas a tiempo.

#### Criterios de Aceptación

1. THE Radar_Burnout SHALL evaluar cada célula del Mock_Data aplicando la regla: riesgo de burnout existe CUANDO `wipCurrent > wipLimit` Y `Ánimo_Promedio < 3`.
2. WHEN una célula cumple ambas condiciones de riesgo (WIP_Actual mayor que WIP_Límite Y Ánimo_Promedio menor a 3), THE Radar_Burnout SHALL mostrar una alerta roja con el texto: "🚨 Riesgo Alto de Burnout en [Nombre Célula]".
3. WHEN una célula está en riesgo, THE Radar_Burnout SHALL mostrar los valores actuales de WIP (actual/límite) y ánimo promedio en la alerta.
4. WHEN ninguna célula cumple las condiciones de riesgo, THE Radar_Burnout SHALL mostrar un mensaje positivo: "✅ Todas las células están en niveles saludables".
5. THE Radar_Burnout SHALL usar `role="alert"` en los elementos de alerta para accesibilidad.
6. WHEN existen células en riesgo Y células saludables simultáneamente, THE Radar_Burnout SHALL listar las células saludables en una sección complementaria.

### Requisito 3: Muro de Kudos

**User Story:** Como miembro de un equipo, quiero ver y enviar reconocimientos a mis compañeros, para fomentar una cultura de aprecio y motivación.

#### Criterios de Aceptación

1. THE Muro_Kudos SHALL renderizar todos los kudos del Mock_Data en un feed vertical con scroll.
2. THE Muro_Kudos SHALL mostrar cada kudo con: emoji de categoría, nombre del remitente, nombre del destinatario, mensaje y fecha.
3. THE Muro_Kudos SHALL resolver los nombres de usuario a partir del array `users` del Mock_Data usando los campos `fromUserId` y `toUserId`.
4. THE Muro_Kudos SHALL mostrar un botón "Enviar Kudo" visible en la cabecera del componente.
5. WHEN el usuario hace clic en "Enviar Kudo", THE Muro_Kudos SHALL presentar la interacción (solo UI, sin persistencia en backend).
6. THE Muro_Kudos SHALL mapear las categorías de kudos a emojis: colaboracion→🤝, innovacion→💡, liderazgo→🌟, calidad→🎯.

### Requisito 4: Pulso Semanal del Equipo

**User Story:** Como líder de equipo, quiero ver la tendencia de ánimo semanal de cada célula, para detectar deterioros progresivos en el bienestar.

#### Criterios de Aceptación

1. THE Pulso_Equipo SHALL mostrar el historial de ánimo semanal de cada célula usando barras de color proporcionales al valor de `avgMood`.
2. THE Pulso_Equipo SHALL colorear las barras según el valor: verde (avgMood ≥ 4), amarillo (avgMood ≥ 3 y < 4), rojo (avgMood < 3).
3. THE Pulso_Equipo SHALL mostrar la tendencia (diferencia entre la última y penúltima semana) con un icono de flecha ascendente (verde) o descendente (rojo).
4. THE Pulso_Equipo SHALL mostrar el valor numérico del cambio con signo (+/-) junto a la flecha de tendencia.

### Requisito 5: Índice de Sostenibilidad

**User Story:** Como gerente de ingeniería, quiero ver un score de salud compuesto por célula, para tener una vista consolidada del estado de cada equipo.

#### Criterios de Aceptación

1. THE Índice_Sostenibilidad SHALL calcular un health score (0-100) por célula basado en: ánimo promedio (40% peso), ratio WIP (30% peso), y métricas DORA (30% peso).
2. THE Índice_Sostenibilidad SHALL clasificar los scores: "Saludable" (≥75), "Atención" (≥50 y <75), "Crítico" (<50).
3. THE Índice_Sostenibilidad SHALL colorear cada tarjeta según la clasificación: verde (Saludable), amarillo (Atención), rojo (Crítico).
4. THE Índice_Sostenibilidad SHALL mostrar los componentes individuales del score: ánimo/5, WIP actual/límite, y frecuencia de deploy.

### Requisito 6: Sugerencias Inteligentes

**User Story:** Como líder de equipo, quiero recibir sugerencias accionables basadas en el estado de bienestar, para saber qué pasos tomar ante problemas detectados.

#### Criterios de Aceptación

1. THE Sugerencias_Acción SHALL separar las sugerencias en dos categorías: "Acciones urgentes" (type=critical) y "Oportunidades" (type=positive).
2. THE Sugerencias_Acción SHALL mostrar el nombre de la célula asociada a cada sugerencia.
3. THE Sugerencias_Acción SHALL mostrar el mensaje descriptivo y la acción recomendada de cada sugerencia.
4. THE Sugerencias_Acción SHALL diferenciar visualmente las sugerencias críticas (fondo rojo, icono de error) de las positivas (fondo verde, icono de check).

### Requisito 7: Layout y Estilo Visual

**User Story:** Como usuario del dashboard, quiero que el módulo de bienestar tenga un diseño amigable y empático, para que la experiencia sea agradable y humana.

#### Criterios de Aceptación

1. THE Sistema_Bienestar SHALL organizar los componentes en un layout responsivo: Termómetro_NikoNiko e Índice_Sostenibilidad a ancho completo arriba, luego una grilla con Radar_Burnout y Sugerencias_Acción a la izquierda (7 columnas), y Pulso_Equipo y Muro_Kudos a la derecha (5 columnas).
2. THE Sistema_Bienestar SHALL usar las clases de la librería institucional sb-ui para tarjetas (`sb-ui-card`, `sb-ui-card--elevated`) y grilla (`sb-ui-grid`, `sb-ui-col-*`).
3. THE Sistema_Bienestar SHALL usar iconos de Lucide React para complementar la información visual.
4. THE Sistema_Bienestar SHALL usar Tailwind CSS para estilos complementarios de espaciado, colores y transiciones.

### Requisito 8: Acceso a Datos

**User Story:** Como desarrollador, quiero que todos los componentes accedan a datos a través de una capa de servicio centralizada, para mantener la separación de responsabilidades.

#### Criterios de Aceptación

1. THE Sistema_Bienestar SHALL obtener todos los datos exclusivamente a través de las funciones exportadas por `src/data/data-service.ts`.
2. THE Sistema_Bienestar SHALL consumir datos mock desde `src/data/mock-data.json` sin realizar llamadas HTTP reales.
3. THE Sistema_Bienestar SHALL utilizar los tipos definidos en `src/types/index.ts` para tipar todos los datos consumidos.

## Propiedades de Correctitud

### Propiedad 1: Detección de Burnout (Invariante)

**Propiedad formal:** Para toda célula C del conjunto de equipos, `isAtBurnoutRisk(C) = true` si y solo si `C.wipCurrent > C.wipLimit AND Ánimo_Promedio(C) < 3`.

**Tipo:** Invariante — la función de detección debe ser equivalente a la conjunción de ambas condiciones para cualquier combinación válida de inputs.

**Casos a verificar:**
- Si `wipCurrent ≤ wipLimit`, el resultado es `false` independientemente del ánimo.
- Si `Ánimo_Promedio ≥ 3`, el resultado es `false` independientemente del WIP.
- Solo cuando ambas condiciones se cumplen simultáneamente, el resultado es `true`.
- El cálculo del ánimo promedio es correcto: `sum(moodScores) / count(members)` con el mapeo excelente=5, bien=4, neutral=3, bajo=2, critico=1.

### Propiedad 2: Cálculo de Ánimo Promedio (Metamórfica)

**Propiedad formal:** Si se agrega un miembro con mood="critico" (valor 1) a una célula cuyo Ánimo_Promedio actual es > 1, el nuevo Ánimo_Promedio debe ser estrictamente menor que el anterior.

**Tipo:** Metamórfica — agregar un miembro con ánimo inferior al promedio actual siempre reduce el promedio.

### Propiedad 3: Mapeo de Emojis de Categoría (Round-trip)

**Propiedad formal:** Para toda categoría válida de Kudo (colaboracion, innovacion, liderazgo, calidad), `getCategoryEmoji(category)` retorna un emoji no vacío, y el mapeo es inyectivo (cada categoría mapea a un emoji único).

**Tipo:** Invariante — el mapeo cubre todas las categorías posibles y es determinístico.

### Propiedad 4: Health Score Acotado (Invariante)

**Propiedad formal:** Para toda célula C con valores válidos, `0 ≤ calculateHealthScore(C) ≤ 100`.

**Tipo:** Invariante — el score compuesto nunca excede los límites [0, 100] sin importar los valores de entrada dentro del dominio válido.
