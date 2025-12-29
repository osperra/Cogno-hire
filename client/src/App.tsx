import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import type { ReactNode } from "react";

import { LandingPage } from "./Components/marketing/LandingPage";
import { Login } from "./Components/auth/Login";
import { Register } from "./Components/auth/Register";
import AppLayout from "./Components/layout/AppLayout";

function RequireAuth({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppShell() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={() => (window.location.href = "/login")} onOpenDesignSystem={() => (window.location.href = "/design-system")} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AppShell />}>
          <Route path="/app/*" element={<AppLayout />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
