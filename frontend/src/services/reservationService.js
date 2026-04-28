// src/services/reservationService.js
import { api } from "./api";

export const reservationService = {

  // ── Cliente ───────────────────────────────────────────────────────────────

  create: async ({ establishmentId, date, time, guests, notes }) => {
    try {
      const response = await api.post("/reservations", {
        establishmentId,
        date,
        time,
        guests: Number(guests),
        notes: notes?.trim() || "",
      }, { skipGlobalErrorToast: true });
      return response.data;
    } catch (error) {
      console.error("Error al crear reserva:", error);
      throw error;
    }
  },

  getMy: async () => {
    try {
      const response = await api.get("/reservations/my");
      return response.data;
    } catch (error) {
      console.error("Error al obtener mis reservas:", error);
      throw error;
    }
  },

  // Cliente cancela su propia reserva
  cancel: async (id) => {
    try {
      const response = await api.patch(`/reservations/${id}/cancel`, {}, { skipGlobalErrorToast: true });
      return response.data;
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      throw error;
    }
  },

  // ── Hostelero — FLUJO 1 (reservas pendientes) ─────────────────────────────

  getByEstablishment: async (establishmentId) => {
    try {
      const response = await api.get(`/reservations/establishment/${establishmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener reservas del establecimiento:", error);
      throw error;
    }
  },

  // Confirmar → email al cliente (sin cupón)
  confirm: async (id) => {
    try {
      const response = await api.patch(`/reservations/${id}/confirm`, {}, { skipGlobalErrorToast: true });
      return response.data;
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
      throw error;
    }
  },

  // Rechazar → email al cliente
  reject: async (id, rejectionReason = "") => {
    try {
      const response = await api.patch(`/reservations/${id}/reject`, { rejectionReason }, { skipGlobalErrorToast: true });
      return response.data;
    } catch (error) {
      console.error("Error al rechazar reserva:", error);
      throw error;
    }
  },

  // ── Hostelero — FLUJO 2 (reservas confirmadas) ────────────────────────────

  // Finalizar → genera cupón 5% → WS al cliente
  complete: async (id) => {
    try {
      const response = await api.patch(`/reservations/${id}/complete`, {}, { skipGlobalErrorToast: true });
      return response.data;
    } catch (error) {
      console.error("Error al finalizar reserva:", error);
      throw error;
    }
  },

  // Hostelero cancela reserva confirmada (sin cupón, sin email)
  cancelHost: async (id) => {
    try {
      const response = await api.patch(`/reservations/${id}/cancel-host`, {}, { skipGlobalErrorToast: true });
      return response.data;
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      throw error;
    }
  },
};