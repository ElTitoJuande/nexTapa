

// Utils/itemHelper.js
// Helper para añadir información de disponibilidad por días especiales.
// NO toca el campo available — ese lo controla exclusivamente el hostelero.

const DAYS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

/**
 * Añade servedToday y availableOnlyOn si la tapa tiene specialDays.
 * - servedToday: boolean — ¿se sirve hoy esta tapa?
 * - availableOnlyOn: string[] — qué días se sirve
 * 
 * El campo available NO se modifica — representa si el hostelero la tiene activa.
 */
export const withAvailable = (item) => {
   if (!item.specialDays || item.specialDays.length === 0) {
      return item;
   }

   const today = DAYS[new Date().getDay()];
   const servedToday = item.specialDays.includes(today);

   return {
      ...item,
      servedToday,
      availableOnlyOn: item.specialDays,
   };
};