import type { Initiative } from "../../types";

/** Tipo de insight según el estado de la iniciativa */
export type InsightType = "improvement" | "risk_prediction" | "success_summary";

/** Métrica individual dentro del insight */
export interface InsightMetric {
  label: string;
  value: string;
}

/** Resultado completo del engine de insights */
export interface InsightResult {
  type: InsightType;
  title: string;
  description: string;
  metrics: InsightMetric[];
  recommendation: string;
}

/** Mapeo de status a tipo de insight */
export const STATUS_TO_INSIGHT_TYPE: Record<Initiative["status"], InsightType> = {
  en_progreso: "improvement",
  en_riesgo: "risk_prediction",
  completada: "success_summary",
};

/**
 * Calcula el ratio de cumplimiento entre el valor real y el proyectado.
 * Retorna (actualValue / projectedValue) * 100 cuando projectedValue > 0.
 * Retorna 0 cuando projectedValue <= 0 o actualValue < 0 (defensive coding).
 */
export function calculateFulfillmentRatio(
  projectedValue: number,
  actualValue: number
): number {
  const safeProjected = projectedValue <= 0 ? 0 : projectedValue;
  const safeActual = actualValue < 0 ? 0 : actualValue;

  if (safeProjected === 0) {
    return 0;
  }

  return (safeActual / safeProjected) * 100;
}

/**
 * Función principal del InsightsEngine.
 * Genera un insight basado en el status de la iniciativa,
 * despachando a la función interna correspondiente.
 */
export function generateInsight(initiative: Initiative): InsightResult {
  const ratio = calculateFulfillmentRatio(
    initiative.projectedValue,
    initiative.actualValue
  );

  switch (initiative.status) {
    case "en_progreso":
      return generateInProgressInsight(initiative, ratio);
    case "en_riesgo":
      return generateAtRiskInsight(initiative, ratio);
    case "completada":
      return generateCompletedInsight(initiative, ratio);
  }
}

/**
 * Genera insight para iniciativas en progreso.
 * Aplica lógica de umbrales sobre el Fulfillment Ratio:
 * - projectedValue === 0: ratio no calculable
 * - ratio >= 90%: camino óptimo
 * - ratio >= 70% y < 90%: brecha moderada
 * - ratio < 70%: brecha significativa
 */
export function generateInProgressInsight(
  initiative: Initiative,
  ratio: number
): InsightResult {
  // Caso especial: projectedValue es 0 → no se puede calcular ratio
  if (initiative.projectedValue <= 0) {
    return {
      type: "improvement",
      title: "Mejora Continua",
      description:
        "No es posible calcular el ratio de cumplimiento debido a un valor proyectado no definido",
      metrics: [
        { label: "Cumplimiento actual:", value: "N/A" },
      ],
      recommendation:
        "Definir un valor proyectado para la iniciativa para poder calcular métricas de cumplimiento.",
    };
  }

  // Determinar descripción y recomendación según umbrales
  let description: string;
  let recommendation: string;

  if (ratio >= 90) {
    description = `La iniciativa "${initiative.name}" está en camino óptimo con un cumplimiento del ${ratio.toFixed(1)}% respecto al valor proyectado.`;
    recommendation =
      "Mantener el ritmo actual de ejecución y continuar monitoreando los indicadores de valor.";
  } else if (ratio >= 70) {
    description = `La iniciativa "${initiative.name}" presenta una brecha moderada con un cumplimiento del ${ratio.toFixed(1)}% respecto al valor proyectado.`;
    recommendation =
      "Revisar los impedimentos del equipo para acelerar la entrega de valor.";
  } else {
    description = `La iniciativa "${initiative.name}" presenta una brecha significativa con un cumplimiento del ${ratio.toFixed(1)}% respecto al valor proyectado.`;
    recommendation =
      "Realizar una revisión de alcance o repriorización de recursos para cerrar la brecha de valor.";
  }

  return {
    type: "improvement",
    title: "Mejora Continua",
    description,
    metrics: [
      { label: "Cumplimiento actual:", value: `${ratio.toFixed(1)}%` },
    ],
    recommendation,
  };
}

/**
 * Formatea la brecha de valor como string monetario.
 * Si gap >= 1000 (millones), muestra en miles de millones (e.g., "$1.5B de brecha").
 * Si gap < 1000, muestra en millones (e.g., "$900M de brecha").
 */
function formatValueGap(projectedValue: number, actualValue: number): string {
  const gap = projectedValue - actualValue;
  const safeGap = gap < 0 ? 0 : gap;

  if (safeGap >= 1000) {
    const billions = safeGap / 1000;
    const formatted = Number.isInteger(billions)
      ? billions.toString()
      : billions.toFixed(1);
    return `$${formatted}B de brecha`;
  }

  const formatted = Number.isInteger(safeGap)
    ? safeGap.toString()
    : safeGap.toFixed(1);
  return `$${formatted}M de brecha`;
}

/**
 * Genera insight para iniciativas en riesgo.
 * Aplica umbrales de diagnóstico según el Fulfillment Ratio:
 * - projectedValue === 0: datos insuficientes
 * - ratio < 50%: desviación crítica
 * - ratio 50%-69%: por debajo del objetivo
 * - ratio >= 70%: riesgo moderado (caso graceful)
 */
export function generateAtRiskInsight(
  initiative: Initiative,
  ratio: number
): InsightResult {
  // Caso especial: datos insuficientes para predicción
  if (initiative.projectedValue === 0) {
    return {
      type: "risk_prediction",
      title: "Predicción de Riesgo",
      description: "Datos insuficientes para predicción",
      metrics: [
        { label: "Cumplimiento actual:", value: `${ratio.toFixed(1)}%` },
      ],
      recommendation:
        "Solución recomendada: Actualizar los valores proyectados de la iniciativa para habilitar el análisis de riesgo.",
    };
  }

  const valueGap = formatValueGap(
    initiative.projectedValue,
    initiative.actualValue
  );

  const metrics: InsightMetric[] = [
    { label: "Cumplimiento actual:", value: `${ratio.toFixed(1)}%` },
    { label: "Brecha de valor:", value: valueGap },
  ];

  if (ratio < 50) {
    return {
      type: "risk_prediction",
      title: "Predicción de Riesgo",
      description: "Desviación crítica de valor",
      metrics,
      recommendation:
        "Solución recomendada: Programar sesión de revisión ejecutiva para redefinir objetivos o reasignar presupuesto.",
    };
  }

  if (ratio < 70) {
    return {
      type: "risk_prediction",
      title: "Predicción de Riesgo",
      description: "Entrega de valor por debajo del objetivo",
      metrics,
      recommendation:
        "Solución recomendada: Incrementar la frecuencia de seguimiento y asignar recursos de apoyo al equipo responsable.",
    };
  }

  // ratio >= 70: riesgo moderado (graceful handling para casos límite)
  return {
    type: "risk_prediction",
    title: "Predicción de Riesgo",
    description: "Riesgo moderado detectado",
    metrics,
    recommendation:
      "Solución recomendada: Monitorear de cerca el progreso y evaluar si se requieren ajustes preventivos.",
  };
}

/**
 * Genera insight para iniciativas completadas.
 * - actualValue >= projectedValue: expectativas superadas/alcanzadas
 * - actualValue < projectedValue: porcentaje alcanzado + lecciones aprendidas
 * - projectedValue === 0: muestra valor entregado sin ratio
 */
export function generateCompletedInsight(
  initiative: Initiative,
  ratio: number
): InsightResult {
  const { projectedValue, actualValue } = initiative;

  // Edge case: projectedValue is 0 — show delivered value without ratio
  if (projectedValue === 0) {
    return {
      type: "success_summary",
      title: "Resumen de Éxito",
      description: `La iniciativa "${initiative.name}" fue completada. No es posible calcular el ratio de cumplimiento debido a un valor proyectado no definido.`,
      metrics: [
        { label: "Valor entregado:", value: `$${actualValue}M` },
      ],
      recommendation: "Actualizar los valores proyectados para futuras mediciones de éxito.",
    };
  }

  // Success case: expectations met or exceeded
  if (actualValue >= projectedValue) {
    return {
      type: "success_summary",
      title: "Resumen de Éxito",
      description: `La iniciativa "${initiative.name}" superó las expectativas de valor proyectado.`,
      metrics: [
        { label: "Valor entregado:", value: `$${actualValue}M` },
        { label: "Cumplimiento actual:", value: `${ratio.toFixed(1)}%` },
      ],
      recommendation: "Reconocer el logro del equipo y replicar las prácticas exitosas en futuras iniciativas.",
    };
  }

  // Shortfall case: actualValue < projectedValue
  return {
    type: "success_summary",
    title: "Resumen de Éxito",
    description: `La iniciativa "${initiative.name}" alcanzó el ${ratio.toFixed(1)}% del valor proyectado. Se recomienda documentar las lecciones aprendidas.`,
    metrics: [
      { label: "Valor entregado:", value: `$${actualValue}M` },
      { label: "Cumplimiento actual:", value: `${ratio.toFixed(1)}%` },
    ],
    recommendation: "Documentar las lecciones aprendidas y los factores que impidieron alcanzar el valor proyectado.",
  };
}
