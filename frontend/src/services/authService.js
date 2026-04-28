// src/services/authService.js
import { api } from "./api";

const authService = {

  async register(userData) {
    const response = await api.post("/auth/register", userData, {
      skipGlobalErrorToast: true,
    });
    return response.data;
  },

  async login(credentials) {
    const response = await api.post("/auth/login", credentials, {
      skipGlobalErrorToast: true,
    });
    return response.data;
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Solicitar enlace de recuperación
  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Restablecer contraseña con el token del email
  async resetPassword(token, password, passwordConfirm) {
    const response = await api.patch(`/auth/reset-password/${token}`, {
      password,
      passwordConfirm,
    });
    return response.data;
  },
};

export default authService;
