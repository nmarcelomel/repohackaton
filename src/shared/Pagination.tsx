interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
      <button
        className={`sb-ui-button sb-ui-button--secondary sb-ui-button--stroke sb-ui-button--small${currentPage === 1 ? " sb-ui-button--disabled" : ""}`}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <i className="fa-solid fa-chevron-left" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`sb-ui-button sb-ui-button--small ${p === currentPage ? "sb-ui-button--primary sb-ui-button--fill" : "sb-ui-button--secondary sb-ui-button--stroke"}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className={`sb-ui-button sb-ui-button--secondary sb-ui-button--stroke sb-ui-button--small${currentPage === totalPages ? " sb-ui-button--disabled" : ""}`}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <i className="fa-solid fa-chevron-right" />
      </button>

      <span style={{ marginLeft: "0.75rem", fontSize: "0.8rem", color: "#666" }}>
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
}
