interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={onCancel}
    >
      <article
        className="sb-ui-card sb-ui-card--elevated"
        style={{ maxWidth: "420px", width: "90%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sb-ui-card__content" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>{title}</h3>
          <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "1.5rem" }}>{message}</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button
              className="sb-ui-button sb-ui-button--secondary sb-ui-button--stroke"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              className="sb-ui-button sb-ui-button--error sb-ui-button--fill"
              onClick={onConfirm}
            >
              Confirmar
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
