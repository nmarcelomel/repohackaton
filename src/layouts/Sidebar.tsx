import { NavLink } from "react-router-dom";
import { Heart, Users, Activity, TrendingUp } from "lucide-react";

const navItems = [
 { path: "/bienestar", label: "Bienestar", icon: Heart },
 { path: "/talento", label: "Talento", icon: Users },
 { path: "/flujo", label: "Flujo", icon: Activity },
 { path: "/negocio", label: "Negocio", icon: TrendingUp },
];

export function Sidebar() {
 return (
 <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-bolivar-gray-light flex flex-col shadow-sm">
 <div className="h-16 flex items-center px-6 border-b border-bolivar-gray-light">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-lg bg-bolivar-green flex items-center justify-center shadow-md">
 <span className="text-white font-bold text-sm">EI</span>
 </div>
 <div>
 <span className="font-bold text-bolivar-gray-text text-sm block leading-tight">Engineering</span>
 <span className="text-xs text-bolivar-gray-muted leading-tight">Intelligence</span>
 </div>
 </div>
 </div>
 <nav className="sb-ui-menu sb-ui-menu--vertical flex-1 px-3 py-4">
 <ul className="space-y-1">
 {navItems.map((item) => (
 <li key={item.path}>
 <NavLink
 to={item.path}
 className={({ isActive }) =>
 `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
 isActive
 ? "bg-bolivar-green text-white shadow-md"
 : "text-bolivar-gray-text hover:bg-bolivar-gray-bg"
 }`
 }
 >
 <item.icon className="w-5 h-5" />
 {item.label}
 </NavLink>
 </li>
 ))}
 </ul>
 </nav>
 <div className="px-6 py-4 border-t border-bolivar-gray-light">
 <p className="text-xs text-bolivar-gray-muted">Seguros Bolívar © 2026</p>
 </div>
 </aside>
 );
}
