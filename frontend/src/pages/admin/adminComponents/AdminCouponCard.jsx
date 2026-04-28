// src/pages/admin/adminComponents/AdminCouponCard.jsx
import { useState } from "react";
import { Ticket, CheckCheck, X, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

const formatTime = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

export function AdminCouponCard({ notif, onValidate, onReject, onDismiss }) {
  const [expanded, setExpanded]   = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason]       = useState("");
  const [loading, setLoading]     = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    await onValidate(notif);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await onReject(notif, reason);
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-[#2a374f] bg-[#0d1219]/80 overflow-hidden">

      {/* ── Cabecera ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <Ticket size={15} className="text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-100">
              {notif.discountAmount?.toFixed(2)} € — {notif.clientName}
            </p>
            <p className="text-xs text-slate-500">
              {notif.establishment} · {formatTime(notif.timestamp)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
            Cupón
          </span>
          {expanded
            ? <ChevronUp size={14} className="text-slate-500" />
            : <ChevronDown size={14} className="text-slate-500" />
          }
        </div>
      </button>

      {/* ── Detalle expandible ────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-[#1e2d42] px-4 pb-4 pt-3 space-y-3">

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-slate-500">Cliente</p>
              <p className="text-slate-200">{notif.clientName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-slate-200 truncate">{notif.clientEmail || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Establecimiento</p>
              <p className="text-slate-200">{notif.establishment}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Cuenta base</p>
              <p className="text-slate-200">{notif.baseAmount?.toFixed(2)} €</p>
            </div>
          </div>

          {/* Descuento destacado */}
          <div className="rounded-xl border border-[#1e2d42] bg-[#080d13] px-3 py-2.5">
            <p className="text-xs text-slate-500">Descuento a activar</p>
            <p className="text-lg font-bold text-emerald-400">{notif.discountAmount?.toFixed(2)} €</p>
            <p className="text-xs text-slate-600">5% de {notif.baseAmount?.toFixed(2)} €</p>
          </div>

          {/* Acciones */}
          {rejecting ? (
            <div className="space-y-2">
              <textarea
                placeholder="Motivo del rechazo (opcional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border border-[#2a374f] bg-[#0d1219] px-3 py-2 text-sm text-slate-100 outline-none focus:border-rose-500/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setRejecting(false)}
                  className="flex-1 rounded-xl border border-[#2a374f] py-2 text-xs text-slate-400 hover:bg-[#1a2235] transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-rose-500/50 bg-rose-500/10 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-60 transition-colors"
                >
                  Confirmar rechazo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setRejecting(true)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                <X size={13} /> Rechazar
              </button>
              <button
                onClick={handleValidate}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors"
              >
                {loading
                  ? <><RefreshCw size={13} className="animate-spin" /> Validando...</>
                  : <><CheckCheck size={13} /> Validar cupón</>
                }
              </button>
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