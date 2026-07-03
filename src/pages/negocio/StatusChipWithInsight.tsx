import { useRef, useState, useCallback } from "react";
import type { Initiative } from "../../types";
import type { InsightResult } from "./insights-engine";
import { generateInsight } from "./insights-engine";
import { InsightPopover } from "./InsightPopover";

interface StatusChipWithInsightProps {
  initiative: Initiative;
  chipClass: string;
  label: string;
}

/**
 * Wrapper interactivo que envuelve el chip de estado existente (sb-ui-chip)
 * y muestra un InsightPopover al hacer hover, focus o keyboard interaction.
 *
 * Comportamiento:
 * - mouseEnter: muestra popover tras 200ms
 * - mouseLeave: oculta popover tras 300ms
 * - Popover mouseEnter: cancela timer de cierre
 * - Popover mouseLeave: inicia 300ms para cerrar
 * - focus: muestra popover inmediatamente
 * - blur: oculta popover inmediatamente
 * - Escape: oculta popover inmediatamente
 * - try/catch en generateInsight — si falla, no muestra popover y loguea console.warn
 */
export function StatusChipWithInsight({
  initiative,
  chipClass,
  label,
}: StatusChipWithInsightProps): JSX.Element {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [insight, setInsight] = useState<InsightResult | null>(null);

  const popoverId = `insight-popover-${initiative.id}`;

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const showPopover = useCallback(() => {
    try {
      const result = generateInsight(initiative);
      setInsight(result);
      setIsVisible(true);
    } catch (error) {
      console.warn(
        "[StatusChipWithInsight] Error generating insight for initiative:",
        initiative.id,
        error
      );
    }
  }, [initiative]);

  const hidePopover = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimers();
    showTimerRef.current = setTimeout(() => {
      showPopover();
    }, 200);
  }, [clearTimers, showPopover]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    hideTimerRef.current = setTimeout(() => {
      hidePopover();
    }, 300);
  }, [clearTimers, hidePopover]);

  const handlePopoverMouseEnter = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const handlePopoverMouseLeave = useCallback(() => {
    hideTimerRef.current = setTimeout(() => {
      hidePopover();
    }, 300);
  }, [hidePopover]);

  const handleFocus = useCallback(() => {
    clearTimers();
    showPopover();
  }, [clearTimers, showPopover]);

  const handleBlur = useCallback(() => {
    clearTimers();
    hidePopover();
  }, [clearTimers, hidePopover]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        clearTimers();
        hidePopover();
      }
    },
    [clearTimers, hidePopover]
  );

  return (
    <span className="relative inline-block">
      <span
        ref={anchorRef}
        className={`sb-ui-chip ${chipClass}`}
        tabIndex={0}
        aria-describedby={isVisible ? popoverId : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        <span className="sb-ui-chip__label">{label}</span>
      </span>

      {isVisible && insight && (
        <div
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
        >
          <InsightPopover
            insight={insight}
            isVisible={isVisible}
            anchorRef={anchorRef as React.RefObject<HTMLElement>}
            popoverId={popoverId}
          />
        </div>
      )}
    </span>
  );
}
