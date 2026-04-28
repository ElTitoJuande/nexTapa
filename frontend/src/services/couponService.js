// src/services/couponService.js
import { api } from "./api";

export const couponService = {

  // ── Cliente ───────────────────────────────────────────────────────────────

  // Ver mis cupones (activos y usados)
  // GET /api/coupons/my
  getMyCoupons: async () => {
    try {
      const response = await api.get("/coupons/my");
      return response.data;
    } catch (error) {
      console.error("Error al obtener mis cupones:", error);
      throw error;
    }
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  // Ver cupones pendientes de validación
  // GET /api/coupons/pending
  getPending: async () => {
    try {
      const response = await api.get("/coupons/pending");
      return response.data;
    } catch (error) {
      console.error("Error al obtener cupones pendientes:", error);
      throw error;
    }
  },

  // Validar un cupón → se activa y el cliente recibe notificación WS
  // PATCH /api/coupons/:id/validate
  validate: async (id) => {
    try {
      const response = await api.patch(`/coupons/${id}/validate`);
      return response.data;
    } catch (error) {
      console.error("Error al validar cupón:", error);
      throw error;
    }
  },

  // Usar y eliminar un cupón activo
  // DELETE /api/coupons/:id/use
  use: async (id) => {
    try {
      const response = await api.delete(`/coupons/${id}/use`);
      return response.data;
    } catch (error) {
      console.error("Error al usar cupón:", error);
      throw error;
    }
  },

  // Rechazar un cupón con motivo opcional
  // PATCH /api/coupons/:id/reject
  reject: async (id, rejectionReason = "") => {
    try {
      const response = await api.patch(`/coupons/${id}/reject`, { rejectionReason });
      return response.data;
    } catch (error) {
      console.error("Error al rechazar cupón:", error);
      throw error;
    }
  },
};