import { useRef, useEffect, useState, useCallback } from "react";
import type { InsightResult, InsightType } from "./insights-engine";

interface InsightPopoverProps {
  insight: InsightResult;
  isVisible: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  popoverId: string;
}

/**
 * Hook que calcula la posición del popover relativo al anchor,
 * eligiendo top o bottom según espacio disponible en el viewport.
 */
function usePopoverPosition(
  anchorRef: React.RefObject<HTMLElement>,
  popoverRef: React.RefObject<HTMLElement>,
  isVisible: boolean
): { top: number; left: number; placement: "top" | "bottom" } {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  }>({ top: 0, left: 0, placement: "bottom" });

  const calculate = useCallback(() => {
    if (!isVisible || !anchorRef.current || !popoverRef.current) {
      return;
    }

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;
    const popoverHeight = popoverRect.height || 150;
    const gap = 8;

    let placement: "top" | "bottom";
    let top: number;

    if (spaceBelow >= popoverHeight + gap) {
      placement = "bottom";
      top = anchorRect.height + gap;
    } else if (spaceAbove >= popoverHeight + gap) {
      placement = "top";
      top = -(popoverHeight + gap);
    } else {
      placement = spaceBelow >= spaceAbove ? "bottom" : "top";
      top =
        placement === "bottom"
          ? anchorRect.height + gap
          : -(popoverHeight + gap);
    }

    const left = anchorRect.width / 2 - Math.min(popoverRect.width, 320) / 2;

    setPosition({ top, left, placement });
  }, [isVisible, anchorRef, popoverRef]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  useEffect(() => {
    if (!isVisible) return;

    window.addEventListener("resize", calculate);
    window.addEventListener("scroll", calculate, true);

    return () => {
      window.removeEventListener("resize", calculate);
      window.removeEventListener("scroll", calculate, true);
    };
  }, [isVisible, calculate]);

  return position;
}

/** Mapeo de tipo de insight a clase de color del título */
const TITLE_COLOR_CLASS: Record<InsightType, string> = {
  improvement: "text-[var(--sb-ui-color-primary-base,#1a73e8)]",
  risk_prediction: "text-[var(--sb-ui-color-error-base,#dc2626)]",
  success_summary: "text-[var(--sb-ui-color-success-base,#16a34a)]",
};

/**
 * Componente InsightPopover — muestra un popover con contenido de insights
 * posicionado adyacente al chip de estado.
 */
export function InsightPopover({
  insight,
  isVisible,
  anchorRef,
  popoverId,
}: InsightPopoverProps): JSX.Element | null {
  const popoverRef = useRef<HTMLDivElement>(null);

  const { top, left, placement } = usePopoverPosition(
    anchorRef,
    popoverRef,
    isVisible
  );

  if (!isVisible) {
    return null;
  }

  const titleColorClass = TITLE_COLOR_CLASS[insight.type];

  return (
    <div
      ref={popoverRef}
      id={popoverId}
      role="tooltip"
      className="absolute z-50 max-w-[320px] rounded-lg bg-white shadow-lg border border-gray-100"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      {/* Flecha apuntando al chip */}
      {placement === "bottom" && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white"
          aria-hidden="true"
        />
      )}

      <div className="p-3 flex flex-col gap-2">
        {/* Título */}
        <p
          className={`text-xs font-bold leading-relaxed ${titleColorClass}`}
        >
          {insight.title}
        </p>

        {/* Descripción y métricas con scroll si exceden 200px */}
        <div className="max-h-[200px] overflow-y-auto flex flex-col gap-2">
          {/* Descripción */}
          <p className="text-xs leading-relaxed text-gray-700">
            {insight.description}
          </p>

          {/* Métricas */}
          {insight.metrics.length > 0 && (
            <div className="flex flex-col gap-1">
              {insight.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex justify-between text-xs leading-relaxed"
                >
                  <span className="text-gray-500">{metric.label}</span>
                  <span className="font-medium text-gray-900">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Recomendación */}
          <p className="text-xs leading-relaxed text-gray-600 border-t border-gray-100 pt-2">
            {insight.recommendation}
          </p>
        </div>
      </div>

      {/* Flecha inferior */}
      {placement === "top" && (
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
