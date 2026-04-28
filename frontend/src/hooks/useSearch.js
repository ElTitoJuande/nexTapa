

// src/hooks/useSearch.js
// Hook reutilizable para búsqueda global con debounce

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

export const useSearch = ({ debounceMs = 300, limit = 5 } = {}) => {
   const [query, setQuery]     = useState('');
   const [results, setResults] = useState({ establishments: [], items: [], total: 0 });
   const [loading, setLoading] = useState(false);
   const [error, setError]     = useState(null);
   const [isOpen, setIsOpen]   = useState(false);

   const debounceTimer = useRef(null);// para almacenar el timer de debounce
   const abortController = useRef(null);// para cancelar peticiones anteriores

   const search = useCallback(async (q) => {
      // Cancelar petición anterior si sigue en vuelo
      if (abortController.current) {
         abortController.current.abort();
      }

      if (!q || q.trim().length < 2) {
         setResults({ establishments: [], items: [], total: 0 });
         setLoading(false);
         return;
      }

      abortController.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
         const response = await api.get(`/search?q=${encodeURIComponent(q.trim())}&limit=${limit}`, {
            signal: abortController.current.signal// para cancelar si el usuario sigue escribiendo
         });

         if (response.data.success) {
            setResults(response.data.data);
            setIsOpen(true);
         }
      } catch (err) {
         if (err.name === 'CanceledError' || err.name === 'AbortError') {return;} // petición cancelada, ignorar
         setError('Error al buscar. Inténtalo de nuevo.');
      } finally {
         setLoading(false);
      }
   }, [limit]);

   // Debounce: espera a que el usuario deje de escribir
   useEffect(() => {
      clearTimeout(debounceTimer.current);

      if (!query || query.trim().length < 2) {
         setResults({ establishments: [], items: [], total: 0 });// limpiar resultados si el query es muy corto
         setIsOpen(false);
         return;
      }

      debounceTimer.current = setTimeout(() => {// ejecutar búsqueda
         search(query);
      }, debounceMs);

      return () => clearTimeout(debounceTimer.current);
   }, [query, search, debounceMs]);

   const clear = useCallback(() => {
      setQuery('');
      setResults({ establishments: [], items: [], total: 0 });
      setIsOpen(false);
      setError(null);
   }, []);

   const close = useCallback(() => setIsOpen(false), []);
   const open  = useCallback(() => {
      if (results.total > 0) {setIsOpen(true);}
   }, [results.total]);

   return {
      query,
      setQuery,
      results,
      loading,
      error,
      isOpen,
      clear,
      close,
      open,
   };
};