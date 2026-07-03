import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../shared/AuthContext";

const routeTitles: Record<string, string> = {
  "/bienestar": "Bienestar de Equipos",
  "/talento": "Gestión del Talento",
  "/flujo": "Métricas de Flujo",
  "/negocio": "Impacto de Negocio",
};

export function Topbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const title = routeTitles[location.pathname] || "Dashboard";

  const initials = user
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <header className="h-16 bg-white border-b border-bolivar-gray-light flex items-center justify-between px-8 shadow-sm">
      <h1 className="text-lg font-bold text-bolivar-gray-text">{title}</h1>
      <div className="flex items-center gap-4">
        <button
          className="sb-ui-button sb-ui-button--tertiary sb-ui-button--text sb-ui-button--icon-only"
          aria-label="Notificaciones"
          style={{ position: "relative" }}
        >
          <Bell className="w-5 h-5" />
          <span className="sb-ui-badge sb-ui-badge--error sb-ui-badge--dot sb-ui-badge--positioned" />
        </button>

        {user && (
          <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#333" }}>
            {user.name}
          </span>
        )}

        <div className="sb-ui-avatar sb-ui-avatar--sm sb-ui-avatar--circle">
          <span className="text-xs font-bold">{initials}</span>
        </div>

        {user && (
          <button
            className="sb-ui-button sb-ui-button--secondary sb-ui-button--stroke sb-ui-button--small sb-ui-button--icon-left"
            onClick={logout}
          >
            <i className="fa-solid fa-right-from-bracket" />
            Salir
          </button>
        )}
      </div>
    </header>
  );
}
