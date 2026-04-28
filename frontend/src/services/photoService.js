

// src/services/photoService.js
// photoService.js - Servicio para manejar operaciones relacionadas con fotos en el frontend
import { api } from './api';

export const photoService = {
   uploadTemporary: async (file, options = {}) => {
      try {
         const { folder = "nextapa/temp" } = options;

         const formData = new FormData();
         formData.append("photo", file);
         formData.append("folder", folder);

         const res = await api.post("/photos/temp", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            skipGlobalErrorToast: true,
         });

         return res.data;
      } catch (error) {
         console.error("Error al subir imagen temporal:", error);
         throw error;
      }
   },

   getByEstablishment: async (establishmentId, options = {}) => {
      try {
         const { limit = 50 } = options;
         const res = await api.get(`/photos/establishment/${establishmentId}`, {
            params: { limit }
         });
         return res.data.data;
      } catch (error) {
         console.error('Error al obtener fotos del establecimiento:', error);
         throw error;
      }
   },

   uploadToEstablishment: async (file, establishmentId, options = {}) => {
      try {
         const { caption = '', alt = '', isPrimary = false } = options;

         const formData = new FormData();
         formData.append('photo', file);
         formData.append('establishment', establishmentId);
         formData.append('caption', caption);
         formData.append('alt', alt);
         formData.append('isPrimary', isPrimary.toString());

         const res = await api.post('/photos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
         });
         return res.data;
      } catch (error) {
         console.error('Error al subir foto al establecimiento:', error);
         throw error;
      }
   },

   delete: async (photoId) => {
      try {
         const res = await api.delete(`/photos/${photoId}`);
         return res.data;
      } catch (error) {
         console.error('Error al eliminar foto:', error);
         throw error;
      }
   },

   setPrimary: async (photoId) => {
      try {
         const res = await api.patch(`/photos/${photoId}/set-primary`);
         return res.data;
      } catch (error) {
         console.error('Error al establecer foto principal:', error);
         throw error;
      }
   },

   reorder: async (photos) => {
      try {
         const res = await api.patch('/photos/reorder', { photos });
         return res.data;
      } catch (error) {
         console.error('Error al reordenar fotos:', error);
         throw error;
      }
   },

   uploadToItem: async (file, itemId, options = {}) => {
      try {
         const { caption = '', alt = '', isPrimary = false } = options;

         const formData = new FormData();
         formData.append('photo', file);
         formData.append('item', itemId);
         formData.append('caption', caption);
         formData.append('alt', alt);
         formData.append('isPrimary', isPrimary.toString());

         const res = await api.post('/photos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
         });
         return res.data;
      } catch (error) {
         console.error('Error al subir foto al item:', error);
         throw error;
      }
   },

   getByItem: async (itemId) => {
      try {
         const res = await api.get(`/photos/item/${itemId}`);
         return res.data.data;
      } catch (error) {
         console.error('Error al obtener fotos del item:', error);
         throw error;
      }
   },
};
