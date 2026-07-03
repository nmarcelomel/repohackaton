import { NavLink } from "react-router-dom";

const navItems = [
 { path: "/dashboard", label: "Dashboard", icon: "fa-gauge-high" },
 { path: "/roi", label: "ROI & Value Stream", icon: "fa-coins" },
 { path: "/dora", label: "DORA Metrics", icon: "fa-chart-line" },
 { path: "/flow", label: "Flow & Cycle Time", icon: "fa-code-branch" },
 { path: "/demand", label: "Demanda (WSJF)", icon: "fa-chart-bar" },
 { path: "/capacity", label: "Capacity & Allocation", icon: "fa-chart-pie" },
 { path: "/wip", label: "WIP & Dependencias", icon: "fa-triangle-exclamation" },
 { path: "/devex", label: "DevEx", icon: "fa-face-smile" },
 { path: "/report", label: "Reporte CTO", icon: "fa-file-lines" },
 { path: "/predictability", label: "Predictability", icon: "fa-bullseye" },
 { path: "/talento", label: "Talento & Skills", icon: "fa-user-graduate" },
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
   <nav style={{ flex: 1, padding: "0.75rem 0.75rem", overflowY: "auto" }}>
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
     {navItems.map((item) => (
      <li key={item.path}>
       <NavLink
        to={item.path}
        className={({ isActive }) =>
         isActive ? "nav-item-active" : "nav-item"
        }
        style={({ isActive }) => ({
         display: "flex",
         alignItems: "center",
         gap: "0.75rem",
         padding: "0.7rem 1rem",
         borderRadius: "10px",
         fontSize: "0.85rem",
         fontWeight: 500,
         textDecoration: "none",
         transition: "all 0.2s",
         backgroundColor: isActive ? "#009056" : "transparent",
         color: isActive ? "#fff" : "#2B2B2B",
         boxShadow: isActive ? "0 2px 8px rgba(0,144,86,0.2)" : "none",
        })}
       >
        <i className={`fa-solid ${item.icon}`} style={{ width: "20px", textAlign: "center" }} />
        {item.label}
       </NavLink>
      </li>
     ))}
    </ul>
   </nav>
   <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #E0E0E0" }}>
    <p style={{ fontSize: "0.7rem", color: "#9E9E9E" }}>Seguros Bolívar © 2026</p>
    <p style={{ fontSize: "0.6rem", color: "#9E9E9E", marginTop: "2px" }}>Engineering Intelligence v2.0</p>
   </div>
  </aside>
 );
}
