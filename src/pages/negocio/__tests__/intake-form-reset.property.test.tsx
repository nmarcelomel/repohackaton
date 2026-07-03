import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { render, screen, fireEvent } from "@testing-library/react";
import { IntakeForm } from "../IntakeForm";

/**
 * **Validates: Requirements 3.7**
 *
 * Property 7: Valid Form Submission Resets All Fields
 * For any combination of valid inputs (name: non-empty trimmed ≤100 chars,
 * kpi: non-empty trimmed ≤150 chars, value: positive number in range),
 * after successful submission, all form fields return to their default empty state.
 */
describe("Feature: negocio-value-realization, Property 7: Valid form submission resets all fields", () => {
  it("should reset all fields after valid submission", () => {
    fc.assert(
      fc.property(
        // Valid name: non-empty, trimmed, max 100 chars
        fc.string({ minLength: 1, maxLength: 100 }).filter(
          (s) => s.trim().length >= 1 && s.trim().length <= 100
        ),
        // Valid KPI: non-empty, trimmed, max 150 chars
        fc.string({ minLength: 1, maxLength: 150 }).filter(
          (s) => s.trim().length >= 1 && s.trim().length <= 150
        ),
        // Valid numeric value: 0.01-999999.99, max 2 decimals
        fc.integer({ min: 1, max: 99999999 }).map((n) => (n / 100).toFixed(2)),
        (name, kpi, value) => {
          const { unmount } = render(<IntakeForm />);

          const nameInput = screen.getByLabelText(
            "Nombre de la Iniciativa"
          ) as HTMLInputElement;
          const kpiInput = screen.getByLabelText(
            "KPI Asociado"
          ) as HTMLInputElement;
          const valueInput = screen.getByLabelText(
            "Valor Esperado (ROI)"
          ) as HTMLInputElement;
          const submitBtn = screen.getByRole("button", {
            name: /registrar/i,
          });

          fireEvent.change(nameInput, { target: { value: name } });
          fireEvent.change(kpiInput, { target: { value: kpi } });
          fireEvent.change(valueInput, { target: { value } });
          fireEvent.click(submitBtn);

          expect(nameInput.value).toBe("");
          expect(kpiInput.value).toBe("");
          expect(valueInput.value).toBe("");

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});
