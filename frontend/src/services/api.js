
//api.js - Configuración de axios para el frontend, incluyendo interceptores para manejo de tokens y errores

import axios from 'axios';

// Configuración base de axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export  const api = axios.create({
   baseURL: API_URL,
   timeout: 10000,
   headers: {
      'Content-Type': 'application/json'
   },
   withCredentials: true // Para enviar cookies (JWT)
});

// Interceptor para requests (aquí añadiremos el token después)
api.interceptors.request.use(
   (config) => {
      
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Interceptor para responses (manejo de errores centralizado)
api.interceptors.response.use(
   (response) => {
      return response;
   },
   (error) => {
      if (error.response) {
      // El servidor respondió con un código de error
         console.error('Error de respuesta:', error.response.data);
      
         // Si es 401, podrías redirigir al login
         if (error.response.status === 401) {
            // window.location.href = '/login';
         }
      } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
         console.error('Error de red:', error.request);
      } else {
      // Algo pasó al configurar la petición
         console.error('Error:', error.message);
      }
      return Promise.reject(error);
   }
);

