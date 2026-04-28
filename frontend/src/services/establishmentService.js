import { api } from './api';

export const establishmentService = { 
   getAll: async (filters = {}) => {
      try {
         const params = new URLSearchParams();
         if (filters.province) {params.append('province', filters.province);}
         if (filters.city) {params.append('city', filters.city);}
         if (filters.includeInactive) {params.append('includeInactive', 'true');}
         if (filters.includeDeleted) {params.append('includeDeleted', 'true');}
      
         const queryString = params.toString();
         const url = `/establishment${queryString ? `?${queryString}` : ''}`;
      
         const response = await api.get(url);
         return response.data;
      } catch (error) {
         console.error('Error al obtener establecimientos:', error);
         throw error;
      }
   },

   getNearby: async ({ lat, lng, maxDistance, limit = 10 }) => {
      try {
         const response = await api.get('/establishment/nearby', {
            params: { lat, lng, maxDistance, limit }
         });
         return response.data;
      } catch (error) {
         console.error('Error al obtener establecimientos cercanos:', error);
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

   getMine: async () => {
      try {
         const response = await api.get('/establishment/mine');
         return response.data;
      } catch (error) {
         console.error('Error al obtener establecimiento del hostelero:', error);
         throw error;
      }
   },

   getBySlug: async (slug, params) => { 
      try {
         const response = await api.get(`/establishment/slug/${slug}`, { params });
         return response.data;
      } catch (error) {
         console.error('Error al obtener establecimiento por slug:', error);
         throw error;
      }
   },

   create: async (establishmentData) => {
      try {
         const response = await api.post('/establishment', establishmentData, {
            skipGlobalErrorToast: true,
         });
         return response.data;
      } catch (error) {
         console.error('Error al crear establecimiento:', error);
         throw error;
      }
   },

   update: async (id, establishmentData) => {
      try {
         const response = await api.patch(`/establishment/${id}`, establishmentData, {
            skipGlobalErrorToast: true,
         });
         return response.data;
      } catch (error) {
         console.error('Error al actualizar establecimiento:', error);
         throw error;
      }
   },

   // Borrado definitivo (soft delete en backend)
   delete: async (id) => {
      try {
         const response = await api.delete(`/establishment/${id}`);
         return response.data;
      } catch (error) {
         console.error('Error al eliminar establecimiento:', error);
         throw error;
      }
   },

   // Desactivar temporalmente — sigue existiendo pero no aparece en público
   deactivate: async (id) => {
      try {
         const response = await api.patch(`/establishment/${id}/deactivate`);
         return response.data;
      } catch (error) {
         console.error('Error al desactivar establecimiento:', error);
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

   updateSocialLinks: async (id, socialLinks) => {
      try {
         const response = await api.patch(`/establishment/${id}/social-links`, socialLinks);
         return response.data;
      } catch (error) {
         console.error('Error al actualizar redes sociales:', error);
         throw error;
      }
   },

   getPending: async () => {
    try {
      const response = await api.get('/establishment/pending');
      return response.data;
    } catch (error) {
      console.error('Error al obtener establecimientos pendientes:', error);
      throw error;
    }
  },

  // Verificar establecimiento (Admin)
  verify: async (id) => {
    try {
      const response = await api.patch(`/establishment/${id}/verify`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar establecimiento:', error);
      throw error;
    }
  },

  // Rechazar alta de establecimiento (Admin)
  reject: async (id) => {
    try {
      const response = await api.patch(`/establishment/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error al rechazar establecimiento:', error);
      throw error;
    }
  },
};
