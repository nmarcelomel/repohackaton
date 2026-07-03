import { NavLink } from "react-router-dom";

const navSections = [
 {
  title: "Personas",
  items: [
   { path: "/bienestar", label: "Bienestar", icon: "fa-heart" },
   { path: "/talento", label: "Talento", icon: "fa-users" },
   { path: "/devex", label: "Experiencia Dev", icon: "fa-face-smile" },
  ],
 },
 {
  title: "Flujo de Valor",
  items: [
   { path: "/dora", label: "Métricas DORA", icon: "fa-chart-line" },
   { path: "/flow", label: "Ciclo de Entrega", icon: "fa-code-branch" },
   { path: "/wip", label: "WIP & Dependencias", icon: "fa-triangle-exclamation" },
   { path: "/predictability", label: "Predictibilidad", icon: "fa-bullseye" },
  ],
 },
 {
  title: "Gestión",
  items: [
   { path: "/demand", label: "Demanda (WSJF)", icon: "fa-chart-bar" },
   { path: "/capacity", label: "Capacidad & Asignación", icon: "fa-chart-pie" },
  ],
 },
 {
  title: "Ejecutivo",
  items: [
   { path: "/dashboard", label: "Panel Ejecutivo", icon: "fa-gauge-high" },
   { path: "/comparativa", label: "Comparativa Células", icon: "fa-ranking-star" },
   { path: "/roi", label: "ROI & Flujo de Valor", icon: "fa-coins" },
  ],
 },
];

export function Sidebar() {
 return (
  <aside style={{ position: "fixed", left: 0, top: 0, height: "100vh", width: "256px", backgroundColor: "#fff", borderRight: "1px solid #E0E0E0", display: "flex", flexDirection: "column", boxShadow: "2px 0 4px rgba(0,0,0,0.04)" }}>
   <div style={{ height: "64px", display: "flex", alignItems: "center", padding: "0 1.5rem", borderBottom: "1px solid #E0E0E0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
     <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#009056", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,144,86,0.25)" }}>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}>EI</span>
     </div>
     <div>
      <span style={{ fontWeight: 700, color: "#2B2B2B", fontSize: "0.875rem", display: "block", lineHeight: 1.2 }}>Engineering</span>
      <span style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.2 }}>Intelligence</span>
     </div>
    </div>
   </div>
   <nav style={{ flex: 1, padding: "0.5rem 0.75rem", overflowY: "auto" }}>
    {navSections.map((section) => (
     <div key={section.title} style={{ marginBottom: "0.75rem" }}>
      <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9E9E9E", padding: "0.5rem 1rem 0.25rem", margin: 0 }}>
       {section.title}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
       {section.items.map((item) => (
        <li key={item.path}>
         <NavLink
          to={item.path}
          className={({ isActive }) => isActive ? "nav-item-active" : "nav-item"}
          style={({ isActive }) => ({
           display: "flex",
           alignItems: "center",
           gap: "0.75rem",
           padding: "0.6rem 1rem",
           borderRadius: "8px",
           fontSize: "0.8rem",
           fontWeight: 500,
           textDecoration: "none",
           transition: "all 0.2s",
           backgroundColor: isActive ? "#009056" : "transparent",
           color: isActive ? "#fff" : "#2B2B2B",
           boxShadow: isActive ? "0 2px 8px rgba(0,144,86,0.2)" : "none",
          })}
         >
          <i className={`fa-solid ${item.icon}`} style={{ width: "18px", textAlign: "center", fontSize: "0.8rem" }} />
          {item.label}
         </NavLink>
        </li>
       ))}
      </ul>
     </div>
    ))}
   </nav>
   <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #E0E0E0" }}>
    <p style={{ fontSize: "0.7rem", color: "#9E9E9E" }}>Seguros Bolívar © 2026</p>
    <p style={{ fontSize: "0.6rem", color: "#9E9E9E", marginTop: "2px" }}>Engineering Intelligence v2.0</p>
   </div>
  </aside>
 );
}
