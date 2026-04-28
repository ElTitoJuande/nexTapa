// src/pages/admin/AdminItems.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { itemService } from "../../services/itemService";
import "./styles/admin.css";

export const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemService.getAllItems({});
      setItems(response.data || []);
    } catch (err) {
      setError("Error al cargar tapas", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return items;
    }
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.establishment?.name?.toLowerCase().includes(q) ||
        item.categories?.some((c) => c.toLowerCase().includes(q)),
    );
  }, [items, search]);

  const handleToggleActive = async (id, currentActive) => {
    try {
      await itemService.update(id, { available: !currentActive });
      setItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, available: !currentActive } : item,
        ),
      );
    } catch (err) {
      setError("Error al cambiar el estado", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await itemService.delete(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError("Error al eliminar la tapa", err);
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
      <div className="admin-page-header">
        <h2>Tapas ({filtered.length})</h2>
      </div>

      <div className="admin-search-bar">
        <input
          type="text"
          className="admin-input admin-search-input"
          placeholder="Buscar por nombre, establecimiento o categoría..."
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
              <th className="col-ciudad">Establecimiento</th>
              <th className="col-tipo">Categorías</th>
              <th>Disponible</th>
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
              filtered.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {item.mainImage && (
                        <img
                          src={item.mainImage}
                          alt={item.name}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="col-ciudad">
                    {item.establishment?.name || "—"}
                  </td>
                  <td className="col-tipo">
                    {item.categories?.length > 0 ? (
                      <span className="admin-badge admin-badge-info">
                        {item.categories[0]}
                        {item.categories.length > 1
                          ? ` +${item.categories.length - 1}`
                          : ""}
                      </span>
                    ) : (
                      <span className="admin-badge">—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${item.available ? "admin-badge-success" : "admin-badge-danger"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handleToggleActive(item._id, item.available)
                      }
                    >
                      {item.available ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-btn admin-btn-warning admin-btn-sm"
                        onClick={() => navigate(`/admin/items/${item._id}`)}
                      >
                        Editar
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => handleDelete(item._id)}
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
