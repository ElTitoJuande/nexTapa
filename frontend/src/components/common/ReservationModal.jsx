// src/components/common/ReservationModal.jsx
import { useState } from "react";
import { X, CalendarDays, Clock, Users, MessageSquare, Loader2 } from "lucide-react";
import { reservationService } from "../../services/reservationService";

function generateTimeSlots(open = "09:00", close = "23:00") {
  const slots = [];
  const [openH, openM]   = open.split(":").map(Number);
  const [closeH, closeM] = close.split(":").map(Number);
  let h = openH, m = openM;
  while (h < closeH || (h === closeH && m < closeM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) { m = 0; h++; }
  }
  return slots;
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}
function getMaxDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().split("T")[0];
}

const inputCls =
  "w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50";

export function ReservationModal({ establishment, onClose, onSuccess }) {
  const [form, setForm] = useState({
    date:   getTodayStr(),
    time:   "08:00",
    guests: 2,
    notes:  "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [done, setDone]             = useState(false);

  // Slots fijos 08:00–23:30 — cuando el horario del establecimiento esté listo
  // sustituir por: generateTimeSlots(todaySchedule.open, todaySchedule.close)
  const timeSlots = generateTimeSlots("08:00", "24:00");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.date)                              { setError("Selecciona una fecha"); return; }
    if (!form.time)                              { setError("Selecciona una hora"); return; }
    if (form.guests < 1 || form.guests > 50)    { setError("El número de comensales debe estar entre 1 y 50"); return; }

    try {
      setSubmitting(true);
      await reservationService.create({
        establishmentId: establishment._id,
        date:            form.date,
        time:            form.time,
        guests:          Number(form.guests),
        notes:           form.notes.trim(),
      });
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo realizar la reserva. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center">
      <div
        className="w-full max-w-md rounded-t-3xl border border-neutral-800 bg-neutral-950 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-neutral-700 sm:hidden" />

        <div className="flex items-start justify-between px-5 pb-3 pt-5">
          <div>
            <h2 className="text-lg font-bold text-white">Hacer una reserva</h2>
            <p className="mt-0.5 text-sm text-neutral-400">{establishment?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-6">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-orange-500/15">
                <CalendarDays size={26} className="text-orange-400" />
              </div>
              <div>
                <p className="text-base font-bold text-white">¡Reserva enviada!</p>
                <p className="mt-1 text-sm text-neutral-400">
                  El establecimiento recibirá tu solicitud y te confirmará en breve.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Aceptar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    <CalendarDays size={13} /> Fecha
                  </span>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    min={getTodayStr()}
                    max={getMaxDateStr()}
                    onChange={handleChange}
                    className={inputCls}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    <Clock size={13} /> Hora
                  </span>
                  <select
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className={inputCls}
                    required
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  <Users size={13} /> Comensales
                </span>
                <div className="flex items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, guests: Math.max(1, p.guests - 1) }))}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-neutral-800 text-white transition hover:bg-orange-500 disabled:opacity-40"
                    disabled={form.guests <= 1}
                  >−</button>
                  <span className="flex-1 text-center text-sm font-bold text-white">
                    {form.guests} {form.guests === 1 ? "persona" : "personas"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, guests: Math.min(50, p.guests + 1) }))}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-neutral-800 text-white transition hover:bg-orange-500 disabled:opacity-40"
                    disabled={form.guests >= 50}
                  >+</button>
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  <MessageSquare size={13} /> Nota (opcional)
                </span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  maxLength={300}
                  placeholder="Alergias, ocasión especial, preferencias de mesa..."
                  className={`${inputCls} resize-none`}
                />
                <span className="text-right text-xs text-neutral-600">{form.notes.length}/300</span>
              </label>

              {error && (
                <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? <><Loader2 size={16} className="animate-spin" /> Enviando reserva...</>
                  : "Confirmar reserva"
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}