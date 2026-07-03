import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function MainLayout() {
 return (
 <div className="min-h-screen bg-bolivar-gray-bg">
 <Sidebar />
 <div className="ml-64 flex flex-col min-h-screen">
 <Topbar />
 <main className="flex-1 p-8">
 <Outlet />
 </main>
 </div>
 </div>
 );
}
