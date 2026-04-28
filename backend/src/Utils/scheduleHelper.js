

// src/scheduleHelper.js

/**
 * Calcula si un establecimiento está abierto ahora mismo.
 * Acepta el objeto schedule del modelo Establishment.
 */

export const computeIsOpen = (schedule) => {
  if (!schedule) return false;

  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const now = new Date();
  const todaySchedule = schedule[days[now.getDay()]];

  if (!todaySchedule || todaySchedule.closed) return false;

  const current =
    now.getHours().toString().padStart(2, '0') + ':' +
    now.getMinutes().toString().padStart(2, '0');

  const inRange = (open, close) => {
    if (!open || !close) return false;
    if (close < open) return current >= open || current < close; // cierre de madrugada
    return current >= open && current < close;
  };

  if (inRange(todaySchedule.open, todaySchedule.close)) return true;

  if (todaySchedule.split && todaySchedule.afternoon) {
    return inRange(todaySchedule.afternoon.open, todaySchedule.afternoon.close);
  }

  return false;
};


export const withIsOpen = (establishment) => {
  if (!establishment) return null;
  return { ...establishment, isOpen: computeIsOpen(establishment.schedule) };
};