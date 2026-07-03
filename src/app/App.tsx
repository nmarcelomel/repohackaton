import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { BienestarPage } from "../pages/bienestar/BienestarPage";
import { TalentoPage } from "../pages/talento/TalentoPage";
import { FlujoPage } from "../pages/flujo/FlujoPage";
import { NegocioPage } from "../pages/negocio/NegocioPage";

const router = createBrowserRouter([
 {
 path: "/",
 element: <MainLayout />,
 children: [
 { index: true, element: <Navigate to="/bienestar" replace /> },
 { path: "bienestar", element: <BienestarPage /> },
 { path: "talento", element: <TalentoPage /> },
 { path: "flujo", element: <FlujoPage /> },
 { path: "negocio", element: <NegocioPage /> },
 ],
 },
]);

export function App() {
 return <RouterProvider router={router} />;
}
