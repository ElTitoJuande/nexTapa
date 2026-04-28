import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDefaultRouteByRole } from "../../utils/authRedirect";

export function PublicOnlyRoute({ children }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
  }

  return children;
}
