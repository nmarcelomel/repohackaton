import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { ProtectedRoute } from "../layouts/ProtectedRoute";
import { LoginPage } from "../pages/login/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { DoraPage } from "../pages/dora/DoraPage";
import { FlowPage } from "../pages/flow/FlowPage";
import { DemandPage } from "../pages/demand/DemandPage";
import { CapacityPage } from "../pages/capacity/CapacityPage";
import { WipDependenciesPage } from "../pages/wip/WipDependenciesPage";
import { DevExPage } from "../pages/devex/DevExPage";
import { ExecutiveReportPage } from "../pages/report/ExecutiveReportPage";
import { PredictabilityPage } from "../pages/predictability/PredictabilityPage";
import { RoiPage } from "../pages/roi/RoiPage";
import { TalentoPage } from "../pages/talento/TalentoPage";

const router = createBrowserRouter([
 {
  path: "/login",
  element: <LoginPage />,
 },
 {
  path: "/",
  element: <ProtectedRoute />,
  children: [
   {
    element: <MainLayout />,
    children: [
     { index: true, element: <Navigate to="/dashboard" replace /> },
     { path: "dashboard", element: <DashboardPage /> },
     { path: "dora", element: <DoraPage /> },
     { path: "flow", element: <FlowPage /> },
     { path: "demand", element: <DemandPage /> },
     { path: "capacity", element: <CapacityPage /> },
     { path: "wip", element: <WipDependenciesPage /> },
     { path: "devex", element: <DevExPage /> },
     { path: "report", element: <ExecutiveReportPage /> },
     { path: "predictability", element: <PredictabilityPage /> },
     { path: "roi", element: <RoiPage /> },
     { path: "talento", element: <TalentoPage /> },
    ],
   },
  ],
 },
]);

export function App() {
 return <RouterProvider router={router} />;
}
