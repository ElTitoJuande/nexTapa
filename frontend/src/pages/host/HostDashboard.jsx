// src/pages/host/HostDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  House, CircleCheck, CircleDashed, Wifi, WifiOff,
  BellRing, CalendarClock, Users, Clock,
  CheckCheck, X, ChevronDown, ChevronUp,
  Gift, Ban, MapPin, Phone, FileText, Store,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { establishmentService } from "../../services/establishmentService";
import { reservationService } from "../../services/reservationService";
import { useWebSocket } from "../../hooks/useWebSocket";
import { toastService } from "../../services/toastService";
import { HostEstablishmentSettings } from "./HostEstablishmentSettings";

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

const formatLocation = (address) => {
  if (!address) return "Pendiente de completar";
  const parts = [address.street, address.number, address.postalCode, address.city, address.province].filter(Boolean);
  return parts.length ? parts.join(", ") : "Pendiente de completar";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
};

const formatTime = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

const inputClass = "w-full rounded-xl border border-[#2a2a2a] bg-[#080808] px-3 py-2.5 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-[#f77827]/60 focus:ring-2 focus:ring-[#f77827]/20";
const labelClass = "mb-1 block text-sm font-medium text-slate-400";

// ─────────────────────────────────────────────
//  WsStatusBadge
// ─────────────────────────────────────────────

function WsStatusBadge({ connected }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-bold tracking-wide transition-colors sm:text-xs ${
      connected
        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
        : "border-rose-500/40 bg-rose-500/15 text-rose-300"
    }`}>
      {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
      {connected ? "Tiempo real activo" : "Sin conexión"}
    </span>
  );
}

// ─────────────────────────────────────────────
//  Formulario de creación de establecimiento
// ─────────────────────────────────────────────

function CreateEstablishmentForm({ user, onCreated }) {
  const [form, setForm] = useState({
    name: user?.businessName || "",
    description: "",
    phone: user?.phone || "",
    address: { street: "", number: "", city: "", province: "", postalCode: "", country: "España" },
    location: { coordinates: [-3.7038, 40.4168] },
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.description || !form.phone ||
        !form.address.street || !form.address.city ||
        !form.address.province || !form.address.postalCode) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name:        form.name,
        description: form.description,
        phone:       form.phone,
        address:     form.address,
        location:    { type: "Point", coordinates: form.location.coordinates },
        owner:       user?._id || user?.id,
      };
      const response = await establishmentService.create(payload);
      toastService.success("¡Establecimiento creado! Pendiente de verificación por el admin.");
      onCreated(response?.data);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el establecimiento.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="rounded-[22px] border border-[#2a2a2a] p-4 sm:p-6"
      style={{ background: "linear-gradient(180deg, rgba(14, 14, 14, 0.96), rgba(8, 8, 8, 0.96))" }}
    >
      <div className="mb-4 sm:mb-6">
        <h2 className="m-0 text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
          Da de alta tu local
        </h2>
        <p className="mt-1.5 text-sm text-slate-400">
          Completa estos datos para activar tu panel de gestion.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

        {/* Nombre y descripción */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              <Store size={13} className="mb-0.5 mr-1 inline text-[#f77827]" />
              Nombre del local *
            </label>
            <input
              className={inputClass}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej. Taberna La Plaza"
              required
            />
          </div>
          <div>
            <label className={labelClass}>
              <Phone size={13} className="mb-0.5 mr-1 inline text-[#f77827]" />
              Teléfono *
            </label>
            <input
              className={inputClass}
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="699 123 456"
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <FileText size={13} className="mb-0.5 mr-1 inline text-[#f77827]" />
            Descripción *
          </label>
          <textarea
            className={`${inputClass} min-h-24 resize-y`}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe tu local, especialidades, ambiente..."
            required
          />
        </div>

        {/* Dirección */}
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
            <MapPin size={14} className="text-[#f77827]" />
            Dirección
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Calle *</label>
              <input className={inputClass} name="street" value={form.address.street}
                onChange={handleAddressChange} placeholder="Calle Mayor" required />
            </div>
            <div>
              <label className={labelClass}>Número</label>
              <input className={inputClass} name="number" value={form.address.number}
                onChange={handleAddressChange} placeholder="15" />
            </div>
            <div>
              <label className={labelClass}>Ciudad *</label>
              <input className={inputClass} name="city" value={form.address.city}
                onChange={handleAddressChange} placeholder="Barcelona" required />
            </div>
            <div>
              <label className={labelClass}>Provincia *</label>
              <input className={inputClass} name="province" value={form.address.province}
                onChange={handleAddressChange} placeholder="Barcelona" required />
            </div>
            <div>
              <label className={labelClass}>Código postal *</label>
              <input className={inputClass} name="postalCode" value={form.address.postalCode}
                onChange={handleAddressChange} placeholder="08001" required />
            </div>
            <div>
              <label className={labelClass}>País</label>
              <input className={inputClass} name="country" value={form.address.country}
                onChange={handleAddressChange} placeholder="España" />
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#f77827] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#e06a1e] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Creando..." : "Crear establecimiento"}
          </button>
          <p className="text-xs text-slate-500">
            Tras crearlo quedará pendiente de verificación por el administrador.
          </p>
        </div>
      </form>
    </section>
  );
}

// ─────────────────────────────────────────────
//  ReservationCard
// ─────────────────────────────────────────────

function ReservationCard({ reservation, onConfirm, onReject, onComplete, onCancelHost }) {
  const [expanded, setExpanded]   = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason]       = useState("");

  const statusConfig = {
    pending:   { label: "Pendiente",  color: "border-amber-500/40 bg-amber-500/15 text-amber-300" },
    confirmed: { label: "Confirmada", color: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" },
    rejected:  { label: "Rechazada",  color: "border-rose-500/40 bg-rose-500/15 text-rose-300" },
    completed: { label: "Completada", color: "border-slate-500/40 bg-slate-500/15 text-slate-400" },
    cancelled: { label: "Cancelada",  color: "border-slate-500/40 bg-slate-500/15 text-slate-500" },
  };

  const cfg = statusConfig[reservation.status] || statusConfig.pending;

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#080808]/80 transition-all">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-col gap-2 px-4 py-3.5 text-left sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-start gap-3">
          {reservation._isNew && (
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#f77827]" />
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-100">
              {reservation.client?.name || reservation.clientName || "Cliente"}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              {formatDate(reservation.date)} · {reservation.time} · {reservation.guests}{" "}
              {reservation.guests === 1 ? "persona" : "personas"}
            </p>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-1.5 sm:w-auto sm:justify-end sm:gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.color}`}>
            {cfg.label}
          </span>
          {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#232323] px-4 pb-4 pt-3">
          <div className="mb-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-[#232323] bg-[#0c0c0c] px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Fecha</p>
              <p className="font-medium text-slate-200">{formatDate(reservation.date)}</p>
            </div>
            <div className="rounded-xl border border-[#232323] bg-[#0c0c0c] px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Hora</p>
              <p className="font-medium text-slate-200">{reservation.time}</p>
            </div>
            <div className="rounded-xl border border-[#232323] bg-[#0c0c0c] px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Comensales</p>
              <p className="font-medium text-slate-200">{reservation.guests}</p>
            </div>
            <div className="rounded-xl border border-[#232323] bg-[#0c0c0c] px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Recibida</p>
              <p className="font-medium text-slate-200">{formatTime(reservation.timestamp || reservation.createdAt)}</p>
            </div>
          </div>

          {reservation.notes && (
            <div className="mb-3 rounded-xl border border-[#232323] bg-[#0c0c0c] px-3 py-2 text-sm text-slate-300">
              <p className="mb-0.5 text-xs text-slate-500">Nota del cliente</p>
              {reservation.notes}
            </div>
          )}

          {/* FLUJO 1: pendiente */}
          {reservation.status === "pending" && (
            <div className="space-y-2">
              {rejecting ? (
                <div className="space-y-2">
                  <textarea
                    placeholder="Motivo del rechazo (opcional)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-[#2a2a2a] bg-[#080808] px-3 py-2 text-sm text-slate-100 outline-none focus:border-rose-500/50"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => setRejecting(false)}
                      className="w-full rounded-xl border border-[#2a2a2a] py-2 text-sm text-slate-400 hover:bg-[#171717] sm:flex-1">
                      Volver
                    </button>
                    <button onClick={() => onReject(reservation._id, reason)}
                      className="w-full rounded-xl border border-rose-500/50 bg-rose-500/10 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 sm:flex-1">
                      Confirmar rechazo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button onClick={() => setRejecting(true)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 sm:w-auto">
                    <X size={14} /> Rechazar
                  </button>
                  <button onClick={() => onConfirm(reservation._id)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#f77827] py-2 text-sm font-bold text-white hover:bg-[#e06a1e] sm:flex-1">
                    <CheckCheck size={14} /> Confirmar reserva
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FLUJO 2: confirmada */}
          {reservation.status === "confirmed" && (
            <div className="space-y-2">
              <p className="mb-1 text-xs text-slate-500">Gestión del cupón:</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button onClick={() => onCancelHost(reservation._id)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-600/40 bg-slate-600/10 px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-600/20 sm:w-auto">
                  <Ban size={14} /> Cancelar
                </button>
                <button onClick={() => onComplete(reservation._id)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-sm font-bold text-white hover:bg-emerald-500 sm:flex-1">
                  <Gift size={14} /> Finalizar y enviar cupón 5%
                </button>
              </div>
              <p className="text-xs text-slate-600">Cancelar — sin cupón · Finalizar — envía cupón 5% al cliente</p>
            </div>
          )}

          {reservation.status === "completed" && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
              ✅ Cupón del 5% enviado al cliente
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Dashboard principal
// ─────────────────────────────────────────────

export function HostDashboard() {
  const { user } = useAuth();

  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [establishment, setEstablishment] = useState(null);
  const [reservations, setReservations]   = useState([]);
  const [filter, setFilter]               = useState("pending");

  const { connected, notifications, clearNotification } = useWebSocket({
    role:   "establishment",
    userId: user?._id || user?.id,
  });

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await establishmentService.getMine();
        const est = response?.data || null;
        setEstablishment(est);

        if (est?._id) {
          const res = await reservationService.getByEstablishment(est._id);
          setReservations(res?.data || []);
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          setEstablishment(null);
        } else {
          setError(err?.response?.data?.message || "No se pudo cargar tu dashboard");
        }
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // ── Notificaciones WS ─────────────────────────────────────────────────────
  useEffect(() => {
    notifications.forEach((notif) => {
      if (notif.type === "new_reservation") {
        setReservations((prev) => {
          const exists = prev.some((r) => r._id === notif.reservationId);
          if (exists) return prev;
          return [{ ...notif, _id: notif.reservationId, status: "pending", _isNew: true }, ...prev];
        });
        clearNotification(notif.id);
      }
      if (notif.type === "reservation_cancelled") {
        setReservations((prev) =>
          prev.map((r) => r._id === notif.reservationId ? { ...r, status: "cancelled" } : r)
        );
        clearNotification(notif.id);
      }
    });
  }, [notifications, clearNotification]);

  // ── Acciones reservas ─────────────────────────────────────────────────────
  const handleConfirm = async (reservationId) => {
    try {
      await reservationService.confirm(reservationId);
      setReservations((prev) => prev.map((r) =>
        r._id === reservationId ? { ...r, status: "confirmed", _isNew: false } : r
      ));
      toastService.success("Reserva confirmada — email enviado al cliente");
    } catch {
      toastService.error("No se pudo confirmar la reserva");
    }
  };

  const handleReject = async (reservationId, reason) => {
    try {
      await reservationService.reject(reservationId, reason);
      setReservations((prev) => prev.map((r) =>
        r._id === reservationId ? { ...r, status: "rejected", rejectionReason: reason, _isNew: false } : r
      ));
      toastService.success("Reserva rechazada — email enviado al cliente");
    } catch {
      toastService.error("No se pudo rechazar la reserva");
    }
  };

  const handleComplete = async (reservationId) => {
    try {
      await reservationService.complete(reservationId);
      setReservations((prev) => prev.map((r) =>
        r._id === reservationId ? { ...r, status: "completed" } : r
      ));
      toastService.success("¡Cupón del 5% enviado al cliente!");
    } catch {
      toastService.error("No se pudo finalizar la reserva");
    }
  };

  const handleCancelHost = async (reservationId) => {
    try {
      await reservationService.cancelHost(reservationId);
      setReservations((prev) => prev.map((r) =>
        r._id === reservationId ? { ...r, status: "cancelled" } : r
      ));
      toastService.success("Reserva cancelada");
    } catch {
      toastService.error("No se pudo cancelar la reserva");
    }
  };

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const filteredReservations = useMemo(() => {
    if (filter === "all") return reservations;
    return reservations.filter((r) => r.status === filter);
  }, [reservations, filter]);

  const pendingCount   = reservations.filter((r) => r.status === "pending").length;
  const confirmedCount = reservations.filter((r) => r.status === "confirmed").length;

  return (
    <section className="min-h-screen overflow-x-clip px-2.5 pb-32 pt-4 text-slate-100 sm:px-4 sm:pb-14 sm:pt-8">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <header className="mb-4 flex flex-col items-start gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="m-0 max-w-full break-words text-[1.65rem] font-bold leading-tight tracking-tight sm:text-4xl">Panel Hostelero</h1>
            <p className="mt-1 text-sm text-slate-400 sm:text-base">Hola {user?.name}. Gestiona local, tapas y reservas.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2.5">
            <WsStatusBadge connected={connected} />
            <Link to="/"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[#3a3a3a] bg-[#101010] px-3.5 text-sm font-semibold text-slate-200 no-underline sm:w-auto">
              <House size={16} className="mr-1.5" />
              Ir a zona publica
            </Link>
          </div>
        </header>

        {/* Badge estado local */}
        <div className="mb-4 rounded-2xl border border-[#2a2a2a] bg-[#101010]/70 p-4">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold tracking-wide ${
            establishment
              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
              : "border-amber-500/40 bg-amber-500/20 text-amber-300"
          }`}>
            {establishment ? <CircleCheck size={14} /> : <CircleDashed size={14} />}
            {establishment ? "Local detectado" : "Local pendiente"}
          </span>
        </div>

        {loading && (
          <div className="grid min-h-40 place-items-center text-slate-400">
            Cargando estado del local...
          </div>
        )}
        {!loading && error && <p className="mt-3.5 text-rose-300">{error}</p>}

        {/* ── Sin establecimiento: formulario de creación ── */}
        {!loading && !error && !establishment && (
          <CreateEstablishmentForm
            user={user}
            onCreated={(est) => setEstablishment(est)}
          />
        )}

        {/* ── Con establecimiento: dashboard completo ── */}
        {!loading && !error && establishment && (
          <div className="space-y-4">

            {/* Info establecimiento */}
            <section
              className="rounded-[22px] border border-[#2b2b2b] p-3.5 sm:p-6"
              style={{ background: "linear-gradient(180deg, rgba(14, 14, 14, 0.96), rgba(8, 8, 8, 0.96))" }}
            >
              <h2 className="m-0 max-w-full break-words text-xl font-bold tracking-tight sm:text-3xl">{establishment.name}</h2>
              <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-slate-500">Resumen rapido</p>
              <dl className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0b0b0b]/80 px-3 py-2.5">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">Direccion</dt>
                  <dd className="mt-1 break-words text-sm text-slate-100">{formatLocation(establishment.address)}</dd>
                </div>
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0b0b0b]/80 px-3 py-2.5">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">Telefono</dt>
                  <dd className="mt-1 text-sm text-slate-100">{establishment.phone || "Pendiente"}</dd>
                </div>
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0b0b0b]/80 px-3 py-2.5 sm:col-span-2">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">Estado</dt>
                  <dd className="mt-1 text-sm text-slate-100">
                    {establishment.active ? "Activo" : "Desactivado"} · {establishment.verified ? "Verificado" : "Pendiente"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Métricas */}
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3">
              {[
                { icon: <BellRing size={18} />,     label: "Pendientes",  value: pendingCount,        color: "text-amber-400" },
                { icon: <CalendarClock size={18} />, label: "Confirmadas", value: confirmedCount,      color: "text-emerald-400" },
                { icon: <Users size={18} />,         label: "Total",       value: reservations.length, color: "text-[#f77827]" },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="rounded-2xl border border-[#2a2a2a] bg-[#080808]/90 px-3.5 py-3.5">
                  <div className={`mb-1 ${color}`}>{icon}</div>
                  <p className="text-2xl font-bold text-slate-100">{value}</p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Reservas */}
            <section className="rounded-[22px] border border-[#2a2a2a] bg-[#090909]/90 p-3.5 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="m-0 flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg">
                  <Clock size={18} className="text-[#f77827]" />
                  Reservas activas
                  {pendingCount > 0 && (
                    <span className="rounded-full bg-[#f77827] px-2 py-0.5 text-xs font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </h3>
                <div className="w-full overflow-x-auto sm:w-auto">
                  <div className="inline-flex min-w-max rounded-xl border border-[#2a2a2a] bg-[#080808] p-0.5 text-xs font-semibold">
                    {[
                      { key: "pending",   label: "Pendientes" },
                      { key: "confirmed", label: "Confirmadas" },
                      { key: "all",       label: "Todas" },
                    ].map(({ key, label }) => (
                      <button key={key} onClick={() => setFilter(key)}
                        className={`rounded-[10px] px-3 py-1.5 transition-colors ${
                          filter === key ? "bg-[#f77827] text-white" : "text-slate-400 hover:text-slate-200"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredReservations.length === 0 ? (
                <div className="grid min-h-32 place-items-center text-slate-500">
                  <div className="text-center">
                    <CalendarClock size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      {filter === "pending"   ? "No hay reservas pendientes"  :
                       filter === "confirmed" ? "No hay reservas confirmadas" :
                       "No hay reservas registradas"}
                    </p>
                    {!connected && (
                      <p className="mt-1 text-xs text-rose-400/70">
                        Sin conexión en tiempo real — las nuevas reservas no aparecerán automáticamente
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredReservations.map((reservation, idx) => (
                    <ReservationCard
                      key={reservation._id || idx}
                      reservation={reservation}
                      onConfirm={handleConfirm}
                      onReject={handleReject}
                      onComplete={handleComplete}
                      onCancelHost={handleCancelHost}
                    />
                  ))}
                </div>
              )}
            </section>

            <HostEstablishmentSettings
              establishment={establishment}
              onEstablishmentUpdated={setEstablishment}
            />
          </div>
        )}
      </div>
    </section>
  );
}
