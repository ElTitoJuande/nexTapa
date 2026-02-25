
//establishmentService.js - Servicio para manejar operaciones relacionadas con establecimientos en el frontend
// Este servicio se encarga de realizar las llamadas a la API para obtener, crear, actualizar, eliminar y reactivar establecimientos.
import { api } from './api';

export const establishmentService = { 
   getAll: async (filters = {}) => {// Permite obtener una lista de establecimientos con filtros opcionales (provincia y ciudad)
      try {
         const params = new URLSearchParams();// Utilizamos URLSearchParams para construir la cadena de consulta de manera segura
         if (filters.province) {params.append('province', filters.province);}
         if (filters.city) {params.append('city', filters.city);}
      
         const queryString = params.toString();
       
         const url = `/establishment${queryString ? `?${queryString}` : ''}`;
      
         const response = await api.get(url);// Realizamos la llamada a la API con la URL construida
         return response.data;
      } catch (error) {
         console.error('Error al obtener establecimientos:', error);
         throw error;
      }
   },

   getById: async (id) => {
      try {       
         const response = await api.get(`/establishment/${id}`);
         return response.data;
      } catch (error) {
         console.error('Error al obtener establecimiento:', error);
         throw error;
      }
   },

   getBySlug: async (slug) => {
      try {
         const response = await api.get(`/establishment/slug/${slug}`);
         return response.data;
      } catch (error) {
         console.error('Error al obtener establecimiento por slug:', error);
         throw error;
      }
   },

   create: async (establishmentData) => {
      try {
         const response = await api.post('/establishment', establishmentData);
         return response.data;
      } catch (error) {
         console.error('Error al crear establecimiento:', error);
         throw error;
      }
   },

   update: async (id, establishmentData) => {
      try {
         const response = await api.patch(`/establishment/${id}`, establishmentData);
         return response.data;
      } catch (error) {
         console.error('Error al actualizar establecimiento:', error);
         throw error;
      }
   },

   delete: async (id) => {
      try {
         const response = await api.delete(`/establishment/${id}`);
         return response.data;
      } catch (error) {
         console.error('Error al eliminar establecimiento:', error);
         throw error;
      }
   },
   reactivate: async (id) => {
      try {
         const response = await api.patch(`/establishment/${id}/reactivate`);
         return response.data;
      } catch (error) {
         console.error('Error al reactivar establecimiento:', error);
         throw error;
      }
   },
};