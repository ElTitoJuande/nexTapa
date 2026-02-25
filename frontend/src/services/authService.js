

import axios from 'axios';

/**
 * SERVICIO DE AUTENTICACIÓN
 * 
 * Maneja todas las peticiones HTTP relacionadas con autenticación:
 * - Login
 * - Registro
 * - Logout
 * - Verificación de sesión
 * 
 * Usa axios con configuración para enviar cookies automáticamente (httpOnly).
 */

// ============================================
// CONFIGURACIÓN DE AXIOS
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configuramos axios para enviar cookies en cada petición
axios.defaults.withCredentials = true;

// Instancia de axios con configuración base
const api = axios.create({
   baseURL: `${API_URL}/api`,
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true, // Importante para cookies httpOnly
});

// ============================================
// INTERCEPTOR DE RESPUESTAS (manejo de errores)
// ============================================

api.interceptors.response.use(
   (response) => response,
   (error) => {
      // Si el servidor devuelve un mensaje de error, lo usamos
      const message = error.response?.data?.message || error.message || 'Error en la petición';
    
      console.error('❌ Error en API:', {
         status: error.response?.status,
         message,
         url: error.config?.url,
      });
    
      // Rechazamos la promesa con un error formateado
      return Promise.reject(new Error(message));
   }
);

// ============================================
// FUNCIONES DEL SERVICIO
// ============================================

const authService = {
   /**
   * REGISTRO DE NUEVO USUARIO
   * 
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña
   * @param {string} userData.nombre - Nombre
   * @param {string} userData.apellidos - Apellidos
   * @param {string} userData.role - 'cliente' o 'hostelero'
   * @param {string} [userData.nombreComercial] - Solo hosteleros
   * @param {Object} [userData.establecimiento] - Solo hosteleros
   * 
   * @returns {Promise<Object>} Datos del usuario registrado
   */
   async register(userData) {
      try {        
         const response = await api.post('/auth/register', userData);
         return response.data;
      } catch (error) {
         console.error('❌ Error en registro:', error);
         throw error;
      }
   },

   /**
   * LOGIN DE USUARIO EXISTENTE
   * 
   * @param {Object} credentials - Credenciales de login
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña
   * 
   * @returns {Promise<Object>} Datos del usuario logueado
   */
   async login(credentials) {
      try {
         const response = await api.post('/auth/login', credentials);    
         return response.data;
      } catch (error) {
         console.error('❌ Error en login:', error);
         throw error;
      }
   },

   /**
   * LOGOUT DEL USUARIO
   * Invalida la cookie de sesión
   * 
   * @returns {Promise<void>}
   */
   async logout() {
      try {
         await api.post('/auth/logout');      
      } catch (error) {
         console.error('❌ Error en logout:', error);
         throw error;
      }
   },

   /**
   * VERIFICA SI HAY UNA SESIÓN ACTIVA
   * Útil para recuperar el usuario al recargar la página
   * 
   * @returns {Promise<Object|null>} Usuario actual o null
   */
   async checkAuth() {
      try {
         const response = await api.get('/auth/check-auth');
         return response.data;
      } catch (error) {
      // Si no hay sesión, devolvemos null en vez de lanzar error
         console.error('ℹ️ No hay sesión activa');
         return null;
      }
   },

   /**
   * SOLICITA UN EMAIL DE RECUPERACIÓN DE CONTRASEÑA
   * 
   * @param {string} email - Email del usuario
   * @returns {Promise<void>}
   */
   async forgotPassword(email) {
      try {
         await api.post('/auth/forgot-password', { email });
      } catch (error) {
         console.error('❌ Error al solicitar recuperación:', error);
         throw error;
      }
   },

   /**
   * VERIFICA EL EMAIL DEL USUARIO
   * 
   * @param {string} token - Token de verificación enviado por email
   * @returns {Promise<void>}
   */
   async verifyEmail(token) {
      try {
         await api.get(`/auth/verify-email?token=${token}`);
      } catch (error) {
         console.error('❌ Error al verificar email:', error);
         throw error;
      }
   },
};

export default authService;