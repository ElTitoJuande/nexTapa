// AdminEstablishments.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { establishmentService } from "../../services/establishmentService";
import "./styles/admin.css";

export const AdminEstablishments = () => {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const response = await establishmentService.getAll({
        includeInactive: true,
      });
      setEstablishments(response.data);
    } catch (err) {
      setError("Error loading establishments", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return establishments;
    }
    return establishments.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.address?.city?.toLowerCase().includes(q) ||
        e.address?.province?.toLowerCase().includes(q),
    );
  }, [establishments, search]);

  const handleToggleActive = async (id, currentActive) => {
    try {
      if (currentActive) {
        await establishmentService.deactivate(id);
      } else {
        await establishmentService.reactivate(id);
      }
      setEstablishments((prev) =>
        prev.map((e) => (e._id === id ? { ...e, active: !currentActive } : e)),
      );
    } catch (err) {
      setError("Error al cambiar el estado", err);
    }
  };

  const handleToggleVerified = async (id, currentVerified) => {
    try {
      await establishmentService.update(id, { verified: !currentVerified });
      setEstablishments((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, verified: !currentVerified } : e,
        ),
      );
    } catch (err) {
      setError("Error al cambiar la verificación", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await establishmentService.delete(id);
      setEstablishments((prev) => prev.filter((e) => e._id !== id));
      setDeletingId(null);
    } catch (err) {
      setError("Error al eliminar", err);
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="admin-loading">Cargando...</p>;
  }
  if (error) {
    return <p className="admin-error">{error}</p>;
  }

  return (
    <div>
      {deletingId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3 className="admin-modal-title">¿Eliminar establecimiento?</h3>
            <p className="admin-modal-body">Esta acción es irreversible.</p>
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setDeletingId(null)}
              >
                Cancelar
              </button>
              <button
                className="admin-btn admin-btn-danger admin-btn-sm"
                onClick={() => handleDelete(deletingId)}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-page-header">
        <h2>Establecimientos ({filtered.length})</h2>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => navigate("/admin/establishments/new")}
        >
          + Nuevo
        </button>
      </div>

      {/* Buscador */}
      <div className="admin-search-bar">
        <input
          type="text"
          className="admin-input admin-search-input"
          placeholder="Buscar por nombre, ciudad o provincia..."
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
              <th className="col-tipo">Tipo</th>
              <th className="col-ciudad">Ciudad</th>
              <th className="col-provincia">Provincia</th>
              <th>Activo</th>
              <th>Verificado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-empty">
                  Sin resultados para "{search}"
                </td>
              </tr>
            ) : (
              filtered.map((est) => (
                <tr key={est._id}>
                  <td>{est.name}</td>
                  <td className="col-tipo">{est.type}</td>
                  <td className="col-ciudad">{est.address?.city}</td>
                  <td className="col-provincia">{est.address?.province}</td>
                  <td>
                    <span
                      className={`admin-badge ${est.active ? "admin-badge-success" : "admin-badge-danger"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleToggleActive(est._id, est.active)}
                      title={
                        est.active
                          ? "Click para desactivar"
                          : "Click para activar"
                      }
                    >
                      {est.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${est.verified ? "admin-badge-success" : "admin-badge-warning"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handleToggleVerified(est._id, est.verified)
                      }
                      title={
                        est.verified
                          ? "Click para quitar verificación"
                          : "Click para verificar"
                      }
                    >
                      {est.verified ? "Verificado" : "Pendiente"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-btn admin-btn-warning admin-btn-sm"
                        onClick={() =>
                          navigate(`/admin/establishments/${est._id}`)
                        }
                      >
                        Editar
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => setDeletingId(est._id)}
                      >
                        Eliminar
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
