

// src/services/photoService.js
// photoService.js - Servicio para manejar operaciones relacionadas con fotos en el frontend
import { api } from './api';

export const photoService = {

   getByEstablishment: async (establishmentId, options = {}) => {
      const { limit = 50 } = options;
      const res = await api.get(`/photos/establishment/${establishmentId}`, {
         params: {  limit }
      });
      return res.data.data; 
   },

   uploadToEstablishment: async (file, establishmentId, options = {}) => {
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
   },

   delete: async (photoId) => {
      const res = await api.delete(`/photos/${photoId}`);
      return res.data;
   },

   setPrimary: async (photoId) => {
      const res = await api.patch(`/photos/${photoId}/set-primary`);
      return res.data;
   }
};