

//src/services/itemService.js
//ItemService.js - Servicio para manejar operaciones relacionadas con items (tapas) en el frontend
//import { getTopRatedItems } from '../../../TFM-amarillo-backend/src/controllers/itemController';

import { api } from './api';// Importamos la instancia de axios configurada en api.js

export const itemService = {
   getByEstablishment: async (establishmentId, filters = {}) => {
      try {
         const params = new URLSearchParams();
      
         if (filters.type) {params.append('type', filters.type);}
         if (filters.available !== undefined) {params.append('available', filters.available);}
         if (filters.featured !== undefined) {params.append('featured', filters.featured);}
      
         const queryString = params.toString();
         const url = `/items/establishment/${establishmentId}${queryString ? `?${queryString}` : ''}`;
      
         const response = await api.get(url);
         return response.data;
      } catch (error) {
         console.error('Error al obtener items:', error);
         throw error;
      }
   },
   getAllItems: async (filters = {}) => {
      try {
         const response = await api.get('/items', { 
            params: filters 
         });
         return response.data;
      } catch (error) {
         console.error('Error al obtener items:', error);
         throw error;
      } 
   },

   getTopRatedItems: async () => {
      try {
         const response = await api.get('/items/top-rated');   
         return response.data;
      } catch (error) {
         console.error('Error al obtener items mejor valorados:', error);
         throw error;
      }
   }, 

   getBySlug: async (slug, params = {}) => {
      try {
         const response = await api.get(`/items/slug/${slug}`, { params });
         return response.data;
      } catch (error) {
         console.error('Error al obtener item por slug:', error);
         throw error;
      }
   },

   getByEstablishmentSlug: async (slug, filters = {}) => {
      try {
         const params = new URLSearchParams();  
         if (filters.type) {params.append('type', filters.type);}
         if (filters.available !== undefined) {params.append('available', filters.available);}  
         if (filters.featured !== undefined) {params.append('featured', filters.featured);}
         const queryString = params.toString();
         const url = `/items/establishment/slug/${slug}${queryString ? `?${queryString}` : ''}`;
         const response = await api.get(url);
         return response.data;
      } catch (error) {
         console.error('Error al obtener items por slug de establecimiento:', error);
         throw error;
      }
   },

   getById: async (itemId) => {
      try {
         const response = await api.get(`/items/${itemId}`);
         return response.data;
         
      } catch (error) {
         console.error('Error al obtener item:', error);
         throw error;
      }
   },

   create: async (itemData) => {
      try {
         const response = await api.post('/items', itemData, {
            skipGlobalErrorToast: true,
         });
         return response.data;
      } catch (error) {
         console.error('Error al crear item:', error);
         throw error;
      }
   },
   update: async (itemId, itemData) => {
      try {
         const response = await api.put(`/items/${itemId}`, itemData, {
            skipGlobalErrorToast: true,
         });
         return response.data;
      } catch (error) {
         console.error('Error al actualizar item:', error);
         throw error;
      }
   },

   delete: async (itemId) => {
      try {
         const response = await api.delete(`/items/${itemId}`);
         return response.data;
      } catch (error) {
         console.error('Error al eliminar item:', error);
         throw error;
      }
   },
   reorder: async (items) => {
      try {
         const response = await api.patch('/items/reorder', { items });
         return response.data;
      } catch (error) {
         console.error('Error al reordenar items:', error);
         throw error;
      }     
   } 

};


