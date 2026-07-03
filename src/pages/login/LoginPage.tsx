import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/AuthContext";
import { setAuthToken } from "../../data/api-client";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      setAuthToken(localStorage.getItem("auth_token"));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
      <div style={{ width: "100%", maxWidth: "420px", padding: "0 1rem" }}>
        <article className="sb-ui-card sb-ui-card--elevated">
          <div className="sb-ui-card__content" style={{ padding: "2.5rem 2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: "#009056", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem" }}>EI</span>
              </div>
              <h1 className="sb-ui-heading-h4" style={{ marginBottom: "0.25rem" }}>Engineering Intelligence</h1>
              <p style={{ fontSize: "0.875rem", color: "#666" }}>Inicia sesión para continuar</p>
            </div>

            {error && (
              <div className="sb-ui-alert sb-ui-alert--error" style={{ marginBottom: "1rem" }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="sb-ui-input-container">
                <label className="sb-ui-input-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="sb-ui-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@segurosbolivar.com"
                  required
                />
              </div>

              <div className="sb-ui-input-container">
                <label className="sb-ui-input-label" htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  className="sb-ui-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className={`sb-ui-button sb-ui-button--primary sb-ui-button--fill sb-ui-button--block${loading ? " sb-ui-button--disabled" : ""}`}
                disabled={loading}
              >
                {loading ? "Ingresando..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="sb-ui-alert sb-ui-alert--info" style={{ marginTop: "1.5rem", fontSize: "0.8rem" }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: "0.5rem" }} />
              <span>
                Demo: <strong>admin@segurosbolivar.com</strong> / <strong>admin123</strong>
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
