// src/pages/admin/AdminUserDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  AtSign,
  Building2,
  MapPin,
  ShieldCheck,
  ShieldOff,
  Calendar,
  Clock,
  Star,
  ChevronLeft,
  ToggleLeft,
  ToggleRight,
  CreditCard,
} from "lucide-react";
import { userService } from "../../services/userService";
import { reviewService } from "../../services/reviewService";
import "./styles/admin.css";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date) => {
  if (!date) {
    return "—";
  }
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) {
    return "—";
  }
  return new Date(date).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const rolLabel = { admin: "Admin", hostelero: "Hostelero", cliente: "Cliente" };
const rolBadge = {
  admin: "admin-badge-info",
  hostelero: "admin-badge-warning",
  cliente: "admin-badge-success",
};

const StarDisplay = ({ rating }) => (
  <div className="iph-flex iph-gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={13}
        className={n <= rating ? "iph-text-amber" : "iph-text-muted"}
        fill={n <= rating ? "currentColor" : "none"}
      />
    ))}
  </div>
);

// ── Componente ────────────────────────────────────────────────────────────────

export const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [userRes, reviewsRes] = await Promise.all([
          userService.getById(id),
          reviewService.getByUser(id),
        ]);
        setUser(userRes.data);
        const seen = new Set();
        const deduped = (reviewsRes || []).filter((r) => {
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
        console.error(err);
        setError("Error al cargar el usuario");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleToggleActive = async () => {
    if (!user || toggling) {
      return;
    }
    try {
      setToggling(true);
      if (user.active) {
        await userService.deactivate(user.id || user._id);
      } else {
        await userService.reactivate(user.id || user._id);
      }
      setUser((prev) => ({ ...prev, active: !prev.active }));
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <p className="admin-loading">Cargando usuario...</p>;
  }
  if (error) {
    return <p className="admin-error">{error}</p>;
  }
  if (!user) {
    return <p className="admin-error">Usuario no encontrado</p>;
  }

  const isHostelero = user.role === "hostelero";

  return (
    <div>
      {/* ── Header ── */}
      <div className="admin-page-header">
        <div className="iph-flex iph-items-center iph-gap-3">
          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => navigate("/admin/users")}
          >
            <ChevronLeft size={14} />
            Volver
          </button>
          <h2 style={{ margin: 0 }}>Ficha de usuario</h2>
        </div>
        <button
          className={`admin-btn admin-btn-sm ${user.active ? "admin-btn-danger" : "admin-btn-primary"}`}
          onClick={handleToggleActive}
          disabled={toggling}
        >
          {user.active ? (
            <>
              <ToggleRight size={14} /> Desactivar
            </>
          ) : (
            <>
              <ToggleLeft size={14} /> Activar
            </>
          )}
        </button>
      </div>

      <div
        className="iph-grid iph-grid-2 iph-gap-4"
        style={{ marginTop: "1.5rem" }}
      >
        {/* ── Identidad ── */}
        <div className="iph-card">
          <div className="iph-card-header">
            <User size={15} className="iph-icon-accent" />
            <span>Identidad</span>
          </div>

          <div
            className="iph-flex iph-items-center iph-gap-3"
            style={{ marginBottom: "1.25rem" }}
          >
            <div className="iph-avatar">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="iph-avatar-img"
                />
              ) : (
                <User size={24} className="iph-text-muted" />
              )}
            </div>
            <div>
              <p className="iph-name">{user.name}</p>
              {user.username && <p className="iph-meta">@{user.username}</p>}
              <span className={`admin-badge ${rolBadge[user.role]}`}>
                {rolLabel[user.role]}
              </span>
            </div>
          </div>

          <div className="iph-fields">
            <div className="iph-field">
              <Mail size={13} className="iph-icon-muted" />
              <span className="iph-field-label">Email</span>
              <span className="iph-field-value">{user.email}</span>
            </div>
            {user.phone && (
              <div className="iph-field">
                <Phone size={13} className="iph-icon-muted" />
                <span className="iph-field-label">Teléfono</span>
                <span className="iph-field-value">{user.phone}</span>
              </div>
            )}
            <div className="iph-field">
              <ShieldCheck size={13} className="iph-icon-muted" />
              <span className="iph-field-label">Email verificado</span>
              <span
                className={`admin-badge admin-badge-sm ${user.emailVerified ? "admin-badge-success" : "admin-badge-danger"}`}
              >
                {user.emailVerified ? "Sí" : "No"}
              </span>
            </div>
            <div className="iph-field">
              <ShieldCheck size={13} className="iph-icon-muted" />
              <span className="iph-field-label">Estado</span>
              <span
                className={`admin-badge admin-badge-sm ${user.active ? "admin-badge-success" : "admin-badge-danger"}`}
              >
                {user.active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Actividad ── */}
        <div className="iph-card">
          <div className="iph-card-header">
            <Clock size={15} className="iph-icon-accent" />
            <span>Actividad</span>
          </div>
          <div className="iph-fields">
            <div className="iph-field">
              <Calendar size={13} className="iph-icon-muted" />
              <span className="iph-field-label">Registro</span>
              <span className="iph-field-value">
                {formatDate(user.createdAt)}
              </span>
            </div>
            <div className="iph-field">
              <Clock size={13} className="iph-icon-muted" />
              <span className="iph-field-label">Último login</span>
              <span className="iph-field-value">
                {formatDateTime(user.lastLogin)}
              </span>
            </div>
            <div className="iph-field">
              <Star size={13} className="iph-icon-muted" />
              <span className="iph-field-label">Valoraciones</span>
              <span className="iph-field-value">{reviews.length}</span>
            </div>
            {user.failedLoginAttempts > 0 && (
              <div className="iph-field">
                <ShieldOff size={13} className="iph-icon-muted" />
                <span className="iph-field-label">Intentos fallidos</span>
                <span className="iph-field-value">
                  {user.failedLoginAttempts}
                </span>
              </div>
            )}
            {user.lockUntil && new Date(user.lockUntil) > new Date() && (
              <div className="iph-field">
                <ShieldOff size={13} className="iph-icon-accent-danger" />
                <span className="iph-field-label">Bloqueado hasta</span>
                <span className="iph-field-value iph-text-danger">
                  {formatDateTime(user.lockUntil)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Datos de hostelero ── */}
        {isHostelero && (
          <div className="iph-card">
            <div className="iph-card-header">
              <Building2 size={15} className="iph-icon-accent" />
              <span>Negocio</span>
            </div>
            <div className="iph-fields">
              {user.businessName && (
                <div className="iph-field">
                  <Building2 size={13} className="iph-icon-muted" />
                  <span className="iph-field-label">Nombre</span>
                  <span className="iph-field-value">{user.businessName}</span>
                </div>
              )}
              {user.businessAddress && (
                <div className="iph-field">
                  <MapPin size={13} className="iph-icon-muted" />
                  <span className="iph-field-label">Dirección</span>
                  <span className="iph-field-value">
                    {user.businessAddress}
                  </span>
                </div>
              )}
              {user.cif && (
                <div className="iph-field">
                  <CreditCard size={13} className="iph-icon-muted" />
                  <span className="iph-field-label">CIF</span>
                  <span className="iph-field-value">{user.cif}</span>
                </div>
              )}
              <div className="iph-field">
                <ShieldCheck size={13} className="iph-icon-muted" />
                <span className="iph-field-label">Verificado</span>
                <span
                  className={`admin-badge admin-badge-sm ${user.verified ? "admin-badge-success" : "admin-badge-warning"}`}
                >
                  {user.verified ? "Verificado" : "Pendiente"}
                </span>
              </div>
              {user.businessLogo && (
                <div style={{ marginTop: "0.75rem" }}>
                  <img
                    src={user.businessLogo}
                    alt="Logo"
                    className="iph-business-logo"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Valoraciones ── */}
        <div className={`iph-card ${isHostelero ? "" : "iph-col-span-2"}`}>
          <div className="iph-card-header">
            <Star size={15} className="iph-icon-accent" />
            <span>Valoraciones ({reviews.length})</span>
          </div>
          {reviews.length === 0 ? (
            <p className="iph-empty">Este usuario no ha dejado valoraciones</p>
          ) : (
            <div className="iph-review-list">
              {reviews.map((r) => (
                <div key={r._id} className="iph-review-item">
                  <div className="iph-review-info">
                    <p className="iph-review-name">
                      {r.establishment?.name || r.item?.name || "—"}
                    </p>
                    <p className="iph-meta">
                      {r.establishment
                        ? "Establecimiento"
                        : `Tapa · ${r.item?.establishment?.name || ""}`}{" "}
                      · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <StarDisplay rating={r.rating} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
