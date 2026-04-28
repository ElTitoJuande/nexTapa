// src/pages/admin/AdminUsers.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import "./styles/admin.css";

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response.data || []);
    } catch (err) {
      setError("Error al cargar usuarios", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return users;
    }
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const handleToggleActive = async (id, currentActive) => {
    try {
      if (currentActive) {
        await userService.deactivate(id);
      } else {
        await userService.reactivate(id);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, active: !currentActive } : u)),
      );
    } catch (err) {
      setError("Error al cambiar el estado del usuario", err);
    }
  };

  const roleBadgeClass = (role) => {
    if (role === "admin") {
      return "admin-badge admin-badge-info";
    }
    if (role === "hostelero") {
      return "admin-badge admin-badge-warning";
    }
    return "admin-badge admin-badge-success";
  };

  const rolLabel = (role) => {
    if (role === "admin") {
      return "Admin";
    }
    if (role === "hostelero") {
      return "Hostelero";
    }
    return "Cliente";
  };

  if (loading) {
    return <p className="admin-loading">Cargando...</p>;
  }
  if (error) {
    return <p className="admin-error">{error}</p>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2>Usuarios ({filtered.length})</h2>
      </div>

      <div className="admin-search-bar">
        <input
          type="text"
          className="admin-input admin-search-input"
          placeholder="Buscar por nombre, email, usuario o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="admin-search-clear" onClick={() => setSearch("")}>
            ✕
          </button>
        )}
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th className="col-ciudad">Email</th>
              <th className="col-tipo">Rol</th>
              <th>Activo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-empty">
                  Sin resultados para "{search}"
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {u.avatar && (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <span>{u.name}</span>
                      {u.username && (
                        <span style={{ fontSize: "0.72rem", color: "#888" }}>
                          @{u.username}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="col-ciudad">{u.email}</td>
                  <td className="col-tipo">
                    <span className={roleBadgeClass(u.role)}>
                      {rolLabel(u.role)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${u.active ? "admin-badge-success" : "admin-badge-danger"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleToggleActive(u.id, u.active)}
                      title={
                        u.active
                          ? "Click para desactivar"
                          : "Click para activar"
                      }
                    >
                      {u.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-btn admin-btn-warning admin-btn-sm"
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                      >
                        Ver perfil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
