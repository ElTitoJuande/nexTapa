// src/hooks/useWebSocket.js
// Hook reutilizable para conectar con el servidor WS según el rol del usuario.
// Uso:
//   const { connected, notifications, clearNotification } = useWebSocket({ role: 'establishment', userId: user._id });
//   const { connected }                                   = useWebSocket({ role: 'admin' });

import { useCallback, useEffect, useRef, useState } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';

const RECONNECT_DELAY_MS  = 3000;
const MAX_RECONNECT_TRIES = 5;

/**
 * @param {{ role: 'admin' | 'establishment' | 'client', userId?: string }} options
 */
export function useWebSocket({ role, userId } = {}) {
  const [connected, setConnected]         = useState(false);
  const [notifications, setNotifications] = useState([]);

  const wsRef           = useRef(null);
  const reconnectTries  = useRef(0);
  const reconnectTimer  = useRef(null);
  const isMounted       = useRef(true);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams({ role });
    if (userId) params.set('userId', userId);
    return `${WS_BASE_URL}?${params.toString()}`;
  }, [role, userId]);

  const connect = useCallback(() => {
    if (!role) return;

    // Para establishment y client, esperar a que userId esté disponible
    if (role !== 'admin' && !userId) return;

    // No reconectar si ya hay socket abierto o conectándose
    if (wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const ws = new WebSocket(buildUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMounted.current) return;
      setConnected(true);
      reconnectTries.current = 0;
    };

    ws.onmessage = (event) => {
      if (!isMounted.current) return;
      try {
        const data = JSON.parse(event.data);

        // El mensaje 'connected' es de sistema, no lo mostramos como notificación
        if (data.type === 'connected') return;

        setNotifications((prev) => [
          { ...data, id: crypto.randomUUID(), read: false },
          ...prev,
        ]);
      } catch {
        console.warn('[WS] Mensaje no parseable:', event.data);
      }
    };

    ws.onclose = (event) => {
      if (!isMounted.current) return;
      setConnected(false);

      // Código 1008 = rechazado por el servidor (rol incorrecto), no reconectar
      if (event.code === 1008) {
        console.warn('[WS] Conexión rechazada por el servidor:', event.reason);
        return;
      }

      // Reconexión automática con límite de intentos
      if (reconnectTries.current < MAX_RECONNECT_TRIES) {
        reconnectTries.current += 1;
        console.log(`[WS] Reconectando (${reconnectTries.current}/${MAX_RECONNECT_TRIES})...`);
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [buildUrl, role]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close(1000, 'Component unmounted');
    };
  }, [connect]);

  // Marcar notificación como leída
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Eliminar una notificación
  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Limpiar todas
  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { connected, notifications, unreadCount, markAsRead, clearNotification, clearAll };
}