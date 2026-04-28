import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { AllEstablishment } from "./pages/AllEstablishment";
import { Establishment } from "./pages/Establishment";
import { AllTapas } from "./pages/AllTapas";
import { Tapas } from "./pages/Tapas";
import { AdminPanel } from "./pages/admin/AdminPanel";
import { Dashboard } from "./pages/admin/Dashboard";
import { AdminEstablishments } from "./pages/admin/AdminEstablishments";
import { AdminEstablishmentDetail } from "./pages/admin/AdminEstablishmentDetail";
import { ItemAdmin } from "./pages/admin/ItemAdmin";
import { HostItemEditor } from "./pages/host/HostItemEditor";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminUserDetail } from "./pages/admin/AdminUserDetail";
import { AdminItems } from "./pages/admin/AdminItems";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { HostRegisterPage } from "./pages/auth/HostRegisterPage";
import { HostDashboard } from "./pages/host/HostDashboard";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { ForbiddenPage } from "./pages/ForbiddenPage";
import { SearchPage } from "./pages/SearchPage";

import { PublicOnlyRoute } from "./components/routes/PublicOnlyRoute";
import { AdminRoute } from "./components/routes/AdminRoute";
import { HostRoute } from "./components/routes/HostRoute";
import { PrivateRoute } from "./components/routes/ClientRoute";

import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";

import { Footer } from "./components/layout/Footer";

function AppLayout() {
  const location = useLocation();

  const hideFooter = location.pathname.startsWith("/admin");
  const shellClassName = hideFooter
    ? "min-h-screen"
    : "min-h-screen public-shell-gradient";

  return (
    <div className={shellClassName}>
      <Routes>
        {/* ── Públicas ─────────────────────────────────────────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/establishments" element={<AllEstablishment />} />
        <Route path="/establishment/:slug" element={<Establishment />} />
        <Route path="/items" element={<AllTapas />} />
        <Route path="/items/:slug" element={<Tapas />} />
        <Route path="/search" element={<SearchPage />} />

        {/* ── Auth ─────────────────────────────────────────────────────── */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/host/login"
          element={
            <PublicOnlyRoute>
              <Navigate to="/login" replace />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/host/register"
          element={
            <PublicOnlyRoute>
              <HostRegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />

        {/* Verificación y reset — sin PublicOnlyRoute, el usuario no está logueado */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/verify" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* ── Host ─────────────────────────────────────────────────────── */}
        <Route
          path="/host/dashboard"
          element={
            <HostRoute>
              <HostDashboard />
            </HostRoute>
          }
        />

        <Route
          path="/host/items/:id"
          element={
            <HostRoute>
              <HostItemEditor />
            </HostRoute>
          }
        />

        {/* ── Perfil ───────────────────────────────────────────────────── */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        <Route path="/403" element={<ForbiddenPage />} />

        {/* ── Admin ────────────────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="establishments" element={<AdminEstablishments />} />
          <Route
            path="establishments/:id"
            element={<AdminEstablishmentDetail />}
          />
          <Route path="items" element={<AdminItems />} />
          <Route path="items/:id" element={<ItemAdmin />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* ── Fallback global ──────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!hideFooter && <Footer />}
    </div>
  );
}

export function App() {
  return <AppLayout />;
}
