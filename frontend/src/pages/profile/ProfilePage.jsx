// src/pages/profile/ProfilePage.jsx
import { useEffect, useRef, useState } from "react";
import {
  AtSign,
  Camera,
  Mail,
  Phone,
  Save,
  UserRound,
  Ticket,
  CheckCircle2,
  Clock3,
  XCircle,
  Sparkles,
  Trash2,
  Star,
} from "lucide-react";
import Header from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { photoService } from "../../services/photoService";
import { reviewService } from "../../services/reviewService";
import { useWebSocket } from "../../hooks/useWebSocket";
import { couponService } from "../../services/couponService";

// ─────────────────────────────────────────────
//  Estilos compartidos
// ─────────────────────────────────────────────

const shellStyle = {
  background:
    "radial-gradient(900px 500px at 85% -10%, rgba(249, 115, 22, 0.12), transparent 60%), linear-gradient(180deg, #0f0f10 0%, #0a0a0b 100%)",
};

const inputClassName =
  "w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25";

const normalizeUsername = (value) =>
  value.trim().replace(/^@+/, "").replace(/\s+/g, "").toLowerCase();

// ─────────────────────────────────────────────
//  Helpers de cupones
// ─────────────────────────────────────────────

const couponStatusConfig = {
  active: {
    label: "Disponible",
    icon: <CheckCircle2 size={13} />,
    color: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  },
  used: {
    label: "Usado",
    icon: <XCircle size={13} />,
    color: "border-neutral-600/40 bg-neutral-800/40 text-neutral-500",
  },
  pending_admin: {
    label: "Pendiente",
    icon: <Clock3 size={13} />,
    color: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  },
  expired: {
    label: "Caducado",
    icon: <XCircle size={13} />,
    color: "border-rose-500/40 bg-rose-500/15 text-rose-400",
  },
  rejected: {
    label: "Rechazado",
    icon: <XCircle size={13} />,
    color: "border-rose-500/40 bg-rose-500/15 text-rose-400",
  },
};

const formatExpiry = (date) => {
  if (!date) {
    return null;
  }
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ─────────────────────────────────────────────
//  StarDisplay — estrellas estáticas
// ─────────────────────────────────────────────

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={14}
        className={
          n <= rating
            ? "fill-amber-400 text-amber-400"
            : "fill-transparent text-zinc-600"
        }
      />
    ))}
  </div>
);

// ─────────────────────────────────────────────
//  Subcomponente — tarjeta de cupón
// ─────────────────────────────────────────────

function CouponCard({ coupon, isNew, onUse }) {
  const cfg =
    couponStatusConfig[coupon.status] || couponStatusConfig.pending_admin;

  return (
    <div
      className={`relative rounded-2xl border p-4 transition-all ${
        isNew
          ? "border-orange-500/50 bg-orange-500/5 shadow-[0_0_20px_rgba(249,115,22,0.08)]"
          : "border-neutral-800 bg-neutral-900/60"
      }`}
    >
      {isNew && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500">
          <span className="h-2 w-2 animate-ping rounded-full bg-orange-300" />
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-500/30 bg-orange-500/10">
            <Ticket size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {coupon.establishment?.name || "Establecimiento"}
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">
              Descuento del{" "}
              <span className="font-bold text-orange-400">
                {coupon.discountPercent || 5}%
              </span>{" "}
              en tu próxima visita
            </p>
            {coupon.status === "active" && (
              <p className="mt-1 font-mono text-xs tracking-widest text-neutral-300">
                {coupon.code}
              </p>
            )}
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${cfg.color}`}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {coupon.status === "active" && coupon.expiresAt && (
        <p className="mt-3 border-t border-neutral-800 pt-2.5 text-xs text-neutral-500">
          Válido hasta el{" "}
          <span className="text-neutral-300">
            {formatExpiry(coupon.expiresAt)}
          </span>
        </p>
      )}

      {coupon.status === "active" && (
        <div className="mt-2.5 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-400">
          Muestra el código{" "}
          <span className="font-mono font-bold text-orange-400">
            {coupon.code}
          </span>{" "}
          al establecimiento en tu próxima visita para aplicar el descuento.
        </div>
      )}

      {coupon.status === "active" && onUse && (
        <button
          onClick={() => onUse(coupon._id)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 active:scale-[0.98]"
        >
          <Trash2 size={13} />
          Usar y eliminar cupón
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Subcomponente — toast WS
// ─────────────────────────────────────────────

function CouponToast({ notification, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-500/40 bg-neutral-950 p-4 shadow-xl">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15">
        <Sparkles size={16} className="text-emerald-400" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-white">
          ¡Cupón del {notification.discountPercent || 5}% activado!
        </p>
        <p className="mt-0.5 text-xs text-neutral-400">
          {notification.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-neutral-600 hover:text-neutral-400"
      >
        <XCircle size={16} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Página principal
// ─────────────────────────────────────────────

export function ProfilePage() {
  const { user, refreshUser } = useAuth();

  // ── Formulario de perfil ──────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    avatar: "",
  });
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const avatarInputRef = useRef(null);

  // ── Cupones ───────────────────────────────────────────────────────────────
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [newCouponIds, setNewCouponIds] = useState(new Set());
  const [activeToast, setActiveToast] = useState(null);

  // ── Valoraciones ─────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // ── WebSocket cliente ─────────────────────────────────────────────────────
  const { notifications, clearNotification } = useWebSocket({
    role: "client",
    userId: user?._id,
  });

  // ── Cargar perfil ─────────────────────────────────────────────────────────
  useEffect(() => {
    setForm({
      name: user?.name || "",
      username: user?.username ? `@${user.username}` : "",
      phone: user?.phone || "",
      avatar: user?.avatar || "",
    });
  }, [user]);

  useEffect(() => {
    setAvatarBroken(false);
  }, [form.avatar]);

  // ── Cargar cupones ────────────────────────────────────────────────────────
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) {
      return;
    }
    const load = async () => {
      try {
        setCouponsLoading(true);
        const response = await couponService.getMyCoupons();
        setCoupons(response?.data || []);
      } catch (err) {
        console.error("Error al cargar cupones:", err);
        setCoupons([]);
      } finally {
        setCouponsLoading(false);
      }
    };
    load();
  }, [user?._id, user?.id]);

  // ── Cargar valoraciones ───────────────────────────────────────────────────
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) {
      return;
    }
    const load = async () => {
      try {
        setReviewsLoading(true);
        const data = await reviewService.getMy();
        const seen = new Set();
        const deduped = (data || []).filter((r) => {
          const key =
            r.establishment?._id || r.establishment || r.item?._id || r.item;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
        setReviews(deduped);
      } catch (err) {
        console.error("Error al cargar valoraciones:", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    load();
  }, [user?._id, user?.id]);

  // ── Procesar notificaciones WS ────────────────────────────────────────────
  useEffect(() => {
    notifications.forEach((notif) => {
      if (notif.type === "coupon_activated") {
        const newCoupon = {
          _id: notif.couponId,
          code: notif.code,
          status: "active",
          discountPercent: notif.discountPercent || 5,
          expiresAt: notif.expiresAt,
          establishment: { name: notif.establishmentName || "Establecimiento" },
        };
        setCoupons((prev) => {
          const exists = prev.some((c) => c._id === notif.couponId);
          return exists ? prev : [newCoupon, ...prev];
        });
        setNewCouponIds((prev) => new Set([...prev, notif.couponId]));
        setActiveToast(notif);
        setTimeout(async () => {
          try {
            const response = await couponService.getMyCoupons();
            setCoupons(response?.data || []);
          } catch {
            /* silencioso */
          }
        }, 1500);
        setTimeout(() => {
          setNewCouponIds((prev) => {
            const next = new Set(prev);
            next.delete(notif.couponId);
            return next;
          });
        }, 10000);
        clearNotification(notif.id);
      }
      if (notif.type === "coupon_rejected") {
        setActiveToast({ ...notif, isRejection: true });
        clearNotification(notif.id);
      }
    });
  }, [notifications, clearNotification]);

  // ── Handlers formulario ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
    setError("");
  };

  const handleAvatarFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSuccess("");
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen valido.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setAvatarUploading(true);
      const uploadResponse = await photoService.uploadTemporary(file, {
        folder: "nextapa/avatars",
      });
      const uploadedUrl = uploadResponse?.data?.url;

      if (!uploadedUrl) {
        throw new Error("No se obtuvo URL de la imagen subida.");
      }

      setForm((prev) => ({ ...prev, avatar: uploadedUrl }));
      setAvatarBroken(false);
      setSuccess("Imagen cargada. Pulsa Guardar cambios para confirmar.");
    } catch (uploadError) {
      setError(uploadError?.response?.data?.message || "No se pudo subir la imagen.");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    const userId = user?.id || user?._id;
    if (!userId) {
      setError("No se pudo identificar el usuario actual.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      username: normalizeUsername(form.username) || null,
      phone: form.phone.trim() || null,
      avatar: form.avatar.trim() || null,
    };
    if (!payload.name) {
      setError("El nombre es obligatorio.");
      return;
    }
    try {
      setSubmitting(true);
      await userService.updateUser(userId, payload);
      await refreshUser();
      setSuccess("Perfil actualizado correctamente.");
    } catch (err) {
      const validationErrors = err?.response?.data?.errors;
      setError(
        Array.isArray(validationErrors) && validationErrors.length > 0
          ? validationErrors[0]
          : err?.response?.data?.message || "No se pudo actualizar el perfil.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Usar cupón ────────────────────────────────────────────────────────────
  const handleUseCoupon = async (couponId) => {
    try {
      await couponService.use(couponId);
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
    } catch (err) {
      console.error("Error al usar cupón:", err);
    }
  };

  // ── Borrar valoración ─────────────────────────────────────────────────────
  const handleDeleteReview = async (reviewId) => {
    try {
      setDeletingReviewId(reviewId);
      await reviewService.delete(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error("Error al eliminar valoración:", err);
    } finally {
      setDeletingReviewId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const activeCoupons = coupons.filter((c) => c.status === "active");
  const usedCoupons = coupons.filter((c) => c.status === "used");
  const pendingCoupons = coupons.filter((c) => c.status === "pending_admin");

  return (
    <div className="min-h-screen text-white" style={shellStyle}>
      <Header showSearch={false} />

      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-5">
        {/* ── Cabecera ── */}
        <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 sm:p-6">
          <h1 className="m-0 text-2xl font-bold tracking-tight sm:text-3xl">
            Mi perfil
          </h1>
          <p className="mb-0 mt-1 text-sm text-neutral-400">
            Completa tus datos y consulta tus cupones y valoraciones.
          </p>
        </section>

        {/* ── Formulario de perfil ── */}
        <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-orange-500/50 bg-neutral-900">
              {form.avatar && !avatarBroken ? (
                <img
                  src={form.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  onError={() => setAvatarBroken(true)}
                />
              ) : (
                <UserRound className="h-9 w-9 text-orange-500" />
              )}
            </div>
            <div>
              <p className="m-0 text-lg font-semibold">
                {user?.name || "Cliente"}
              </p>
              <p className="m-0 text-sm text-neutral-400">
                {user?.email || "Sin email"}
              </p>
              <p className="m-0 text-xs uppercase tracking-wide text-neutral-500">
                Rol: {user?.role || "cliente"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-neutral-200">
                Nombre
              </span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                className={inputClassName}
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-neutral-200">
                Nombre de usuario
              </span>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="@usuario"
                  className={`${inputClassName} pl-10`}
                />
              </div>
              <small className="text-xs text-neutral-500">
                Puedes dejarlo vacío si no quieres mostrar username.
              </small>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-neutral-200">
                Teléfono
              </span>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+34 600 000 000"
                  className={`${inputClassName} pl-10`}
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-neutral-200">Avatar</span>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-4 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Camera className="h-4 w-4 text-neutral-400" />
                {avatarUploading ? "Subiendo imagen..." : "Seleccionar imagen del ordenador"}
              </button>
              <small className="text-xs text-neutral-500">
                Formatos permitidos: JPG, PNG o WEBP. Maximo 5MB.
              </small>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-neutral-200">
                Correo electrónico
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className={`${inputClassName} cursor-not-allowed pl-10 opacity-70`}
                />
              </div>
            </label>

            {error && (
              <p className="m-0 rounded-xl border border-rose-400/40 bg-rose-900/20 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            )}
            {success && (
              <p className="m-0 rounded-xl border border-emerald-400/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-0 bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {submitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </section>

        {/* ── Mis valoraciones ── */}
        <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="m-0 flex items-center gap-2 text-xl font-bold tracking-tight">
              <Star size={20} className="text-amber-400" />
              Mis valoraciones
              {reviews.length > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                  {reviews.length}
                </span>
              )}
            </h2>
            <p className="m-0 mt-1 text-xs text-neutral-500">
              Establecimientos y tapas que has valorado
            </p>
          </div>

          {reviewsLoading ? (
            <div className="grid min-h-24 place-items-center text-sm text-neutral-500">
              Cargando valoraciones...
            </div>
          ) : reviews.length === 0 ? (
            <div className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-neutral-800 text-center">
              <div>
                <Star size={28} className="mx-auto mb-2 text-neutral-700" />
                <p className="text-sm text-neutral-500">
                  Aún no has valorado nada
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  Visita un establecimiento o tapa y deja tu puntuación
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10">
                      <Star size={16} className="text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {r.establishment?.name || r.item?.name || "—"}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {r.establishment
                          ? "Establecimiento"
                          : `Tapa · ${r.item?.establishment?.name || ""}`}{" "}
                        ·{" "}
                        {new Date(r.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StarDisplay rating={r.rating} />
                    <button
                      onClick={() => handleDeleteReview(r._id)}
                      disabled={deletingReviewId === r._id}
                      className="text-neutral-600 hover:text-rose-400 transition-colors disabled:opacity-40"
                      title="Eliminar valoración"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Cupones ── */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 flex items-center gap-2 text-xl font-bold tracking-tight">
                <Ticket size={20} className="text-orange-400" />
                Mis cupones
                {activeCoupons.length > 0 && (
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                    {activeCoupons.length}
                  </span>
                )}
              </h2>
              <p className="m-0 mt-1 text-xs text-neutral-500">
                Gana cupones completando reservas en los establecimientos
              </p>
            </div>
          </div>

          {couponsLoading ? (
            <div className="grid min-h-24 place-items-center text-sm text-neutral-500">
              Cargando cupones...
            </div>
          ) : coupons.length === 0 ? (
            <div className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-neutral-800 text-center">
              <div>
                <Ticket size={28} className="mx-auto mb-2 text-neutral-700" />
                <p className="text-sm text-neutral-500">
                  Aún no tienes cupones
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  Completa una reserva para ganar tu primer descuento
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCoupons.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Disponibles — {activeCoupons.length}
                  </p>
                  <div className="space-y-2.5">
                    {activeCoupons.map((c) => (
                      <CouponCard
                        key={c._id}
                        coupon={c}
                        isNew={newCouponIds.has(c._id)}
                        onUse={handleUseCoupon}
                      />
                    ))}
                  </div>
                </div>
              )}
              {pendingCoupons.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Pendientes de validación — {pendingCoupons.length}
                  </p>
                  <div className="space-y-2.5">
                    {pendingCoupons.map((c) => (
                      <CouponCard key={c._id} coupon={c} isNew={false} />
                    ))}
                  </div>
                </div>
              )}
              {usedCoupons.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Usados — {usedCoupons.length}
                  </p>
                  <div className="space-y-2.5">
                    {usedCoupons.map((c) => (
                      <CouponCard key={c._id} coupon={c} isNew={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {activeToast && (
        <CouponToast
          notification={activeToast}
          onClose={() => setActiveToast(null)}
        />
      )}
    </div>
  );
}
