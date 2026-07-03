# Documento de Requerimientos

## Introducción

El módulo de Observabilidad para la página /flujo proporciona a los gerentes de ingeniería y líderes técnicos una vista en tiempo real de las métricas de salud de entrega para sus células de desarrollo. El módulo muestra métricas DORA (Deployment Frequency y Cycle Time) como tarjetas resumen, una barra visual de alerta WIP (Work In Progress) que compara la carga de trabajo actual contra los límites definidos, y tooltips educativos que explican cada métrica con orientación metodológica. El diseño sigue un estilo de dashboard ejecutivo, analítico y limpio, con cero sobrecarga visual.

## Glosario

- **Flujo_Page**: El componente de página de la ruta /flujo (src/pages/flujo/FlujoPage.tsx) que aloja el módulo de observabilidad
- **DORA_Metrics_Cards**: Un conjunto de componentes de tarjetas resumen que muestran los valores de Deployment Frequency y Cycle Time para la célula seleccionada
- **Deployment_Frequency**: Una métrica DORA que representa con qué frecuencia el equipo despliega código a producción dentro de un período de tiempo determinado
- **Cycle_Time**: Una métrica DORA que representa el tiempo transcurrido desde el primer commit hasta el despliegue en producción
- **WIP_Bar**: Un componente de barra de progreso horizontal que compara visualmente el conteo actual de Work In Progress contra el límite WIP definido de la célula
- **WIP_Actual**: El número actual de elementos de trabajo en progreso para la célula seleccionada
- **WIP_Limit**: El número máximo de elementos de trabajo permitidos en progreso simultáneamente para la célula seleccionada
- **Overload_State**: La condición donde WIP_Actual excede WIP_Limit (ratio > 100 por ciento)
- **Educational_Tooltip**: Un popover informativo activado por un ícono de información que explica el significado de una métrica y proporciona un consejo metodológico rápido
- **Cell_Selector**: El mecanismo mediante el cual el usuario selecciona qué datos de célula de desarrollo mostrar
- **Data_Service**: La capa de servicio de datos (src/data/data-service.ts) que proporciona datos mock a los componentes de UI
- **SB_UI**: La biblioteca de componentes personalizada de Seguros Bolívar utilizada para un estilizado consistente
- **AI_Impact_Chart**: Componente visual (gráfico comparativo simple) que contrasta el tiempo de entrega de tareas desarrolladas con asistencia de IA frente a las tradicionales.
- **Shared_Team_State**: Estado global o contexto compartido de la aplicación (ej. Redux, Zustand o Context API) que expone la salud del equipo (WIP y Ánimo) para el consumo de otros módulos de la app.

## Requerimientos

### Requerimiento 1: Mostrar Tarjetas de Métricas DORA

**Historia de Usuario:** Como gerente de ingeniería, quiero ver el Deployment Frequency y el Cycle Time de la célula seleccionada presentados como tarjetas resumen, para que pueda evaluar rápidamente el desempeño de entrega de mi equipo.

#### Criterios de Aceptación

1. CUANDO la Flujo_Page se carga, LAS DORA_Metrics_Cards DEBERÁN mostrar el valor de Deployment_Frequency para la célula actualmente seleccionada
2. CUANDO la Flujo_Page se carga, LAS DORA_Metrics_Cards DEBERÁN mostrar el valor de Cycle_Time para la célula actualmente seleccionada
3. LAS DORA_Metrics_Cards DEBERÁN presentar cada métrica en una tarjeta individual con una etiqueta de título y un valor numérico
4. CUANDO la célula seleccionada cambia, LAS DORA_Metrics_Cards DEBERÁN actualizarse para reflejar el Deployment_Frequency y Cycle_Time de la célula recién seleccionada
5. LAS DORA_Metrics_Cards DEBERÁN mostrar Deployment_Frequency con su unidad de medida (despliegues por semana)
6. LAS DORA_Metrics_Cards DEBERÁN mostrar Cycle_Time con su unidad de medida (horas)
7. MIENTRAS el Data_Service está cargando datos de métricas, LAS DORA_Metrics_Cards DEBERÁN mostrar un indicador de carga en lugar de los valores de las métricas

### Requerimiento 2: Barra Visual de Alerta WIP

**Historia de Usuario:** Como líder técnico, quiero ver una barra de progreso horizontal comparando WIP actual versus WIP límite, para que pueda identificar rápidamente cuando mi equipo está sobrecargado con elementos de trabajo concurrentes.

#### Criterios de Aceptación

1. LA WIP_Bar DEBERÁ renderizarse como una barra de progreso horizontal mostrando la proporción de WIP_Actual a WIP_Limit como un porcentaje de llenado
2. LA WIP_Bar DEBERÁ mostrar los valores numéricos de WIP_Actual y WIP_Limit adyacentes a la barra (formato: "X / Y")
3. MIENTRAS WIP_Actual es menor o igual a WIP_Limit, LA WIP_Bar DEBERÁ renderizarse con el esquema de color predeterminado (tono verde o neutro)
4. CUANDO WIP_Actual excede WIP_Limit, LA WIP_Bar DEBERÁ cambiar su color de llenado a rojo para indicar el Overload_State
5. CUANDO WIP_Actual excede WIP_Limit, LA WIP_Bar DEBERÁ mostrar la etiqueta de texto "Sobrecarga de trabajo" debajo o adyacente a la barra
6. LA WIP_Bar DEBERÁ calcular el porcentaje de llenado como (WIP_Actual / WIP_Limit) * 100, limitando el llenado visual al 100 por ciento de ancho
7. CUANDO la célula seleccionada cambia, LA WIP_Bar DEBERÁ actualizarse para reflejar el WIP_Actual y WIP_Limit de la célula recién seleccionada
8. SI WIP_Limit es cero o indefinido para una célula, ENTONCES LA WIP_Bar DEBERÁ mostrar "Sin límite WIP definido" y renderizar una barra vacía
9. CUANDO la WIP_Bar entre en Overload_State, DEBERÁ actualizar el Shared_Team_State del equipo afectado a `isOverloaded = true`, permitiendo que el módulo de Bienestar consuma esta alerta en tiempo real.

### Requerimiento 3: Tooltips Educativos

**Historia de Usuario:** Como miembro del equipo no familiarizado con las métricas DORA, quiero ver un ícono de información junto a cada título de métrica que muestre una explicación al pasar el cursor, para que pueda entender qué significa cada métrica y obtener un consejo metodológico rápido.

#### Criterios de Aceptación

1. EL Educational_Tooltip DEBERÁ renderizar un ícono de información (i) adyacente a cada título de métrica en las secciones DORA_Metrics_Cards y WIP_Bar
2. CUANDO el usuario pasa el cursor sobre el ícono de información, EL Educational_Tooltip DEBERÁ mostrar un popover con una breve explicación de la métrica asociada
3. CUANDO el usuario pasa el cursor sobre el ícono de información, EL Educational_Tooltip DEBERÁ incluir un consejo metodológico corto dentro del contenido del popover
4. CUANDO el usuario mueve el cursor fuera del ícono de información, EL Educational_Tooltip DEBERÁ ocultar el popover
5. EL Educational_Tooltip DEBERÁ ser accesible mediante foco de teclado (navegación con Tab) y mostrarse en el evento de foco
6. EL Educational_Tooltip DEBERÁ tener un ancho máximo de 280px para evitar sobrecarga visual en el dashboard
7. EL Educational_Tooltip del WIP DEBERÁ mostrar el siguiente texto empático de Gestión del Cambio: "Un WIP alto dilata las entregas. En lugar de presionar al equipo, te sugerimos apoyarte en un experto técnico (puedes buscar uno en el módulo de Talento) para destrabar los pases a producción mediante Pair Programming."

### Requerimiento 4: Integración de Selección de Célula

**Historia de Usuario:** Como gerente de ingeniería, quiero seleccionar las métricas de qué célula estoy visualizando, para que pueda comparar el desempeño entre diferentes equipos.

#### Criterios de Aceptación

1. EL Cell_Selector DEBERÁ mostrar una lista de células disponibles obtenidas del Data_Service
2. CUANDO el usuario selecciona una célula del Cell_Selector, LA Flujo_Page DEBERÁ actualizar todos los componentes de métricas (DORA_Metrics_Cards y WIP_Bar) para reflejar los datos de la célula seleccionada
3. CUANDO la Flujo_Page se carga, EL Cell_Selector DEBERÁ establecer por defecto la primera célula de la lista
4. EL Cell_Selector DEBERÁ indicar cuál célula está actualmente seleccionada con una distinción visual

### Requerimiento 5: Integración de Datos desde Fuente Mock

**Historia de Usuario:** Como desarrollador, quiero que el módulo de observabilidad consuma datos de la capa de servicio de datos existente, para que los componentes de UI se rendericen correctamente con los datos mock disponibles.

#### Criterios de Aceptación

1. LA Flujo_Page DEBERÁ obtener todos los datos de métricas (Deployment_Frequency, Cycle_Time, WIP_Actual, WIP_Limit) a través de la capa Data_Service
2. EL Data_Service DEBERÁ exponer interfaces tipadas para las estructuras de datos de métricas de observabilidad
3. SI el Data_Service retorna un error o datos vacíos, ENTONCES LA Flujo_Page DEBERÁ mostrar un mensaje de estado vacío amigable para el usuario en lugar de elementos de UI rotos
4. LA Flujo_Page NO DEBERÁ realizar llamadas HTTP directas ni omitir el Data_Service para la obtención de datos

### Requerimiento 6: Layout Responsivo y Consistencia Visual

**Historia de Usuario:** Como usuario, quiero que el módulo de observabilidad se renderice de manera consistente con el sistema de diseño existente del dashboard, para que la experiencia se sienta cohesiva.

#### Criterios de Aceptación

1. LA Flujo_Page DEBERÁ usar clases utilitarias de Tailwind CSS para layout y espaciado consistente con los patrones existentes del proyecto
2. LA Flujo_Page DEBERÁ seguir el estilo de dashboard ejecutivo, analítico y limpio con elementos visuales mínimos
3. LAS DORA_Metrics_Cards DEBERÁN renderizarse en una fila horizontal en viewports de escritorio (>=1024px) y apilarse verticalmente en viewports más pequeños
4. LA Flujo_Page DEBERÁ usar los estilos de la biblioteca de componentes SB_UI donde sea aplicable para botones, tarjetas y tipografía

### Requerimiento 7: Visualización de Impacto de IA en el Flujo

**Historia de Usuario:** Como líder de Métodos y Formas de Trabajo, quiero ver una comparativa del Cycle Time entre tareas apoyadas por IA y tareas tradicionales, para demostrar el ROI de las herramientas de asistencia de desarrollo al negocio.

#### Criterios de Aceptación

1. LA Flujo_Page DEBERÁ renderizar un componente AI_Impact_Chart debajo de las DORA_Metrics_Cards.
2. EL AI_Impact_Chart DEBERÁ mostrar dos barras comparativas simples: una para el "Cycle Time Promedio con IA" y otra para el "Cycle Time Promedio Tradicional".
3. LOS datos para el AI_Impact_Chart DEBERÁN ser provistos por el Data_Service simulando una reducción del 30% en el tiempo de entrega al usar IA.
4. EL componente DEBERÁ usar los colores de la biblioteca SB_UI asignados a innovación (ej. el tono verde corporativo para la barra de IA).
