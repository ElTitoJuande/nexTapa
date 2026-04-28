import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function AdminRoute({ children }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return <p>Cargando...</p>;

  // No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Autenticado pero no admin
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}