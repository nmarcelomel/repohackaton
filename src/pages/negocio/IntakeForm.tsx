import { useState, type FormEvent } from "react";
import { validateTextField, validateNumericField } from "./negocio-utils";

interface IntakeFormState {
  name: string;
  kpi: string;
  expectedValue: string;
}

interface ValidationErrors {
  name?: string;
  kpi?: string;
  expectedValue?: string;
}

const INITIAL_FORM_STATE: IntakeFormState = {
  name: "",
  kpi: "",
  expectedValue: "",
};

export function IntakeForm() {
  const [formState, setFormState] = useState<IntakeFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowSuccess(false);

    const newErrors: ValidationErrors = {};

    const nameError = validateTextField(formState.name, 100);
    if (nameError) {
      newErrors.name = nameError;
    }

    const kpiError = validateTextField(formState.kpi, 150);
    if (kpiError) {
      newErrors.kpi = kpiError;
    }

    const valueError = validateNumericField(formState.expectedValue);
    if (valueError) {
      newErrors.expectedValue = valueError;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setShowSuccess(true);
    setFormState(INITIAL_FORM_STATE);
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label className="sb-ui-label" htmlFor="intake-name">
            Nombre de la Iniciativa
          </label>
          <input
            id="intake-name"
            className="sb-ui-input"
            type="text"
            maxLength={100}
            value={formState.name}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="sb-ui-label" htmlFor="intake-kpi">
            KPI Asociado
          </label>
          <input
            id="intake-kpi"
            className="sb-ui-input"
            type="text"
            maxLength={150}
            value={formState.kpi}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, kpi: e.target.value }))
            }
          />
          {errors.kpi && (
            <p className="text-red-600 text-sm mt-1">{errors.kpi}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="sb-ui-label" htmlFor="intake-expected-value">
            Valor Esperado (ROI)
          </label>
          <input
            id="intake-expected-value"
            className="sb-ui-input"
            type="text"
            inputMode="decimal"
            value={formState.expectedValue}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, expectedValue: e.target.value }))
            }
          />
          {errors.expectedValue && (
            <p className="text-red-600 text-sm mt-1">{errors.expectedValue}</p>
          )}
        </div>
        <button type="submit" className="sb-ui-btn sb-ui-btn--primary">
          Registrar Iniciativa
        </button>
      </form>
      {showSuccess && (
        <div className="sb-ui-alert sb-ui-alert--success mt-4" role="alert">
          Iniciativa registrada exitosamente
        </div>
      )}
    </>
  );
}
