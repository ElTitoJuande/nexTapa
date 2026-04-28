// src/pages/admin/adminComponents/WsStatusBadge.jsx
import { Wifi, WifiOff } from "lucide-react";

export function WsStatusBadge({ connected }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold tracking-wide transition-colors ${
      connected
        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
        : "border-rose-500/40 bg-rose-500/15 text-rose-300"
    }`}>
      {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
      {connected ? "Tiempo real activo" : "Sin conexión"}
    </span>
  );
}