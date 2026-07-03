import type { Initiative } from "../../types";

/**
 * Truncates a name to 20 characters with ellipsis if it exceeds the limit.
 * If name.length <= 20, returns name as-is.
 * If name.length > 20, returns first 19 chars + "…" (Unicode U+2026) = 20 total chars.
 */
export function truncateName(name: string): string {
  if (name.length <= 20) {
    return name;
  }
  return name.slice(0, 19) + "\u2026";
}

/**
 * Returns a hex color string based on the fulfillment ratio thresholds.
 * - projectedValue === 0 → red (#DC3545)
 * - ratio >= 90% → green (#00A651)
 * - 70% <= ratio < 90% → amber (#FFC107)
 * - ratio < 70% → red (#DC3545)
 */
export function getFulfillmentColor(projectedValue: number, actualValue: number): string {
  const RED = "#DC3545";
  const GREEN = "#00A651";
  const AMBER = "#FFC107";

  if (projectedValue === 0) {
    return RED;
  }

  const ratio = (actualValue / projectedValue) * 100;

  if (ratio >= 90) {
    return GREEN;
  }
  if (ratio >= 70) {
    return AMBER;
  }
  return RED;
}

/**
 * Calculates the Strategic Alignment Index as a percentage.
 * alignedValue = sum of projectedValue where status is "completada" or "en_progreso"
 * totalValue = sum of all projectedValue
 * If totalValue === 0, returns 0.
 * Returns (alignedValue / totalValue) * 100.
 */
export function calculateAlignmentIndex(initiatives: Initiative[]): number {
  const totalValue = initiatives.reduce((sum, i) => sum + i.projectedValue, 0);

  if (totalValue === 0) {
    return 0;
  }

  const alignedValue = initiatives
    .filter((i) => i.status === "completada" || i.status === "en_progreso")
    .reduce((sum, i) => sum + i.projectedValue, 0);

  return (alignedValue / totalValue) * 100;
}

/**
 * Validates a text field value.
 * Returns an error message string or null if valid.
 * - Empty or whitespace-only → "Este campo es obligatorio"
 * - Trimmed length > maxLen → "Máximo ${maxLen} caracteres"
 * - Otherwise → null (valid)
 */
export function validateTextField(value: string, maxLen: number): string | null {
  if (value.trim().length === 0) {
    return "Este campo es obligatorio";
  }
  if (value.trim().length > maxLen) {
    return `Máximo ${maxLen} caracteres`;
  }
  return null;
}

/**
 * Validates a numeric field value represented as a string.
 * Returns an error message string or null if valid.
 * - Not a valid number, <= 0, or > 999999.99 → range error message
 * - More than 2 decimal places → "Máximo 2 decimales permitidos"
 * - Otherwise → null (valid)
 */
export function validateNumericField(value: string): string | null {
  const RANGE_ERROR = "Ingrese un valor numérico positivo entre 0.01 y 999,999.99";

  const trimmed = value.trim();

  if (trimmed === "") {
    return RANGE_ERROR;
  }

  const num = Number(trimmed);

  if (isNaN(num) || !isFinite(num)) {
    return RANGE_ERROR;
  }

  if (num < 0.01 || num > 999999.99) {
    return RANGE_ERROR;
  }

  // Check decimal places
  const parts = trimmed.split(".");
  if (parts.length === 2 && parts[1].length > 2) {
    return "Máximo 2 decimales permitidos";
  }

  return null;
}

/**
 * Formats a number as currency in the format $X,XXXM.
 * Uses integer formatting with comma thousands separators.
 * Example: 1200 → "$1,200M", 500 → "$500M"
 */
export function formatCurrency(value: number): string {
  const intValue = Math.round(value);
  const formatted = intValue.toLocaleString("en-US");
  return `$${formatted}M`;
}
