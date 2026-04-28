// src/services/userService.js
import { api } from "./api";

export const userService = {
  async getAll() {
    const response = await api.get("/users");
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async deactivate(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async reactivate(id) {
    const response = await api.patch(`/users/${id}/reactivate`);
    return response.data;
  },

  async updateUser(id, payload) {
    const response = await api.put(`/users/${id}`, payload, {
      skipGlobalErrorToast: true,
    });
    return response.data;
  },
};
