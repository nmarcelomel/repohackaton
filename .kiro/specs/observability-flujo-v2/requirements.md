# Documento de Requerimientos - Módulo de Observabilidad (/flujo)

## Introducción

El módulo de Observabilidad para la página `/flujo` proporciona a los gerentes de ingeniería, líderes técnicos y equipos una vista en tiempo real de las métricas de salud de entrega para sus células de desarrollo. Fomenta el acompañamiento metodológico en lugar del micromanagement. El módulo muestra métricas DORA y de Flujo (Deployment Frequency y Cycle Time), una barra visual de alerta WIP (Work In Progress) que expone su estado al resto de la aplicación, un gráfico del impacto de la IA en el desarrollo, y tooltips educativos empáticos. El diseño utiliza estrictamente la biblioteca de componentes de Seguros Bolívar.

## Glosario

- **Flujo_Page**: El componente principal de la ruta `/flujo` que aloja el módulo de observabilidad.
- **DORA_Metrics_Cards**: Componentes de tarjetas resumen (Cards) que muestran valores de métricas clave (Deployment Frequency y Cycle Time).
- **WIP_Bar**: Componente de barra de progreso horizontal (Progress Bar) que compara visualmente el Work In Progress actual contra el límite WIP.
- **Overload_State**: Condición crítica donde el WIP_Actual excede el WIP_Limit (ratio > 100%).
- **Educational_Tooltip**: Popover informativo activado por un ícono de información (i) que explica una métrica con tono de coaching metodológico.
- **AI_Impact_Chart**: Gráfico de barras simple que contrasta el Cycle Time de tareas desarrolladas con asistencia de IA frente a tareas tradicionales.
- **Shared_Team_State**: Estado global compartido (ej. Context API o store global) que expone la salud del equipo (isOverloaded) para que el módulo de Bienestar lo consuma.
- **Cell_Selector**: Dropdown o Select corporativo para elegir qué datos de célula de desarrollo visualizar.
- **Data_Service**: Capa de servicio (`mock-data.json`) que provee los datos simulados a la UI.
- **SB_UI**: La biblioteca de componentes oficial de Seguros Bolívar (Tokens de color, Tipografías, Cards, Buttons, Inputs).

## Requerimientos

### Requerimiento 1: Tarjetas de Métricas DORA y Flujo (HU-M01, HU-M02)

**Historia de Usuario:** Como líder técnico, quiero ver el Deployment Frequency y el Cycle Time de la célula seleccionada presentados como tarjetas resumen, para evaluar la fluidez de entrega sin recarga cognitiva.

#### Criterios de Aceptación

- 1.1 CUANDO la Flujo_Page se carga, LAS DORA_Metrics_Cards DEBERÁN mostrar los valores de Deployment Frequency (despliegues/semana) y Cycle Time (días/horas) obtenidos del Data_Service para la célula seleccionada.
- 1.2 LAS DORA_Metrics_Cards DEBERÁN presentar cada métrica utilizando el componente Card de la SB_UI.
- 1.3 CUANDO la célula seleccionada cambia, LAS DORA_Metrics_Cards DEBERÁN actualizar sus valores instantáneamente.
- 1.4 MIENTRAS los datos cargan, la UI DEBERÁ mostrar un skeleton loader o indicador de carga propio de la SB_UI.

### Requerimiento 2: Barra Visual de Alerta WIP y Estado Compartido (HU-M11, Integración HU-M27)

**Historia de Usuario:** Como Agile Coach, quiero ver una barra comparando el WIP actual vs el límite permitido, y que esta informe al sistema si el equipo está sobrecargado, para intervenir y evitar el burnout.

#### Criterios de Aceptación

- 2.1 LA WIP_Bar DEBERÁ renderizarse como una barra de progreso horizontal mostrando el porcentaje de llenado calculado como (WIP_Actual / WIP_Limit) * 100.
- 2.2 LA WIP_Bar DEBERÁ mostrar el texto con formato "Actual: X / Límite: Y" de forma clara.
- 2.3 MIENTRAS WIP_Actual sea menor o igual a WIP_Limit, LA WIP_Bar DEBERÁ usar el color primario/neutral de la SB_UI.
- 2.4 CUANDO WIP_Actual exceda WIP_Limit (entrando en Overload_State), LA WIP_Bar DEBERÁ cambiar a color de error/peligro de la SB_UI y mostrar el texto "🚨 Sobrecarga de trabajo".
- 2.5 CUANDO la WIP_Bar entre en Overload_State, DEBERÁ actualizar el Shared_Team_State estableciendo la propiedad isOverloaded = true para la célula actual, permitiendo al módulo /bienestar reaccionar.
- 2.6 SI WIP_Limit es indefinido o cero, LA WIP_Bar DEBERÁ mostrar "Sin límite WIP definido" y verse vacía.

### Requerimiento 3: Tooltips Educativos de Metodología (HU-M33)

**Historia de Usuario:** Como desarrollador, quiero ver explicaciones empáticas junto a las métricas para entender cómo mejorar el flujo sin sentirme juzgado.

#### Criterios de Aceptación

- 3.1 EL Educational_Tooltip DEBERÁ renderizar un pequeño ícono de ayuda (i) junto al título de la WIP_Bar y las DORA_Metrics_Cards.
- 3.2 CUANDO el usuario haga hover sobre el ícono de WIP, EL Educational_Tooltip DEBERÁ mostrar este texto exacto: "Un WIP alto dilata las entregas. En lugar de presionar al equipo, te sugerimos apoyarte en un experto técnico (búscalo en Talento) para destrabar los pases a producción."
- 3.3 CUANDO el cursor salga del ícono, el popover DEBERÁ desaparecer.

### Requerimiento 4: Visualización de Impacto de IA en el Flujo (HU-M13)

**Historia de Usuario:** Como VP de Tecnología, quiero ver la comparativa de tiempos de entrega entre tareas con IA y sin IA, para justificar la inversión en herramientas de innovación.

#### Criterios de Aceptación

- 4.1 LA Flujo_Page DEBERÁ incluir un AI_Impact_Chart (gráfico de barras) debajo de las métricas principales.
- 4.2 EL AI_Impact_Chart DEBERÁ mostrar dos barras horizontales: "Cycle Time Tradicional" y "Cycle Time con Asistencia IA".
- 4.3 EL AI_Impact_Chart DEBERÁ aplicar el color de innovación/destacado de la SB_UI a la barra de IA, evidenciando visualmente la reducción del tiempo.

### Requerimiento 5: Integración y Sistema de Diseño (Transversal)

**Historia de Usuario:** Como usuario, quiero que la interfaz sea coherente con la marca de Seguros Bolívar y permita cambiar de células de manera intuitiva.

#### Criterios de Aceptación

- 5.1 EL Cell_Selector DEBERÁ ser un Dropdown de la SB_UI ubicado en la parte superior que liste las células desde el Data_Service.
- 5.2 CUANDO se cambie el valor del Cell_Selector, TODOS los componentes de la página DEBERÁN re-renderizarse con los datos de la nueva célula.
- 5.3 TODA la página DEBERÁ utilizar estrictamente los tokens CSS, paleta de colores y tipografías de la biblioteca SB_UI del repositorio. NO se deben inventar estilos personalizados que rompan el sistema de diseño corporativo.
