import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { InsightPopover } from "../InsightPopover";
import type { InsightResult } from "../insights-engine";

/**
 * Unit tests for InsightPopover component.
 * Validates: Requirements 1.5, 1.8, 6.1, 6.2, 6.3
 */

function createAnchorRef(): React.RefObject<HTMLElement> {
  const el = document.createElement("div");
  el.getBoundingClientRect = () => ({
    top: 100,
    left: 50,
    bottom: 130,
    right: 150,
    width: 100,
    height: 30,
    x: 50,
    y: 100,
    toJSON: () => ({}),
  });
  document.body.appendChild(el);
  const ref = { current: el } as React.RefObject<HTMLElement>;
  return ref;
}

const sampleInsight: InsightResult = {
  type: "improvement",
  title: "Mejora Continua",
  description: "La iniciativa está en camino óptimo.",
  metrics: [{ label: "Cumplimiento actual:", value: "92.5%" }],
  recommendation: "Mantener el ritmo actual de ejecución.",
};

describe("InsightPopover", () => {
  it("renders title, description, metrics, and recommendation when visible", () => {
    const anchorRef = createAnchorRef();

    render(
      <InsightPopover
        insight={sampleInsight}
        isVisible={true}
        anchorRef={anchorRef}
        popoverId="test-popover"
      />
    );

    expect(screen.getByText("Mejora Continua")).toBeInTheDocument();
    expect(
      screen.getByText("La iniciativa está en camino óptimo.")
    ).toBeInTheDocument();
    expect(screen.getByText("Cumplimiento actual:")).toBeInTheDocument();
    expect(screen.getByText("92.5%")).toBeInTheDocument();
    expect(
      screen.getByText("Mantener el ritmo actual de ejecución.")
    ).toBeInTheDocument();
  });

  it('has role="tooltip" attribute on the popover element', () => {
    const anchorRef = createAnchorRef();

    render(
      <InsightPopover
        insight={sampleInsight}
        isVisible={true}
        anchorRef={anchorRef}
        popoverId="test-popover"
      />
    );

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("returns null when isVisible is false (nothing rendered)", () => {
    const anchorRef = createAnchorRef();

    const { container } = render(
      <InsightPopover
        insight={sampleInsight}
        isVisible={false}
        anchorRef={anchorRef}
        popoverId="test-popover"
      />
    );

    expect(container.innerHTML).toBe("");
  });

  it('applies correct title color class for "improvement" type (primary color class)', () => {
    const anchorRef = createAnchorRef();
    const insight: InsightResult = { ...sampleInsight, type: "improvement" };

    render(
      <InsightPopover
        insight={insight}
        isVisible={true}
        anchorRef={anchorRef}
        popoverId="test-popover"
      />
    );

    const titleEl = screen.getByText("Mejora Continua");
    expect(titleEl.className).toContain(
      "text-[var(--sb-ui-color-primary-base,#1a73e8)]"
    );
  });

  it('applies correct title color class for "risk_prediction" type (error color class)', () => {
    const anchorRef = createAnchorRef();
    const insight: InsightResult = {
      ...sampleInsight,
      type: "risk_prediction",
      title: "Predicción de Riesgo",
    };

    render(
      <InsightPopover
        insight={insight}
        isVisible={true}
        anchorRef={anchorRef}
        popoverId="test-popover"
      />
    );

    const titleEl = screen.getByText("Predicción de Riesgo");
    expect(titleEl.className).toContain(
      "text-[var(--sb-ui-color-error-base,#dc2626)]"
    );
  });

  it('applies correct title color class for "success_summary" type (success color class)', () => {
    const anchorRef = createAnchorRef();
    const insight: InsightResult = {
      ...sampleInsight,
      type: "success_summary",
      title: "Resumen de Éxito",
    };

    render(
      <InsightPopover
        insight={insight}
        isVisible={true}
        anchorRef={anchorRef}
        popoverId="test-popover"
      />
    );

    const titleEl = screen.getByText("Resumen de Éxito");
    expect(titleEl.className).toContain(
      "text-[var(--sb-ui-color-success-base,#16a34a)]"
    );
  });

  it("container has max-w-[320px] class", () => {
    const anchorRef = createAnchorRef();

    render(
      <InsightPopover
        insight={sampleInsight}
        isVisible={true}
        anchorRef={anchorRef}
        popoverId="test-popover"
      />
    );

    const popover = screen.getByRole("tooltip");
    expect(popover.className).toContain("max-w-[320px]");
  });

  it("content area has max-h-[200px] overflow-y-auto classes", () => {
    const anchorRef = createAnchorRef();

    render(
      <InsightPopover
        insight={sampleInsight}
        isVisible={true}
        anchorRef={anchorRef}
        popoverId="test-popover"
      />
    );

    const popover = screen.getByRole("tooltip");
    // The scrollable content area is the div with max-h-[200px] and overflow-y-auto
    const scrollArea = popover.querySelector(".max-h-\\[200px\\]");
    expect(scrollArea).not.toBeNull();
    expect(scrollArea!.className).toContain("overflow-y-auto");
  });
});
