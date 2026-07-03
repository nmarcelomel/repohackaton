# Requirements Document

## Introduction

El Módulo Talento (/talento) es el acelerador de carrera y capacidades técnicas de la Engineering Intelligence Platform. Su propósito es impulsar el desarrollo de talento, la madurez técnica, el Skill Hacking y el reconocimiento dentro de la VP de TI. Con los datos del sistema, la plataforma identifica exactamente qué habilidades faltan por desarrollar, quiénes están liderando la vanguardia técnica, y promueve las comunidades TechMaster y TechLovers como vehículo de reconocimiento y crecimiento profesional. El módulo tiene un estilo gamificado e inspirador con leaderboards, badges, barras de progreso y celebraciones visuales que motivan la aceleración técnica.

## Glossary

- **Módulo_Talento**: Página principal del módulo de talento ubicada en la ruta /talento, enfocada en desarrollo de capacidades técnicas y reconocimiento.
- **Buscador_Expertos**: Componente de búsqueda que permite filtrar usuarios por nombre de tecnología o skill para conectar con expertos.
- **Tarjeta_Experto**: Componente visual tipo card que muestra la información de un usuario experto (nombre, rol, equipo, skills) con opción de solicitar mentoría.
- **Radar_Crecimiento**: Componente de gráfico de radar (spider chart) que compara niveles actuales vs. niveles deseados de skills del usuario actual.
- **Skill_Gap_Analysis**: Componente que analiza las brechas de habilidades a nivel organizacional, identificando skills más demandados y skills con gaps significativos.
- **Ranking_TechMaster**: Componente tipo leaderboard que muestra a los usuarios ordenados por su Índice de Madurez Técnica, identificando líderes de vanguardia.
- **Índice_Madurez_Técnica**: Valor numérico calculado como el promedio aritmético de los niveles de todos los skills de un usuario, representando su madurez técnica general.
- **Badge_TechMaster**: Insignia visual otorgada a usuarios que poseen al menos un skill con nivel 5, indicando dominio de vanguardia en al menos una tecnología.
- **Comunidad_TechMaster_TechLovers**: Tarjeta que representa una comunidad técnica de reconocimiento (TechMaster o TechLovers) con nombre, miembros y opción de unirse.
- **Usuario_Actual**: El primer usuario del array de datos mock, simulando al usuario autenticado.
- **Nivel_Deseado**: Valor objetivo de skill fijado en 5 (máximo) para la comparación en el gráfico de radar y el cálculo de brechas.
- **Efecto_Confeti**: Animación visual de celebración disparada mediante la librería canvas-confetti.
- **Mensaje_Éxito**: Notificación visual temporal que confirma una acción exitosa al usuario.
- **Skill_Demandado**: Skill que aparece en la lista de habilidades de 2 o más usuarios del mock data.
- **Gap_Skill**: Diferencia entre el Nivel_Deseado (5) y el nivel promedio de un skill entre todos los usuarios que lo poseen.
- **Badge_Equipo_TechMaster**: Insignia digital de reconocimiento otorgada a nivel de equipo (célula) cuando cumple criterios de excelencia en métricas DORA, representada visualmente como un badge dorado con icono de trofeo.
- **Nivel_Elite_DORA**: Clasificación de excelencia en métricas DORA definida como: deploymentFrequency >= 10 despliegues/semana, leadTimeForChanges <= 5 días, changeFailureRate <= 10%, y mttr <= 2 horas. El equipo debe cumplir los 4 umbrales simultáneamente.
- **Tech_Rewards**: Sección del Módulo_Talento que muestra insignias de reconocimiento a nivel de equipo basadas en el rendimiento de métricas DORA, promoviendo la madurez técnica colectiva de las comunidades TechMaster y TechLovers.
- **Previous_Lead_Time**: Valor simulado del Lead Time for Changes del trimestre anterior, almacenado en mock data como campo previousLeadTimeForChanges para calcular la mejora porcentual.

## Requirements

### Requirement 1: Búsqueda de expertos por tecnología

**User Story:** Como ingeniero, quiero buscar expertos por nombre de tecnología, para encontrar rápidamente a quién consultar sobre un tema específico y acelerar mi aprendizaje.

#### Acceptance Criteria

1. THE Módulo_Talento SHALL mostrar un campo de búsqueda con placeholder "Buscar experto por tecnología..." en la parte superior de la sección de expertos.
2. WHEN el usuario escribe al menos 1 carácter en el campo de búsqueda, THE Buscador_Expertos SHALL filtrar la lista en un máximo de 300ms tras la última pulsación de tecla, mostrando únicamente los usuarios que posean al menos un skill cuyo nombre contenga el texto ingresado como subcadena (sin distinción entre mayúsculas y minúsculas).
3. WHEN el campo de búsqueda está vacío, THE Buscador_Expertos SHALL mostrar todos los usuarios disponibles.
4. WHEN no existen usuarios que coincidan con el texto de búsqueda, THE Buscador_Expertos SHALL mostrar un mensaje indicando que no se encontraron expertos para el término buscado, en lugar de la lista de usuarios.
5. WHEN el Buscador_Expertos muestra resultados filtrados, THE Tarjeta_Experto SHALL presentar para cada usuario coincidente su nombre, rol, equipo al que pertenece, y los skills que coinciden con el término buscado junto con su nivel (1 a 5).
6. WHEN el usuario borra todo el texto del campo de búsqueda, THE Buscador_Expertos SHALL restablecer la lista completa de usuarios en un máximo de 300ms.

### Requirement 2: Visualización de tarjetas de expertos con solicitud de mentoría

**User Story:** Como ingeniero, quiero ver tarjetas con la información de los expertos y solicitar mentoría con una celebración visual, para sentir motivación al conectar con otros profesionales y acelerar mi desarrollo.

#### Acceptance Criteria

1. THE Tarjeta_Experto SHALL mostrar el nombre del usuario, su rol, el nombre de su equipo (resuelto mediante getTeamById) y la lista de skills con sus niveles, mostrando un máximo de 10 skills por tarjeta.
2. THE Tarjeta_Experto SHALL utilizar las clases CSS del sistema de diseño sb-ui (sb-ui-card, sb-ui-card--elevated para el contenedor y sb-ui-chip, sb-ui-chip--soft para cada skill) para mantener consistencia visual con la plataforma.
3. THE Tarjeta_Experto SHALL mostrar cada skill como un chip que incluya el nombre del skill y su nivel en formato "nombre (nivel/5)".
4. THE Módulo_Talento SHALL renderizar las tarjetas de expertos en una cuadrícula responsive utilizando utilidades de Tailwind CSS con 1 columna en pantallas menores a 640px, 2 columnas entre 640px y 1024px, y 3 columnas en pantallas de 1024px o más.
5. IF getTeamById no encuentra el equipo asociado al usuario, THEN THE Tarjeta_Experto SHALL mostrar el texto "Equipo no asignado" en lugar del nombre de equipo.
6. IF el usuario no tiene skills registrados, THEN THE Tarjeta_Experto SHALL mostrar un mensaje indicando que no hay skills registrados en el área destinada a los chips de skills.
7. THE Tarjeta_Experto SHALL incluir un botón con el texto "Solicitar Mentoría" en estado habilitado dentro de cada tarjeta de experto.
8. WHEN el usuario hace clic en el botón "Solicitar Mentoría", THE Módulo_Talento SHALL disparar una animación de confeti en la pantalla utilizando la librería canvas-confetti, visible durante al menos 2 segundos y no más de 4 segundos antes de desvanecerse.
9. WHEN el usuario hace clic en el botón "Solicitar Mentoría", THE Módulo_Talento SHALL mostrar un mensaje de éxito como notificación tipo toast indicando que la solicitud de mentoría fue enviada, visible durante 3 segundos antes de ocultarse automáticamente.
10. WHEN la solicitud de mentoría se envía exitosamente, THE Tarjeta_Experto SHALL cambiar el botón "Solicitar Mentoría" a un estado deshabilitado con el texto "Solicitud Enviada", impidiendo clics adicionales para el mismo experto durante la sesión activa.

### Requirement 3: Radar de crecimiento del usuario actual

**User Story:** Como ingeniero, quiero ver un gráfico de radar con mis skills actuales vs. el nivel deseado, para identificar mis áreas de mejora y enfocar mi Skill Hacking.

#### Acceptance Criteria

1. THE Radar_Crecimiento SHALL renderizar un gráfico de radar (spider chart) utilizando la librería Recharts dentro de un ResponsiveContainer con una altura mínima de 300px que se adapte al ancho del contenedor padre.
2. THE Radar_Crecimiento SHALL mostrar los skills del Usuario_Actual (primer usuario del array de usuarios en el mock data) como una serie "Nivel Actual" con los valores numéricos de nivel de cada skill.
3. THE Radar_Crecimiento SHALL mostrar una segunda serie "Nivel Deseado" con valor fijo de 5 para cada skill del Usuario_Actual.
4. THE Radar_Crecimiento SHALL incluir una leyenda que muestre el nombre de cada serie ("Nivel Actual" y "Nivel Deseado") junto a un indicador de color distinto para cada una, permitiendo al usuario identificar a qué serie corresponde cada área del gráfico.
5. THE Radar_Crecimiento SHALL mostrar el nombre del Usuario_Actual como título de la sección del gráfico.
6. THE Radar_Crecimiento SHALL utilizar un rango de ejes radiales de 0 a 5 (enteros) correspondiente a los niveles posibles de skill, y mostrar el nombre de cada skill como etiqueta en el eje angular correspondiente.
7. IF el Usuario_Actual no tiene skills registrados (array de skills vacío), THEN THE Radar_Crecimiento SHALL mostrar un mensaje indicando que no hay datos de skills disponibles en lugar del gráfico de radar.

### Requirement 4: Skill Gap Analysis (Mapa de Brechas)

**User Story:** Como líder de la VP de TI, quiero visualizar un análisis de brechas de habilidades que identifique qué skills son más demandados y cuáles tienen mayor gap respecto al nivel deseado, para saber exactamente qué capacidades faltan por desarrollar en la organización.

#### Acceptance Criteria

1. THE Skill_Gap_Analysis SHALL mostrar una sección titulada "Mapa de Brechas" con un icono de lucide-react (Target o TrendingUp) alineado a la izquierda del título.
2. THE Skill_Gap_Analysis SHALL analizar todos los skills de todos los usuarios del mock data y generar una lista de skills únicos con las siguientes métricas calculadas: cantidad de usuarios que poseen el skill (demanda) y nivel promedio del skill entre los usuarios que lo poseen.
3. THE Skill_Gap_Analysis SHALL mostrar una subsección "Skills más demandados" que presente los skills ordenados de mayor a menor cantidad de usuarios que los poseen, mostrando una barra de progreso para cada skill donde el ancho de la barra sea proporcional a la cantidad de usuarios que lo poseen respecto al total de usuarios (9).
4. THE Skill_Gap_Analysis SHALL mostrar una subsección "Skills con mayor brecha" que presente los skills ordenados de mayor a menor gap (diferencia entre 5 y el nivel promedio), mostrando una barra de progreso para cada skill donde el ancho represente el nivel promedio actual sobre 5, y un indicador visual del gap restante.
5. THE Skill_Gap_Analysis SHALL mostrar para cada skill en ambas subsecciones: el nombre del skill, el valor numérico de la métrica correspondiente (cantidad de usuarios o nivel promedio con 1 decimal), y un indicador visual gamificado (barra de progreso con color diferenciado según el nivel: verde para promedio >= 4, amarillo/ámbar para promedio >= 3, rojo para promedio < 3).
6. THE Skill_Gap_Analysis SHALL utilizar clases CSS del sistema de diseño sb-ui (sb-ui-card, sb-ui-card--elevated) para el contenedor principal y clases de Tailwind CSS para las barras de progreso y layouts internos.
7. IF no existen skills en los datos del mock, THEN THE Skill_Gap_Analysis SHALL mostrar un mensaje indicando que no hay datos de skills disponibles para analizar.

### Requirement 5: Ranking TechMaster (Líderes de Vanguardia)

**User Story:** Como miembro de la VP de TI, quiero ver un ranking de los líderes de vanguardia técnica ordenados por su Índice de Madurez Técnica, para identificar quiénes están liderando la excelencia técnica y motivarme a crecer.

#### Acceptance Criteria

1. THE Ranking_TechMaster SHALL mostrar una sección titulada "Ranking TechMaster" con un icono de lucide-react (Trophy o Crown) alineado a la izquierda del título y un subtítulo "Líderes de Vanguardia Técnica".
2. THE Ranking_TechMaster SHALL calcular el Índice_Madurez_Técnica de cada usuario como el promedio aritmético de los niveles de todos sus skills, redondeado a 1 decimal.
3. THE Ranking_TechMaster SHALL mostrar a todos los usuarios ordenados de mayor a menor Índice_Madurez_Técnica en un formato de leaderboard/podio gamificado.
4. THE Ranking_TechMaster SHALL mostrar para cada usuario en el ranking: posición numérica (1, 2, 3...), un avatar representado por un icono de lucide-react (User o UserCircle) con un indicador de color diferenciado para las 3 primeras posiciones (oro, plata, bronce), nombre del usuario, rol del usuario, y el Índice_Madurez_Técnica con formato "X.X / 5.0".
5. WHEN un usuario posee al menos un skill con nivel 5, THE Ranking_TechMaster SHALL mostrar un Badge_TechMaster junto a su nombre, representado como un chip o insignia con el texto "TechMaster" y un icono de lucide-react (Award o Star) con estilo visual destacado (color dorado o gradiente).
6. THE Ranking_TechMaster SHALL destacar visualmente las 3 primeras posiciones con un estilo tipo podio utilizando un fondo diferenciado o borde de color (oro para la posición 1, plata para la posición 2, bronce para la posición 3).
7. THE Ranking_TechMaster SHALL utilizar clases CSS del sistema de diseño sb-ui (sb-ui-card, sb-ui-card--elevated) para el contenedor y Tailwind CSS para el layout tipo lista del leaderboard.
8. IF dos o más usuarios tienen el mismo Índice_Madurez_Técnica, THEN THE Ranking_TechMaster SHALL asignarles la misma posición en el ranking y ordenarlos alfabéticamente por nombre.
9. IF un usuario no tiene skills registrados, THEN THE Ranking_TechMaster SHALL asignarle un Índice_Madurez_Técnica de 0 y posicionarlo al final del ranking.

### Requirement 6: Comunidades TechMaster y TechLovers

**User Story:** Como ingeniero, quiero ver comunidades TechMaster y TechLovers disponibles y unirme a ellas, para conectar con colegas que lideran la vanguardia técnica y obtener reconocimiento por mis intereses tecnológicos.

#### Acceptance Criteria

1. THE Módulo_Talento SHALL mostrar una sección titulada "Comunidades TechMaster & TechLovers" con un icono de lucide-react (Users o Sparkles) alineado a la izquierda del título, con exactamente 3 tarjetas dispuestas en una fila responsiva (columnas en pantallas >= 768px, apiladas verticalmente en pantallas < 768px).
2. THE Comunidad_TechMaster_TechLovers SHALL mostrar en cada tarjeta: el nombre de la comunidad, la cantidad de miembros con el formato "{número} miembros" (valores: 128, 95, 64 respectivamente), y un botón con texto "Unirme" en estado habilitado como estado inicial al cargar la página.
3. THE Módulo_Talento SHALL incluir las comunidades en el siguiente orden: "TechLovers AI" (128 miembros), "TechMaster Frontend" (95 miembros) y "TechLovers Cloud" (64 miembros).
4. WHEN el usuario hace clic en el botón "Unirme" de una Comunidad_TechMaster_TechLovers, THE Módulo_Talento SHALL cambiar el texto del botón a "Miembro ✓", deshabilitar el botón para esa comunidad, y mantener las demás tarjetas sin cambios.
5. THE Comunidad_TechMaster_TechLovers SHALL utilizar las clases CSS sb-ui-card y sb-ui-card--elevated del sistema de diseño sb-ui para cada tarjeta de comunidad, con un estilo visual que diferencie comunidades TechMaster (borde o acento dorado) de comunidades TechLovers (borde o acento azul/púrpura).
6. WHEN el usuario navega fuera de la sección Talento y regresa, THE Módulo_Talento SHALL mostrar todos los botones de comunidad en su estado inicial "Unirme" habilitado (el estado de membresía no persiste entre navegaciones).
7. IF el usuario hace clic en un botón que ya se encuentra en estado "Miembro ✓", THEN THE Módulo_Talento SHALL mantener el botón deshabilitado sin ejecutar ninguna acción adicional.

### Requirement 7: Estructura y estilo general del módulo

**User Story:** Como usuario de la plataforma, quiero que el módulo de talento tenga un diseño gamificado e inspirador enfocado en aceleración de carrera y reconocimiento técnico, para sentirme motivado a desarrollar mis habilidades y alcanzar la excelencia.

#### Acceptance Criteria

1. THE Módulo_Talento SHALL organizar su contenido en seis secciones verticales, cada una dentro de un contenedor tipo card: Buscador de Expertos (superior), Radar de Crecimiento (segundo), Skill Gap Analysis - Mapa de Brechas (tercero), Ranking TechMaster (cuarto), Tech Rewards (quinto) y Comunidades TechMaster & TechLovers (inferior).
2. THE Módulo_Talento SHALL utilizar iconos de la librería lucide-react posicionados a la izquierda del texto de título de cada sección, alineados horizontalmente con un espaciado de 8px entre icono y texto.
3. THE Módulo_Talento SHALL ser completamente funcional sin conexión a un backend real, renderizando datos del archivo mock-data.json a través de data-service.ts, de manera que las seis secciones muestren contenido sin errores de ejecución en consola del navegador.
4. WHILE la ventana del navegador tiene un ancho de 1024px o superior, THE Módulo_Talento SHALL mostrar las seis secciones en disposición vertical de ancho completo sin desbordamiento horizontal. WHILE la ventana del navegador tiene un ancho entre 768px y 1023px, THE Módulo_Talento SHALL reorganizar el contenido interno de cada sección en una sola columna sin requerir scroll horizontal.
5. THE Módulo_Talento SHALL incluir al menos un elemento visual gamificado por sección, consistente en: barras de progreso con colores diferenciados por nivel, badges de reconocimiento (Badge_TechMaster), posiciones de podio con indicadores oro/plata/bronce, chips de categoría con estilos diferenciados, indicadores de progreso numéricos (niveles de skill representados como "4/5"), o iconos celebratorios de lucide-react asociados a logros técnicos.
6. THE Módulo_Talento SHALL utilizar una paleta de colores inspiradora que refuerce el concepto de aceleración de carrera: dorado para logros TechMaster, gradientes para posiciones de podio, y colores vibrantes para barras de progreso y badges de reconocimiento.


### Requirement 8: Reconocimiento y Madurez Técnica (Tech Rewards)

**User Story:** Como Líder de Métodos y Formas de Trabajo, quiero implementar un Módulo de Reconocimiento y Madurez Técnica (Tech Rewards), para visibilizar y promover el crecimiento de las comunidades TechMaster y TechLovers dentro de la VP de TI.

#### Acceptance Criteria

1. THE Módulo_Talento SHALL mostrar una sección titulada "Tech Rewards" con un icono de lucide-react (Award o Medal) alineado a la izquierda del título y un subtítulo "Reconocimiento y Madurez Técnica por Equipos".
2. WHEN una célula logra una mejora del 20% o más en su Lead Time for Changes comparando el valor actual (leadTimeForChanges, en días) contra el valor del trimestre anterior (previousLeadTimeForChanges, en días), THE Tech_Rewards SHALL otorgar automáticamente la Badge_Equipo_TechMaster a dicha célula, calculando la mejora como: ((previousLeadTimeForChanges - leadTimeForChanges) / previousLeadTimeForChanges) * 100 >= 20.
3. WHEN una célula mantiene un Nivel_Elite_DORA (deploymentFrequency >= 10 despliegues por semana, leadTimeForChanges <= 5 días, changeFailureRate <= 10%, mttr <= 2 horas) según los valores actuales en los datos mock, THE Tech_Rewards SHALL otorgar automáticamente la Badge_Equipo_TechMaster a dicha célula independientemente del criterio de mejora del 20%.
4. THE Tech_Rewards SHALL mostrar para cada equipo del mock data: el nombre del equipo, sus métricas DORA actuales (deploymentFrequency en despliegues/semana, leadTimeForChanges en días, changeFailureRate en porcentaje, mttr en horas), el valor previousLeadTimeForChanges en días, el porcentaje de mejora calculado en Lead Time, y la Badge_Equipo_TechMaster si corresponde según los criterios definidos.
5. THE Tech_Rewards SHALL representar la Badge_Equipo_TechMaster como una insignia dorada prominente con un icono de trofeo (Trophy de lucide-react), texto "Equipo TechMaster", borde dorado de al menos 2px, y un fondo con gradiente dorado que la distinga visualmente de las tarjetas sin badge.
6. THE Tech_Rewards SHALL mostrar para cada equipo un indicador visual del nivel DORA de cada métrica individual: verde y etiqueta "Elite" si cumple el umbral elite (deploymentFrequency >= 10, leadTimeForChanges <= 5, changeFailureRate <= 10, mttr <= 2); amarillo y etiqueta "Alto" si el valor está dentro del 20% del umbral elite sin cumplirlo (deploymentFrequency >= 8, leadTimeForChanges <= 6, changeFailureRate <= 12, mttr <= 2.4); rojo y etiqueta "Necesita mejora" si no alcanza el nivel "Alto".
7. THE Tech_Rewards SHALL diferenciar visualmente las insignias a nivel de equipo (Badge_Equipo_TechMaster) de las insignias individuales (Badge_TechMaster del Requirement 5) mediante un icono de equipo (Users de lucide-react) junto al trofeo y un tamaño de insignia mayor (al menos 1.5x el tamaño de la insignia individual).
8. THE Tech_Rewards SHALL renderizar las tarjetas de equipo en una cuadrícula responsive utilizando Tailwind CSS con 1 columna en pantallas menores a 768px y 3 columnas en pantallas de 768px o más.
9. THE Tech_Rewards SHALL utilizar clases CSS del sistema de diseño sb-ui (sb-ui-card, sb-ui-card--elevated) para cada tarjeta de equipo y Tailwind CSS para los layouts internos y barras de métricas.
10. THE Tech_Rewards SHALL ser completamente funcional con datos simulados del archivo mock-data.json, utilizando el campo previousLeadTimeForChanges de cada equipo para el cálculo de mejora sin requerir conexión a backend.
11. IF un equipo no posee el campo previousLeadTimeForChanges en los datos mock, THEN THE Tech_Rewards SHALL mostrar el texto "Sin datos históricos" en lugar del porcentaje de mejora y no otorgar la Badge_Equipo_TechMaster por criterio de mejora del 20% (solo podrá obtenerla por criterio de Nivel_Elite_DORA).
12. IF un equipo no cumple ninguno de los dos criterios para la Badge_Equipo_TechMaster, THEN THE Tech_Rewards SHALL mostrar un indicador de progreso hacia la insignia con el texto "En camino a TechMaster" y una barra de progreso que refleje el porcentaje de métricas que cumplen el umbral elite (0%, 25%, 50%, 75% o 100% basado en las 4 métricas DORA).
13. THE Tech_Rewards SHALL ordenar las tarjetas de equipo mostrando primero los equipos que poseen la Badge_Equipo_TechMaster, seguidos por los equipos sin badge ordenados de mayor a menor porcentaje de progreso hacia la insignia.
