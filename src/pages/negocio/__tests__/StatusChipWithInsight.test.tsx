import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { Initiative } from "../../../types";
import { StatusChipWithInsight } from "../StatusChipWithInsight";

const sampleInitiative: Initiative = {
  id: "test-1",
  name: "Test Initiative",
  teamId: "team-1",
  projectedValue: 1000,
  actualValue: 850,
  status: "en_progreso",
};

/**
 * Helper to get the chip element (the one with tabIndex and event handlers).
 * The chip renders a sb-ui-chip class span; we target it via the tabindex attribute.
 */
function getChipElement(): HTMLElement {
  // The chip is the element with tabIndex=0 and sb-ui-chip class
  const chip = document.querySelector('[tabindex="0"]') as HTMLElement;
  return chip;
}

describe("StatusChipWithInsight", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows popover on hover after 200ms delay", () => {
    render(
      <StatusChipWithInsight
        initiative={sampleInitiative}
        chipClass="sb-ui-chip--primary"
        label="En progreso"
      />
    );

    const chip = getChipElement();
    fireEvent.mouseEnter(chip);

    // Popover should NOT be visible yet
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    // Advance timers by 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Now the popover should be visible
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("hides popover on mouseLeave after 300ms delay", () => {
    render(
      <StatusChipWithInsight
        initiative={sampleInitiative}
        chipClass="sb-ui-chip--primary"
        label="En progreso"
      />
    );

    const chip = getChipElement();

    // Show the popover first
    fireEvent.mouseEnter(chip);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Mouse leave
    fireEvent.mouseLeave(chip);

    // Popover should still be visible before 300ms
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Advance timers by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Popover should be gone
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows popover on focus", () => {
    render(
      <StatusChipWithInsight
        initiative={sampleInitiative}
        chipClass="sb-ui-chip--primary"
        label="En progreso"
      />
    );

    const chip = getChipElement();
    fireEvent.focus(chip);

    // Popover should appear immediately on focus (no timer)
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("hides popover on Escape key", () => {
    render(
      <StatusChipWithInsight
        initiative={sampleInitiative}
        chipClass="sb-ui-chip--primary"
        label="En progreso"
      />
    );

    const chip = getChipElement();

    // Show popover via focus
    fireEvent.focus(chip);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(chip, { key: "Escape" });

    // Popover should close immediately
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("has aria-describedby referencing popover when visible", () => {
    render(
      <StatusChipWithInsight
        initiative={sampleInitiative}
        chipClass="sb-ui-chip--primary"
        label="En progreso"
      />
    );

    const chip = getChipElement();

    // Before showing popover, aria-describedby should not be set
    expect(chip).not.toHaveAttribute("aria-describedby");

    // Show popover
    fireEvent.focus(chip);

    // aria-describedby should reference the popover id
    expect(chip).toHaveAttribute(
      "aria-describedby",
      "insight-popover-test-1"
    );

    // Popover id should match
    const popover = screen.getByRole("tooltip");
    expect(popover).toHaveAttribute("id", "insight-popover-test-1");
  });

  it("does not crash when generateInsight throws", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Use dynamic import + spyOn to mock generateInsight for this test only
    const insightsEngine = await import("../insights-engine");
    const generateInsightSpy = vi
      .spyOn(insightsEngine, "generateInsight")
      .mockImplementation(() => {
        throw new Error("Test error");
      });

    render(
      <StatusChipWithInsight
        initiative={sampleInitiative}
        chipClass="sb-ui-chip--primary"
        label="En progreso"
      />
    );

    const chip = getChipElement();

    // Trigger hover + advance timer
    fireEvent.mouseEnter(chip);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Component should not crash — chip should still be rendered
    expect(chip).toBeInTheDocument();

    // Popover should NOT appear since generateInsight threw
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    // console.warn should have been called
    expect(warnSpy).toHaveBeenCalled();

    generateInsightSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
