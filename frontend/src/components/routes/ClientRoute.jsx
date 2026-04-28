import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDefaultRouteByRole } from "../../utils/authRedirect";

// ── Componente original de Juande ─────────────────────────────────────────────
// Restringe la ruta exclusivamente a usuarios con rol "cliente"
export function ClientRoute({ children }) {
   const location = useLocation();
   const { loading, isAuthenticated, user } = useAuth();

   if (loading) {return <p>Cargando...</p>;}

   if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
   }

   if (user?.role !== "cliente") {
      return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
   }

   return children;
}

// ── Añadido por Fer ───────────────────────────────────────────────────────────
// Ruta privada genérica: solo exige estar autenticado, sin filtrar por rol.
// Usada en /profile para que admin y hostelero también puedan acceder.
export function PrivateRoute({ children }) {
   const location = useLocation();
   const { loading, isAuthenticated } = useAuth();

   if (loading) {return <p>Cargando...</p>;}

   if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
   }

   return children;
}