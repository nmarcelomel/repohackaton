import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
 // Allow access - auth token auto-set for demo mode
 const token = localStorage.getItem("auth_token");
 if (!token) {
  // Auto-login for demo: set a token so the app works without backend
  localStorage.setItem("auth_token", "demo-token");
 }
 return <Outlet />;
}
