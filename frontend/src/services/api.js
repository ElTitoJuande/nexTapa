import axios from "axios";
import { toastService } from "./toastService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Error en la peticion";
    const hasResponse = Boolean(error.response);
    const skipGlobalToast = Boolean(error.config?.skipGlobalErrorToast);

    // Caso 15: fallback global para errores no gestionados
    if (!skipGlobalToast && !hasResponse) {
      toastService.error(message || "Error inesperado de servidor");
    }

    console.error("Error en API:", {
      status: error.response?.status,
      message,
      url: error.config?.url,
    });

    return Promise.reject(error);
  }
);
