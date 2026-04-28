// src/pages/admin/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Ticket,
  Bell,
  UtensilsCrossed,
  Users,
  ShieldCheck,
  Star,
  ChevronRight,
  UserCheck,
  Building2,
} from "lucide-react";
import { useWebSocket } from "../../hooks/useWebSocket";
import { couponService } from "../../services/couponService";
import { establishmentService } from "../../services/establishmentService";
import { WsStatusBadge } from "./adminComponents/WsStatusBadge";
import { AdminEstablishmentCard } from "./adminComponents/AdminEstablishmentCard";
import { AdminCouponCard } from "./adminComponents/AdminCouponCard";
import { api } from "../../services/api";

const shellStyle = {
  background:
    "radial-gradient(900px 500px at 90% -10%, rgba(255,116,43,0.10), transparent 55%), linear-gradient(180deg,#0d1219,#080d13 80%)",
};

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
  loading,
  accent,
}) => (
  <div
    className="relative rounded-2xl border bg-[#0d1219]/90 p-4 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
    style={{ borderColor: accent ? `${accent}30` : "#2a374f" }}
  >
    {accent && (
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${accent}, transparent 70%)`,
        }}
      />
    )}
    <div className={`rounded-xl p-2 w-fit ${iconBg}`}>
      <Icon size={14} className={iconColor} />
    </div>
    {loading ? (
      <div className="admin-stat-loading mt-2 w-14 h-6" />
    ) : (
      <p className="mt-2 text-2xl font-black text-white tracking-tight leading-none">
        {value ?? "—"}
      </p>
    )}
    <p className="mt-1 text-xs font-semibold text-slate-300">{label}</p>
    {sub && <p className="mt-0.5 text-[10px] text-slate-500">{sub}</p>}
  </div>
);

// ── QuickAction ───────────────────────────────────────────────────────────────
const QuickAction = ({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  sub,
  onClick,
  disabled,
  badge,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="group flex items-center gap-3 rounded-2xl border border-[#2a374f] bg-[#0d1219]/80 px-4 py-3 text-left w-full transition-all duration-200 hover:border-[#f77827]/40 hover:bg-[#0f1520] disabled:opacity-35 disabled:cursor-not-allowed"
  >
    <span
      className={`rounded-xl p-2 shrink-0 ${iconBg} transition-transform duration-200 group-hover:scale-110`}
    >
      <Icon size={14} className={iconColor} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2">
        <p className="text-sm font-bold text-slate-100 truncate">{label}</p>
        {badge != null && badge > 0 && (
          <span className="rounded-full bg-[#f77827] px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
            {badge}
          </span>
        )}
      </span>
      {sub && <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>}
    </span>
    {!disabled ? (
      <ChevronRight
        size={13}
        className="text-slate-600 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    ) : (
      <span className="text-[10px] font-semibold text-slate-600 shrink-0">
        Próximo
      </span>
    )}
  </button>
);

// ── SectionHeader ─────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, iconColor, title }) => (
  <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 mb-3">
    <Icon size={10} className={iconColor} />
    {title}
  </h2>
);

// ═════════════════════════════════════════════════════════════════════════════

export const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [establishments, setEstablishments] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [activeTab, setActiveTab] = useState("establishments");

  const { connected, notifications, clearNotification } = useWebSocket({
    role: "admin",
  });

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.get("/admin/stats");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Error cargando stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /* ── Pendientes establecimientos ── */
  useEffect(() => {
    const load = async () => {
      try {
        const response = await establishmentService.getPending();
        const items = response?.data || [];
        setEstablishments(
          items.map((e) => ({
            id: e._id,
            establishmentId: e._id,
            type: "new_establishment_pending",
            name: e.name,
            email: e.email,
            timestamp: e.createdAt,
          })),
        );
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  /* ── Pendientes cupones ── */
  useEffect(() => {
    const load = async () => {
      try {
        const response = await couponService.getPending();
        const items = response?.data || [];
        setCoupons(
          items.map((c) => ({
            id: c._id,
            couponId: c._id,
            type: "coupon_pending_validation",
            clientName: c.client?.name || "Cliente",
            clientEmail: c.client?.email || "",
            establishment: c.establishment?.name || "Establecimiento",
            baseAmount: c.reservation?.totalAmount || c.baseAmount,
            discountAmount: c.discountAmount,
            timestamp: c.createdAt,
          })),
        );
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  /* ── WebSocket ── */
  useEffect(() => {
    notifications.forEach((notif) => {
      if (notif.type === "new_establishment_pending") {
        setEstablishments((prev) => {
          const exists = prev.some(
            (n) => n.establishmentId === notif.establishmentId,
          );
          return exists ? prev : [notif, ...prev];
        });
        clearNotification(notif.id);
      }
      if (notif.type === "coupon_pending_validation") {
        setCoupons((prev) => {
          const exists = prev.some((n) => n.couponId === notif.couponId);
          return exists ? prev : [notif, ...prev];
        });
        clearNotification(notif.id);
      }
    });
  }, [notifications, clearNotification]);

  /* ── Verificar establecimiento → llama al backend y elimina de la lista ── */
  const handleVerifyEstablishment = async (notif) => {
    try {
      await establishmentService.verify(notif.establishmentId); // ← cambia verified:true en MongoDB
      setEstablishments((prev) =>
        prev.filter((n) => n.establishmentId !== notif.establishmentId),
      );
      loadStats();
    } catch (err) {
      console.error("Error al verificar establecimiento:", err);
    }
  };

  /* ── Rechazar establecimiento ── */
  const handleRejectEstablishment = async (notif) => {
    try {
      await establishmentService.reject(notif.establishmentId);
      setEstablishments((prev) =>
        prev.filter((n) => n.establishmentId !== notif.establishmentId),
      );
    } catch (err) {
      console.error("Error al rechazar establecimiento:", err);
    }
  };

  const handleValidateCoupon = async (notif) => {
    try {
      await couponService.validate(notif.couponId);
      setCoupons((prev) => prev.filter((n) => n.couponId !== notif.couponId));
      loadStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectCoupon = async (notif, reason) => {
    try {
      await couponService.reject(notif.couponId, reason);
      setCoupons((prev) => prev.filter((n) => n.couponId !== notif.couponId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = (id) => {
    setEstablishments((prev) => prev.filter((n) => n.id !== id));
    setCoupons((prev) => prev.filter((n) => n.id !== id));
  };

  const totalPending = establishments.length + coupons.length;

  return (
    <div
      className="min-h-screen px-4 pb-16 pt-6 text-slate-100"
      style={shellStyle}
    >
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="m-0 text-3xl font-black tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Panel de administración · nexTapa
            </p>
          </div>
          <WsStatusBadge connected={connected} />
        </header>

        {/* ── Stats en una sola grid 4 cols ── */}
        <div>
          <SectionHeader
            icon={Building2}
            iconColor="text-[#f77827]"
            title="Resumen general"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={Store}
              iconColor="text-[#f77827]"
              iconBg="bg-[#f77827]/10"
              accent="#f77827"
              label="Establecimientos"
              loading={statsLoading}
              value={stats?.establishments}
              sub={`${stats?.establishmentsActive ?? "—"} activos`}
            />
            <StatCard
              icon={ShieldCheck}
              iconColor="text-amber-400"
              iconBg="bg-amber-500/10"
              accent="#f59e0b"
              label="Pendientes"
              loading={statsLoading}
              value={stats?.establishmentsPending}
              sub="esperan revisión"
            />
            <StatCard
              icon={UtensilsCrossed}
              iconColor="text-rose-400"
              iconBg="bg-rose-500/10"
              accent="#f43f5e"
              label="Tapas"
              loading={statsLoading}
              value={stats?.items}
              sub={`${stats?.itemsActive ?? "—"} activas`}
            />
            <StatCard
              icon={Star}
              iconColor="text-amber-400"
              iconBg="bg-amber-500/10"
              accent="#f59e0b"
              label="Valoraciones"
              loading={statsLoading}
              value={stats?.reviews}
              sub="en total"
            />
          </div>
        </div>

        {/* ── Stats usuarios en una fila ── */}
        <div>
          <SectionHeader
            icon={Users}
            iconColor="text-violet-400"
            title="Usuarios"
          />
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={Users}
              iconColor="text-violet-400"
              iconBg="bg-violet-500/10"
              accent="#8b5cf6"
              label="Total"
              loading={statsLoading}
              value={stats?.users}
              sub="cuentas activas"
            />
            <StatCard
              icon={Users}
              iconColor="text-sky-400"
              iconBg="bg-sky-500/10"
              accent="#0ea5e9"
              label="Clientes"
              loading={statsLoading}
              value={stats?.clients}
              sub="registrados"
            />
            <StatCard
              icon={UserCheck}
              iconColor="text-teal-400"
              iconBg="bg-teal-500/10"
              accent="#14b8a6"
              label="Hosteleros"
              loading={statsLoading}
              value={stats?.hosteleros}
              sub={`${stats?.hostelerosVerified ?? "—"} verificados`}
            />
          </div>
        </div>

        {/* ── Acciones rápidas ── */}
        <div>
          <SectionHeader
            icon={ChevronRight}
            iconColor="text-slate-500"
            title="Acciones rápidas"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <QuickAction
              icon={Building2}
              iconColor="text-[#f77827]"
              iconBg="bg-[#f77827]/10"
              label="Establecimientos"
              sub="Ver, verificar y editar"
              badge={establishments.length}
              onClick={() => navigate("/admin/establishments")}
            />
            <QuickAction
              icon={UtensilsCrossed}
              iconColor="text-rose-400"
              iconBg="bg-rose-500/10"
              label="Tapas"
              sub="Catálogo completo"
              onClick={() => navigate("/admin/items")}
            />
            <QuickAction
              icon={Users}
              iconColor="text-violet-400"
              iconBg="bg-violet-500/10"
              label="Usuarios"
              sub="Clientes y hosteleros"
              onClick={() => navigate("/admin/users")}
            />
          </div>
        </div>

        {/* ── Pendientes ── */}
        <div>
          <SectionHeader
            icon={Bell}
            iconColor="text-amber-400"
            title="Pendientes de revisión"
          />

          {totalPending === 0 ? (
            <div className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-[#2a374f] text-center">
              <div>
                <Bell size={24} className="mx-auto mb-2 text-slate-700" />
                <p className="text-sm text-slate-500">
                  Todo al día · No hay pendientes
                </p>
                {!connected && (
                  <p className="mt-1 text-xs text-rose-400/60">
                    Sin conexión — notificaciones no en tiempo real
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#2a374f] bg-[#0a0f18] overflow-hidden">
              <div className="flex border-b border-[#1e2d42]">
                <button
                  onClick={() => setActiveTab("establishments")}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                    activeTab === "establishments"
                      ? "text-[#f77827] border-[#f77827]"
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  <Store size={13} /> Establecimientos
                  {establishments.length > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
                        activeTab === "establishments"
                          ? "bg-[#f77827] text-white"
                          : "bg-[#2a374f] text-slate-400"
                      }`}
                    >
                      {establishments.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("coupons")}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                    activeTab === "coupons"
                      ? "text-emerald-400 border-emerald-400"
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  <Ticket size={13} /> Cupones
                  {coupons.length > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
                        activeTab === "coupons"
                          ? "bg-emerald-600 text-white"
                          : "bg-[#2a374f] text-slate-400"
                      }`}
                    >
                      {coupons.length}
                    </span>
                  )}
                </button>
              </div>
              <div className="p-4 space-y-3">
                {activeTab === "establishments" &&
                  (establishments.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No hay establecimientos pendientes
                    </p>
                  ) : (
                    establishments.map((notif) => (
                      <AdminEstablishmentCard
                        key={notif.establishmentId || notif.id}
                        notif={notif}
                        onVerify={handleVerifyEstablishment}
                        onReject={handleRejectEstablishment}
                        onDismiss={handleDismiss}
                      />
                    ))
                  ))}
                {activeTab === "coupons" &&
                  (coupons.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No hay cupones pendientes
                    </p>
                  ) : (
                    coupons.map((notif) => (
                      <AdminCouponCard
                        key={notif.couponId || notif.id}
                        notif={notif}
                        onValidate={handleValidateCoupon}
                        onReject={handleRejectCoupon}
                        onDismiss={handleDismiss}
                      />
                    ))
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};