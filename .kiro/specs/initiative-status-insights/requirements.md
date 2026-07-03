# Requirements Document

## Introduction

El feature "Initiative Status Insights" añade tooltips/popovers interactivos a los chips de estado de las iniciativas en la tabla del módulo Negocio (`/negocio`). Cuando el usuario posiciona el cursor sobre un chip de estado, el sistema muestra información contextual inteligente dependiendo del estado de la iniciativa: sugerencias de mejora continua para iniciativas en progreso, predicción de riesgo con solución recomendada para iniciativas en riesgo, y un resumen de éxito para iniciativas completadas. El objetivo es empoderar a los líderes de tecnología con insights accionables directamente desde la tabla de iniciativas, sin necesidad de navegar a otras vistas. El proyecto utiliza React 18.3 con TypeScript, Vite, Tailwind CSS y el sistema de diseño sb-ui de Seguros Bolívar.

## Glossary

- **Negocio_Module**: Módulo de la ruta `/negocio` que contiene la tabla de iniciativas, visualizaciones de valor y formulario de intake.
- **Status_Chip**: Componente visual (sb-ui-chip) dentro de la tabla de iniciativas que muestra el estado actual de una iniciativa ("En progreso", "Completada", "En riesgo").
- **Insight_Popover**: Componente de popover/tooltip que aparece cuando el usuario posiciona el cursor sobre un Status_Chip, mostrando información contextual según el estado de la iniciativa.
- **Initiative**: Proyecto tecnológico con un valor proyectado, un valor real y un estado (en_progreso, completada, en_riesgo).
- **Fulfillment_Ratio**: Razón entre el valor real y el valor proyectado de una iniciativa, expresada como porcentaje (actualValue / projectedValue * 100).
- **Improvement_Suggestion**: Texto con recomendaciones de mejora continua generadas para iniciativas con estado "en_progreso", basadas en las métricas de cumplimiento de la iniciativa.
- **Risk_Prediction**: Análisis que identifica el factor de riesgo principal de una iniciativa con estado "en_riesgo" y proporciona una solución/mitigación recomendada.
- **Success_Summary**: Texto breve que resume los resultados positivos de una iniciativa con estado "completada".
- **Insights_Engine**: Módulo lógico del frontend que calcula y genera los insights (sugerencias, predicciones, resúmenes) a partir de los datos de cada iniciativa.
- **Data_Service**: Capa de servicios del frontend que provee acceso a los datos mock de iniciativas, equipos y usuarios.

## Requirements

### Requirement 1: Popover de Insights al Posicionar el Cursor

**User Story:** Como líder de tecnología, quiero que al posicionar el cursor sobre el chip de estado de una iniciativa aparezca un popover con insights relevantes, para obtener información accionable sin salir de la tabla de iniciativas.

#### Acceptance Criteria

1. CUANDO el usuario posiciona el cursor (hover) sobre un Status_Chip en la tabla de iniciativas, EL Insight_Popover DEBERÁ aparecer dentro de 200 milisegundos mostrando el contenido contextual correspondiente al estado de la iniciativa.
2. CUANDO el usuario retira el cursor del Status_Chip y del Insight_Popover, EL Insight_Popover DEBERÁ cerrarse dentro de 300 milisegundos.
3. MIENTRAS el cursor del usuario permanece sobre el Insight_Popover, EL Insight_Popover DEBERÁ permanecer visible para permitir la lectura del contenido.
4. EL Insight_Popover DEBERÁ posicionarse adyacente al Status_Chip sin superponerse al texto de la tabla, priorizando la posición superior o inferior según el espacio disponible en el viewport.
5. EL Insight_Popover DEBERÁ tener un ancho máximo de 320 píxeles y un contenido con scroll vertical si el texto excede 200 píxeles de altura.
6. CUANDO el usuario navega mediante teclado y enfoca (focus) un Status_Chip, EL Insight_Popover DEBERÁ aparecer con el mismo contenido y comportamiento que en la interacción por hover.
7. CUANDO el usuario presiona la tecla Escape mientras el Insight_Popover es visible, EL Insight_Popover DEBERÁ cerrarse inmediatamente.
8. EL Insight_Popover DEBERÁ incluir el atributo ARIA role="tooltip" y el Status_Chip DEBERÁ incluir el atributo aria-describedby referenciando el Insight_Popover para cumplir con los estándares de accesibilidad.

### Requirement 2: Insights para Iniciativas En Progreso

**User Story:** Como líder de tecnología, quiero que al posicionar el cursor sobre una iniciativa en progreso el sistema me sugiera acciones de mejora continua, para optimizar la entrega de valor de la iniciativa.

#### Acceptance Criteria

1. CUANDO el usuario posiciona el cursor sobre un Status_Chip con estado "en_progreso", EL Insight_Popover DEBERÁ mostrar un título "Mejora Continua" seguido de una o más sugerencias de mejora.
2. CUANDO el Fulfillment_Ratio de una iniciativa en progreso es mayor o igual al 90%, EL Insights_Engine DEBERÁ generar una sugerencia indicando que la iniciativa está en camino óptimo y recomendar mantener el ritmo actual de ejecución.
3. CUANDO el Fulfillment_Ratio de una iniciativa en progreso está entre 70% y 89% (inclusivo), EL Insights_Engine DEBERÁ generar una sugerencia indicando una brecha moderada entre el valor proyectado y real, y recomendar revisar los impedimentos del equipo para acelerar la entrega.
4. CUANDO el Fulfillment_Ratio de una iniciativa en progreso es menor al 70%, EL Insights_Engine DEBERÁ generar una sugerencia indicando una brecha significativa y recomendar una revisión de alcance o una repriorización de recursos.
5. EL Insight_Popover DEBERÁ mostrar el Fulfillment_Ratio actual de la iniciativa formateado como porcentaje con un decimal (por ejemplo, "81.7%") junto a la etiqueta "Cumplimiento actual:".
6. SI el projectedValue de una iniciativa en progreso es cero, ENTONCES EL Insights_Engine DEBERÁ mostrar un mensaje indicando que no es posible calcular el ratio de cumplimiento debido a un valor proyectado no definido.

### Requirement 3: Predicción de Riesgo para Iniciativas En Riesgo

**User Story:** Como líder de tecnología, quiero que al posicionar el cursor sobre una iniciativa en riesgo el sistema me prediga el factor de riesgo principal y sugiera una solución, para poder tomar acciones preventivas oportunamente.

#### Acceptance Criteria

1. CUANDO el usuario posiciona el cursor sobre un Status_Chip con estado "en_riesgo", EL Insight_Popover DEBERÁ mostrar un título "Predicción de Riesgo" seguido del factor de riesgo identificado y una solución recomendada.
2. CUANDO el Fulfillment_Ratio de una iniciativa en riesgo es menor al 50%, EL Insights_Engine DEBERÁ identificar el riesgo como "Desviación crítica de valor" y recomendar una sesión de revisión ejecutiva para redefinir objetivos o reasignar presupuesto.
3. CUANDO el Fulfillment_Ratio de una iniciativa en riesgo está entre 50% y 69% (inclusivo), EL Insights_Engine DEBERÁ identificar el riesgo como "Entrega de valor por debajo del objetivo" y recomendar incrementar la frecuencia de seguimiento y asignar recursos de apoyo al equipo responsable.
4. EL Insight_Popover DEBERÁ mostrar la brecha de valor (projectedValue menos actualValue) formateada como valor monetario en millones (por ejemplo, "$900M de brecha") junto al factor de riesgo.
5. EL Insight_Popover DEBERÁ mostrar una sección "Solución recomendada:" claramente separada del diagnóstico de riesgo.
6. SI el projectedValue de una iniciativa en riesgo es cero, ENTONCES EL Insights_Engine DEBERÁ mostrar un riesgo genérico indicando "Datos insuficientes para predicción" y recomendar actualizar los valores proyectados de la iniciativa.

### Requirement 4: Resumen de Éxito para Iniciativas Completadas

**User Story:** Como líder de tecnología, quiero que al posicionar el cursor sobre una iniciativa completada vea un resumen de su éxito, para reconocer los logros del equipo y usar la información en reportes ejecutivos.

#### Acceptance Criteria

1. CUANDO el usuario posiciona el cursor sobre un Status_Chip con estado "completada", EL Insight_Popover DEBERÁ mostrar un título "Resumen de Éxito" seguido de las métricas de resultado.
2. EL Insight_Popover DEBERÁ mostrar el Fulfillment_Ratio final formateado como porcentaje con un decimal (por ejemplo, "106.3%").
3. CUANDO el actualValue de una iniciativa completada es mayor o igual al projectedValue, EL Insights_Engine DEBERÁ generar un mensaje indicando que la iniciativa superó o alcanzó las expectativas de valor.
4. CUANDO el actualValue de una iniciativa completada es menor al projectedValue, EL Insights_Engine DEBERÁ generar un mensaje indicando el porcentaje de cumplimiento alcanzado y sugerir documentar las lecciones aprendidas.
5. EL Insight_Popover DEBERÁ mostrar el valor real entregado formateado como valor monetario en millones (por ejemplo, "Valor entregado: $850M").

### Requirement 5: Motor de Generación de Insights

**User Story:** Como desarrollador, quiero que la lógica de generación de insights esté encapsulada en un módulo separado y testeable, para facilitar el mantenimiento y la extensión futura del sistema.

#### Acceptance Criteria

1. EL Insights_Engine DEBERÁ implementarse como un módulo TypeScript independiente exportando funciones puras que reciban una Initiative y retornen el insight correspondiente.
2. EL Insights_Engine DEBERÁ calcular el Fulfillment_Ratio como (actualValue / projectedValue) * 100, retornando 0 cuando projectedValue es cero.
3. EL Insights_Engine DEBERÁ retornar un objeto tipado con la estructura: título (string), descripción del insight (string), métricas relevantes (array de objetos con label y valor formateado), y una recomendación (string).
4. EL Insights_Engine DEBERÁ determinar el tipo de insight basándose exclusivamente en el campo status de la Initiative: "en_progreso" genera Improvement_Suggestion, "en_riesgo" genera Risk_Prediction, "completada" genera Success_Summary.
5. PARA TODA Initiative válida, generar un insight y luego extraer el status DEBERÁ producir un tipo de insight consistente con el status original (propiedad de idempotencia del mapeo status-a-tipo).
6. EL Insights_Engine DEBERÁ exportar los tipos TypeScript de sus interfaces de entrada y salida para que otros módulos puedan consumirlos con seguridad de tipos.

### Requirement 6: Estilo Visual del Popover

**User Story:** Como usuario del módulo Negocio, quiero que los popovers de insights tengan un estilo visual consistente con el sistema de diseño corporativo, para mantener una experiencia profesional y coherente.

#### Acceptance Criteria

1. EL Insight_Popover DEBERÁ renderizarse dentro de un contenedor con fondo blanco, borde redondeado (border-radius de 8px), y sombra elevada consistente con la clase sb-ui-card--elevated.
2. EL Insight_Popover DEBERÁ mostrar el título con la clase sb-ui-text-caption en negrita y un color diferenciado según el estado: color primario (--sb-ui-color-primary-base) para "en_progreso", color de error (--sb-ui-color-error-base) para "en_riesgo", y color de éxito (--sb-ui-color-success-base) para "completada".
3. EL Insight_Popover DEBERÁ mostrar el cuerpo del texto con un tamaño mínimo de fuente de 12px y un interlineado de 1.5 para asegurar la legibilidad.
4. EL Insight_Popover DEBERÁ incluir un indicador visual (flecha/triángulo) apuntando hacia el Status_Chip que lo activó.
5. EL Insight_Popover DEBERÁ usar clases utilitarias de Tailwind CSS para espaciado interno (padding de 12px a 16px) y separación entre secciones (gap de 8px).

