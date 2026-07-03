import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BienestarPage } from "../BienestarPage";

/**
 * Tests de renderizado y de interacción para BienestarPage.
 * Patrón: Given / When / Then (Arrange / Act / Assert).
 * Requisitos validados: 1.1, 1.2, 1.3, 1.5, 2.5, 7.1
 */

describe("BienestarPage — Renderizado de componentes (Task 6.2)", () => {
  it("renderiza sin errores", () => {
    // Given / When
    const { container } = render(<BienestarPage />);

    // Then
    expect(container).toBeInTheDocument();
  });

  it("muestra la sección Niko-Niko con el selector de ánimo", () => {
    // Given / When
    render(<BienestarPage />);

    // Then
    expect(screen.getByText("¿Cómo te sientes hoy?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Me siento genial" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Normal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agotado" })).toBeInTheDocument();
  });

  it("muestra la sección Índice de Sostenibilidad", () => {
    // Given / When
    render(<BienestarPage />);

    // Then
    expect(screen.getByText("Índice de Sostenibilidad")).toBeInTheDocument();
  });

  it("muestra la sección Radar de Burnout", () => {
    // Given / When
    render(<BienestarPage />);

    // Then
    expect(screen.getByText("Radar de Burnout")).toBeInTheDocument();
  });

  it("muestra la sección Muro de Kudos", () => {
    // Given / When
    render(<BienestarPage />);

    // Then
    expect(screen.getByText("Muro de Kudos")).toBeInTheDocument();
  });

  it('usa role="alert" en las alertas de burnout para accesibilidad', () => {
    // Given / When — mock-data has team-siniestros at burnout risk (wipCurrent:7 > wipLimit:5, avgMood < 3)
    render(<BienestarPage />);

    // Then
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0]).toHaveTextContent("Riesgo Alto de Burnout");
  });
});

describe("BienestarPage — Interacción del Niko-Niko (Task 6.3)", () => {
  it("muestra mensaje de confirmación al hacer clic en una opción de ánimo", () => {
    // Given
    render(<BienestarPage />);
    const moodButton = screen.getByRole("button", { name: "Me siento genial" });

    // When
    fireEvent.click(moodButton);

    // Then
    expect(
      screen.getByText("¡Gracias por compartir! Tu bienestar nos importa 💚")
    ).toBeInTheDocument();
  });

  it("permite cambiar la selección sin recargar — la opción previa deja de estar resaltada", () => {
    // Given
    render(<BienestarPage />);
    const genialButton = screen.getByRole("button", { name: "Me siento genial" });
    const normalButton = screen.getByRole("button", { name: "Normal" });

    // When — select first option
    fireEvent.click(genialButton);

    // Then — first option is highlighted
    expect(genialButton.className).toContain("ring-2");
    expect(normalButton.className).not.toContain("ring-2");

    // When — change selection to another option
    fireEvent.click(normalButton);

    // Then — new option is highlighted, previous one is not
    expect(normalButton.className).toContain("ring-2");
    expect(genialButton.className).not.toContain("ring-2");

    // Confirmation message is still visible
    expect(
      screen.getByText("¡Gracias por compartir! Tu bienestar nos importa 💚")
    ).toBeInTheDocument();
  });
});
