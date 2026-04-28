// src/services/reviewService.js
import { api } from "./api";

export const reviewService = {
  // Público — reviews de un establecimiento o tapa + media
  getByTarget: async (targetType, targetId) => {
    try {
      const response = await api.get("/reviews", {
        params: { targetType, target: targetId },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener valoraciones:", error);
      throw error;
    }
  },

  // Historial del usuario autenticado
  getMy: async () => {
    try {
      const response = await api.get("/reviews/my");
      return response.data;
    } catch (error) {
      console.error("Error al obtener mis valoraciones:", error);
      throw error;
    }
  },

  // Admin — valoraciones de un usuario concreto
  getByUser: async (userId) => {
    try {
      const response = await api.get("/admin/reviews", {
        params: { userId },
      });
      return response.data?.reviews || [];
    } catch (error) {
      console.error("Error al obtener valoraciones del usuario:", error);
      return [];
    }
  },

  // Crear valoración
  create: async ({ establishmentId, itemId, rating }) => {
    try {
      const body = establishmentId
        ? { establishmentId, rating }
        : { itemId, rating };
      const response = await api.post("/reviews", body, {
        skipGlobalErrorToast: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error al crear valoración:", error);
      throw error;
    }
  },

  // Editar valoración
  update: async (id, rating) => {
    try {
      const response = await api.put(
        `/reviews/${id}`,
        { rating },
        {
          skipGlobalErrorToast: true,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar valoración:", error);
      throw error;
    }
  },

  // Borrar valoración
  delete: async (id) => {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar valoración:", error);
      throw error;
    }
  },

  // Admin — todas las valoraciones
  getAll: async ({ page = 1, limit = 20, userId } = {}) => {
    try {
      const response = await api.get("/admin/reviews", {
        params: { page, limit, ...(userId && { userId }) },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener todas las valoraciones:", error);
      throw error;
    }
  },
};
