# Requirements Document

## Introduction

El módulo "Realización de Valor" amplía la página existente de Negocio (`/negocio`) para ofrecer a ejecutivos y líderes de tecnología una vista gerencial que permite comparar el valor prometido versus el realizado por cada iniciativa tecnológica, visualizar la alineación estratégica del esfuerzo técnico con los OKRs de negocio, y capturar nuevas iniciativas a través de un formulario de intake estructurado. El proyecto utiliza React 18.3 con Vite y el sistema de diseño sb-ui de Seguros Bolívar.

## Glossary

- **Negocio_Module**: Módulo de la ruta `/negocio` que contiene las visualizaciones de valor, alineación estratégica e intake de iniciativas.
- **Value_Chart**: Componente de gráfico de barras comparativo que muestra el valor proyectado versus el valor real de cada iniciativa.
- **Alignment_Chart**: Componente de gráfico de dona (donut chart) que muestra el porcentaje de esfuerzo técnico alineado a OKRs de negocio versus esfuerzo no alineado.
- **Intake_Form**: Formulario de registro de nuevas iniciativas de negocio con campos obligatorios.
- **Initiative**: Proyecto tecnológico con un valor proyectado y un valor real medido en millones de pesos colombianos.
- **Fulfillment_Ratio**: Razón entre el valor real y el valor proyectado de una iniciativa, expresada como porcentaje (actualValue / projectedValue * 100).
- **Strategic_Alignment_Index**: Métrica que indica qué porcentaje del esfuerzo técnico total está asociado a OKRs de negocio.
- **Data_Service**: Capa de servicios del frontend que provee acceso a los datos mock de iniciativas, equipos y usuarios.

## Requirements

### Requirement 1: Tablero de Valor Comparativo

**User Story:** Como ejecutivo de tecnología, quiero ver un gráfico de barras comparativo de valor prometido versus valor realizado por cada iniciativa, para identificar rápidamente brechas de valor y tomar decisiones correctivas.

#### Acceptance Criteria

1. CUANDO el Negocio_Module se carga, EL Value_Chart DEBERÁ renderizar un gráfico de barras agrupadas con el eje X mostrando los nombres de las iniciativas (truncados a 20 caracteres con puntos suspensivos si son más largos) y el eje Y mostrando valores en millones (COP) con un rango auto-escalado basado en el máximo projectedValue o actualValue entre todas las iniciativas.
2. EL Value_Chart DEBERÁ mostrar dos barras por iniciativa: una barra representando el valor proyectado ("Promesa") y una barra representando el valor real ("Realidad"), con una leyenda visible que identifique cada tipo de barra.
3. EL Value_Chart DEBERÁ colorear la barra "Promesa" usando un tono neutral de la paleta sb-ui (gris o azul) consistente en todas las iniciativas.
4. CUANDO el Fulfillment_Ratio (calculado como actualValue dividido entre projectedValue multiplicado por 100) de una iniciativa es mayor o igual al 90%, EL Value_Chart DEBERÁ colorear la barra "Realidad" en verde.
5. CUANDO el Fulfillment_Ratio de una iniciativa está entre 70% y 89% (inclusivo), EL Value_Chart DEBERÁ colorear la barra "Realidad" en amarillo/ámbar.
6. CUANDO el Fulfillment_Ratio de una iniciativa es menor al 70%, EL Value_Chart DEBERÁ colorear la barra "Realidad" en rojo.
7. EL Value_Chart DEBERÁ obtener los datos de iniciativas desde el Data_Service utilizando la función existente `getInitiatives()`.
8. CUANDO un usuario posiciona el cursor sobre una barra en el Value_Chart, EL Value_Chart DEBERÁ mostrar un tooltip con el nombre de la iniciativa, el valor formateado como número entero en millones (COP), y el Fulfillment_Ratio mostrado como porcentaje redondeado a un decimal.
9. SI el Data_Service retorna un arreglo de iniciativas vacío, ENTONCES EL Value_Chart DEBERÁ mostrar un mensaje indicando que no hay datos de iniciativas disponibles en lugar de renderizar un gráfico vacío.
10. SI una iniciativa tiene un projectedValue de cero, ENTONCES EL Value_Chart DEBERÁ tratar su Fulfillment_Ratio como 0% y colorear la barra "Realidad" en rojo.

### Requirement 2: Índice de Alineación Estratégica

**User Story:** Como líder de estrategia corporativa, quiero visualizar qué porcentaje del esfuerzo técnico está alineado con los OKRs de negocio, para asegurar que la inversión tecnológica responde a las prioridades estratégicas.

#### Acceptance Criteria

1. CUANDO el Negocio_Module se carga, EL Alignment_Chart DEBERÁ renderizar un gráfico de dona mostrando exactamente dos segmentos: "Esfuerzo alineado a OKRs" (para iniciativas con estado "completada" o "en_progreso") y "Esfuerzo no alineado" (para iniciativas con estado "en_riesgo").
2. CUANDO el Alignment_Chart se renderiza, EL Alignment_Chart DEBERÁ mostrar el porcentaje del Strategic_Alignment_Index como una etiqueta centrada dentro de la dona, formateado como un valor entero seguido del símbolo "%" (por ejemplo, "75%"), redondeado al entero más cercano.
3. CUANDO el Alignment_Chart se renderiza, EL Alignment_Chart DEBERÁ usar el color primario del sistema de diseño (variable CSS --sb-ui-color-primary-base) para el segmento alineado y un color gris para el segmento no alineado, asegurando una relación de contraste mínima de 3:1 entre los dos segmentos.
4. CUANDO el Negocio_Module se carga, EL Alignment_Chart DEBERÁ calcular el Strategic_Alignment_Index como: (suma de projectedValue para iniciativas con estado "completada" o "en_progreso") dividido entre (suma de projectedValue para todas las iniciativas) multiplicado por 100.
5. CUANDO un usuario posiciona el cursor sobre un segmento en el Alignment_Chart, EL Alignment_Chart DEBERÁ mostrar un tooltip con la etiqueta del segmento y el valor de porcentaje formateado a un decimal (por ejemplo, "73.2%").
6. SI no existen iniciativas en el conjunto de datos, ENTONCES EL Alignment_Chart DEBERÁ mostrar el gráfico de dona con 0% de alineación y una etiqueta centrada mostrando "0%".

### Requirement 3: Formulario de Intake de Negocio

**User Story:** Como product owner, quiero registrar nuevas iniciativas de negocio con su KPI y valor esperado, para que el portafolio de inversión tecnológica se mantenga actualizado y visible.

#### Acceptance Criteria

1. EL Intake_Form DEBERÁ mostrar un formulario titulado "Registrar Nueva Iniciativa" dentro del Negocio_Module.
2. EL Intake_Form DEBERÁ incluir un campo de texto obligatorio etiquetado "Nombre de la Iniciativa" con una longitud mínima de 1 carácter no vacío y una longitud máxima de 100 caracteres.
3. EL Intake_Form DEBERÁ incluir un campo de texto obligatorio etiquetado "KPI Asociado" con una longitud mínima de 1 carácter no vacío y una longitud máxima de 150 caracteres.
4. EL Intake_Form DEBERÁ incluir un campo numérico obligatorio etiquetado "Valor Esperado (ROI)" que acepte únicamente valores numéricos positivos entre 0.01 y 999,999.99 (inclusivo), con hasta 2 decimales, representando millones de COP.
5. SI el usuario intenta enviar el Intake_Form con algún campo obligatorio vacío o que contenga solo espacios en blanco, ENTONCES EL Intake_Form DEBERÁ mostrar un mensaje de validación en línea debajo de cada campo inválido indicando que el campo es obligatorio.
6. SI el usuario ingresa un valor no numérico, negativo, cero, o un valor fuera del rango 0.01-999,999.99 en el campo "Valor Esperado (ROI)", ENTONCES EL Intake_Form DEBERÁ mostrar un mensaje de validación en línea indicando que el valor debe ser un número positivo dentro del rango permitido.
7. CUANDO el usuario completa todos los campos obligatorios con datos válidos y hace clic en el botón de envío, EL Intake_Form DEBERÁ mostrar un mensaje de confirmación de éxito usando un componente sb-ui-alert, y DEBERÁ restablecer todos los campos del formulario a su estado vacío por defecto.
8. EL Intake_Form DEBERÁ usar los componentes de entrada y clases del sistema de diseño sb-ui para un estilo consistente.

### Requirement 4: Layout y Organización del Módulo

**User Story:** Como usuario del módulo Negocio, quiero que las nuevas visualizaciones se integren de forma coherente con la vista existente, para tener una experiencia fluida y profesional.

#### Acceptance Criteria

1. EL Negocio_Module DEBERÁ renderizar el Value_Chart, el Alignment_Chart y el Intake_Form debajo de las tarjetas resumen y la tabla de iniciativas existentes, cada uno envuelto en un contenedor sb-ui-card--elevated para mantener el patrón visual existente.
2. EL Negocio_Module DEBERÁ organizar el Value_Chart y el Alignment_Chart lado a lado en dos columnas de igual ancho en viewports iguales o superiores al breakpoint md (768px), usando un layout de grilla responsivo.
3. CUANDO el ancho del viewport es menor al breakpoint md (768px), EL Negocio_Module DEBERÁ apilar el Value_Chart sobre el Alignment_Chart verticalmente, cada uno ocupando el ancho completo.
4. EL Negocio_Module DEBERÁ renderizar el Intake_Form en una sección de ancho completo debajo de los gráficos.
5. EL Negocio_Module DEBERÁ usar clases utilitarias de Tailwind CSS para el espaciado del layout y la responsividad, manteniendo un espacio vertical de 1.5rem (space-y-6) entre todas las secciones de nivel superior, consistente con el layout existente de la página.
6. EL Negocio_Module DEBERÁ usar una librería de gráficos compatible con React (recharts o react-chartjs-2) instalada con una versión exacta fijada.

### Requirement 5: Estilo Gerencial y Corporativo

**User Story:** Como ejecutivo, quiero que las visualizaciones tengan un estilo gerencial orientado a finanzas y estrategia, para que la información sea clara y profesional en presentaciones de directivos.

#### Acceptance Criteria

1. EL Value_Chart DEBERÁ mostrar las etiquetas del eje Y formateadas con el prefijo "$", separadores de miles (coma) y sufijo "M" para valores monetarios (por ejemplo, ",200M").
2. EL Alignment_Chart DEBERÁ mostrar la etiqueta centrada de la dona y los valores de porcentaje del tooltip con un decimal y el sufijo "%" (por ejemplo, "78.5%").
3. EL Negocio_Module DEBERÁ usar encabezados de sección estilizados con la clase sb-ui-heading-h6 para cada sección de visualización, con las siguientes etiquetas: "Valor Prometido vs. Realizado" para la sección del Value_Chart, "Alineación Estratégica" para la sección del Alignment_Chart, y "Registrar Nueva Iniciativa" para la sección del Intake_Form.
4. EL Negocio_Module DEBERÁ renderizar cada sección de visualización dentro de un componente de tarjeta sb-ui (`sb-ui-card sb-ui-card--elevated`) con un envolvente interno `sb-ui-card__content`.
5. EL Value_Chart y el Alignment_Chart DEBERÁN renderizar las etiquetas de ejes y datos con un tamaño de fuente mínimo de 12px para asegurar la legibilidad en presentaciones ejecutivas.