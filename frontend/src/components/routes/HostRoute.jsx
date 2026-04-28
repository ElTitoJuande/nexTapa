import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function HostRoute({ children }) {
  const location = useLocation();
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== "hostelero") {
    return <Navigate to="/403" replace state={{ from: location.pathname }} />;
  }

  return children;
}
