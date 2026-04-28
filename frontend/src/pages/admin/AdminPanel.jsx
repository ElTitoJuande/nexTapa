// AdminPanel.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminSidebar } from "../../hooks/useAdminSidebar.js";
import "./styles/admin.css";

const navLinks = [
  { to: "/admin", label: "Principal", end: true },
  { to: "/admin/establishments", label: "Establecimientos" },
  { to: "/admin/items", label: "Tapas" },
  { to: "/admin/users", label: "Usuarios" },
];

export const AdminPanel = () => {
  const { isOpen, close, toggle } = useAdminSidebar();
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      {/* ── Top nav — visible en desktop y móvil ── */}
      <nav className="admin-topnav">
        {/* Burger — solo móvil */}
        <button
          className="admin-burger"
          onClick={toggle}
          aria-label="Abrir menú"
        >
          {isOpen ? "✕" : "☰"}
        </button>

        <span className="admin-topnav-brand">⚙️ Admin</span>

        {/* Links — visibles en desktop */}
        <div className="admin-topnav-links">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={close}
            >
              {label}
            </NavLink>
          ))}
          <NavLink to="/" className={() => ""} onClick={close}>
            🏠 Home
          </NavLink>
        </div>
      </nav>

      {/* ── Overlay móvil ── */}
      <div
        className={`admin-sidebar-overlay ${isOpen ? "is-open" : ""}`}
        onClick={close}
      />

      {/* ── Sidebar lateral — solo móvil ── */}
      <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
        <h1>⚙️ Admin</h1>
        <nav>
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={close}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/" className={() => "admin-sidebar-home"} onClick={close}>
          🏠 Ir a la app
        </NavLink>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};
