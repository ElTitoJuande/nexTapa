


// src/components/admin/EstablishmentItems.jsx 

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../../../services/itemService';

export const EstablishmentItems = ({ establishmentId }) => {
   const navigate = useNavigate();

   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetchItems();
   }, [establishmentId]);

   const fetchItems = async () => {
      try {
         setLoading(true);
         const res = await itemService.getByEstablishment(establishmentId, { available: undefined });
         setItems(res.data || []);
      } catch (err) {
         setError('Error loading tapas');
      } finally {
         setLoading(false);
      }
   };

   const handleToggleAvailable = async (itemId, currentAvailable) => {
      try {
         await itemService.update(itemId, { available: !currentAvailable });
         setItems(prev =>
            prev.map(item =>
               item._id === itemId ? { ...item, available: !currentAvailable } : item
            )
         );
      } catch (err) {
         setError('Error subiendo cambios');
      }
   };

   // ── Delete ─────────────────────────────────────────────
   const handleDelete = async (itemId) => {
      if (!confirm('Estas seguro que quieres eliminar esta tapa? Esta acción no se puede deshacer.')) {return;}
      try {
         await itemService.delete(itemId);
         setItems(prev => prev.filter(item => item._id !== itemId));
      } catch (err) {
         setError('Error al eliminar la tapa');
      }
   };

   // ── Render ─────────────────────────────────────────────
   return (
      <section className="admin-section admin-items-section">

         <div className="admin-section-header">
            <h2 className="admin-section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>
          Tapas ({items.length})
            </h2>
         </div>

         {error && <div className="admin-alert admin-alert-error">{error}</div>}

         {loading ? (
            <p className="admin-loading">Cargando tapas...</p>
         ) : items.length === 0 ? (
            <p className="admin-empty">No hay tapas para este establecimiento.</p>
         ) : (
            <div className="admin-table-wrapper">
               <table className="admin-table">
                  <thead>
                     <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Precio</th>
                        <th>Disponible</th>
                        <th>Destacado</th>
                        <th>Acciones</th>
                     </tr>
                  </thead>
                  <tbody>
                     {items.map(item => (
                        <tr key={item._id}>
                           <td>{item.name}</td>
                           <td>{item.type}</td>
                           <td>{item.isFree ? 'Gratis' : `${item.price}€`}</td>
                           <td>
                              <span className={`admin-badge ${item.available ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                                 {item.available ? 'Sí' : 'No'}
                              </span>
                           </td>
                           <td>
                              <span className={`admin-badge ${item.featured ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                                 {item.featured ? 'Sí' : 'No'}
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
                                    className="admin-btn admin-btn-secondary admin-btn-sm"
                                    onClick={() => handleToggleAvailable(item._id, item.available)}
                                 >
                                    {item.available ? 'Desactivar' : 'Activar'}
                                 </button>
                                 <button
                                    className="admin-btn admin-btn-danger admin-btn-sm"
                                    onClick={() => handleDelete(item._id)}
                                 >
                        Borrar
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </section>
   );
};