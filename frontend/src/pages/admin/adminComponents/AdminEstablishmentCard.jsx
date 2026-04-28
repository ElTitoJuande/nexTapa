// src/pages/admin/adminComponents/AdminEstablishmentCard.jsx
import { useState } from "react";
import { Store, CheckCheck, X, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

const formatTime = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

export function AdminEstablishmentCard({ notif, onVerify, onReject, onDismiss }) {
  const [expanded, setExpanded]   = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await onVerify(notif); // llama a verify en backend + elimina de la lista
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(notif); // llama a reject en backend + elimina de la lista
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#2a374f] bg-[#0d1219]/80 overflow-hidden">

      {/* ── Cabecera ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#f77827]/30 bg-[#f77827]/10">
            <Store size={15} className="text-[#f77827]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-100">{notif.name}</p>
            <p className="text-xs text-slate-500">{formatTime(notif.timestamp)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-300">
            Pendiente
          </span>
          {expanded
            ? <ChevronUp size={14} className="text-slate-500" />
            : <ChevronDown size={14} className="text-slate-500" />
          }
        </div>
      </button>

      {/* ── Detalle expandible ── */}
      {expanded && (
        <div className="border-t border-[#1e2d42] px-4 pb-4 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-slate-200 truncate">{notif.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">ID</p>
              <p className="font-mono text-xs text-slate-400 truncate">{notif.establishmentId}</p>
            </div>
          </div>

          {!rejecting ? (
            <div className="flex gap-2">
              <button
                onClick={() => setRejecting(true)}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-60"
              >
                <X size={13} /> Rechazar alta
              </button>
              <button
                onClick={handleVerify}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#f77827] py-2 text-xs font-bold text-white hover:bg-[#e06a1e] disabled:opacity-60 transition-colors"
              >
                {loading
                  ? <><RefreshCw size={13} className="animate-spin" /> Verificando...</>
                  : <><CheckCheck size={13} /> Verificar establecimiento</>
                }
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                ¿Confirmar rechazo del alta de <span className="font-bold text-slate-200">{notif.name}</span>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setRejecting(false)}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-[#2a374f] py-2 text-xs text-slate-400 hover:bg-[#1a2235] transition-colors disabled:opacity-60"
                >
                  Volver
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-rose-500/50 bg-rose-500/10 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-60 transition-colors"
                >
                  {loading
                    ? <><RefreshCw size={13} className="animate-spin" /> Rechazando...</>
                    : "Confirmar rechazo"
                  }
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => onDismiss(notif.id)}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors pt-1"
          >
            Descartar notificación
          </button>
        </div>
      )}
    </div>
  );
}