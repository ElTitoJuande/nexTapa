import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";
import { setAuthToken } from "../services/api";
import { useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const location = useLocation();

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔒 Rutas públicas donde NO queremos forzar auth
  const isPublicRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/auth/verify" ||
    location.pathname.startsWith("/auth/reset-password") ||
    location.pathname === "/forgot-password";

  const fetchMe = async (currentToken) => {
    if (!currentToken) return null;

    try {
      setAuthToken(currentToken);

      const response = await authService.getMe();
      const userData = response?.data || response;

      setUser(userData);
      return userData;

    } catch (error) {
      // ❗ No forzamos logout en rutas públicas
      if (error?.response?.status === 401) {
        setUser(null);
        return null;
      }

      throw error;
    }
  };

  const login = async ({ email, password }) => {
    const response = await authService.login({ email, password });
    const newToken = response.token;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setAuthToken(newToken);

    await fetchMe(newToken);
    return response;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    const newToken = response.token;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setAuthToken(newToken);

    await fetchMe(newToken);
    return response;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const refreshUser = async () => {
    if (!token) return null;
    return fetchMe(token);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          await fetchMe(token);
        }
      } catch (error) {
        // Solo logout si no estamos en rutas públicas
        if (!isPublicRoute) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token, isPublicRoute]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}