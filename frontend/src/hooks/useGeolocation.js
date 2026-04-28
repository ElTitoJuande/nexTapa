

// src/hooks/useGeolocation.js
// Hook personalizado para obtener la geolocalización del usuario con caché en localStorage

import { useState, useEffect } from 'react';

const CACHE_KEY = 'nextapa_user_coords';
const CACHE_DURATION = 10 * 60 * 1000;// 100 minutos 

export const useGeolocation = () => {
   const [coords, setCoords] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      if (!navigator.geolocation) {
         setError('Geolocalización no soportada por el navegador');
         setLoading(false);
         return;
      }

      // Comprobar si hay coords cacheadas y válidas
      try {
         const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
         const now = Date.now();

         if (cached && now - cached.timestamp < CACHE_DURATION) {
            setCoords(cached.coords);
            setLoading(false);
            return; // No pedimos al navegador
         }
      } catch {
      // Si localStorage falla, seguimos adelante y pedimos al navegador
         localStorage.removeItem(CACHE_KEY);
      }

      // Sin caché válido → pedir al navegador
      navigator.geolocation.getCurrentPosition(
         (position) => {
            const newCoords = {
               lat: position.coords.latitude,
               lng: position.coords.longitude,
            };

            // Guardar en caché con timestamp
            try {
               localStorage.setItem(CACHE_KEY, JSON.stringify({
                  coords: newCoords,
                  timestamp: Date.now()
               }));
            } catch {
               // localStorage lleno o bloqueado, no es crítico
            }

            setCoords(newCoords);
            setLoading(false);
         },
         (err) => {
            setError('Permiso denegado para acceder a la ubicación', err);
            setLoading(false);
         },
         {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
         }
      );
   }, []);

   // Utilidad para limpiar el caché manualmente si se necesita
   const clearCache = () => localStorage.removeItem(CACHE_KEY);

   return { coords, loading, error, clearCache };
};