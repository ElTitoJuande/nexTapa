

// src/components/admin/adminComponents/ItemsAdmin.jsx
// componente para listar y gestionar las tapas de un establecimiento en el panel admin

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../../../services/itemService';
import {
   DndContext,
   closestCenter,
   PointerSensor,
   useSensor,
   useSensors,
} from '@dnd-kit/core';
import {
   SortableContext,
   useSortable,
   verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
   assignSequentialOrder,
   buildOrderPayload,
   moveByDndIds,
   sortByOrder,
} from '../utils/sortableOrder';

// ── Fila sortable ──────────────────────────────────────────────────────────
const SortableRow = ({ item, onToggleAvailable, onToggleFeatured, onDelete, onEdit }) => {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id: item._id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
      background: isDragging ? 'var(--admin-bg-hover, #f5f5f5)' : undefined,
   };

   return (
      <tr ref={setNodeRef} style={style}>
         <td>
            <span
               className="drag-handle"
               {...attributes}
               {...listeners}
               title="Arrastrar para reordenar"
            >
               ⠿
            </span>
         </td>
         <td>{item.name}</td>
         <td>
            {item.modalities?.length === 1 ? (
               <span>
                  {item.modalities[0].label} · {' '}
                  {item.modalities[0].isFree || item.modalities[0].price === 0
                     ? <span style={{ color: '#16a34a', fontWeight: 600 }}>Gratis</span>
                     : `${item.modalities[0].price}€`
                  }
               </span>
            ) : (
               <select
                  style={{
                     border: '1px solid var(--admin-border)',
                     borderRadius: '6px',
                     padding: '0.2rem 0.4rem',
                     fontSize: '0.85rem',
                     background: 'var(--admin-bg)',
                     color: 'var(--admin-text)',
                     cursor: 'default',
                  }}
                  defaultValue=""
                  onChange={e => e.target.value = ""}
               >
                  <option value="" disabled>
                     {item.modalities.length} Opciones
                  </option>
                  {item.modalities.map((m, i) => (
                     <option key={i} disabled>
                        {m.label} · {m.isFree || m.price === 0 ? 'Gratis' : `${m.price}€`}
                     </option>
                  ))}
               </select>
            )}
         </td>
         <td>
            <button
               type="button"
               className={`admin-toggle-btn ${item.available ? 'is-open' : 'is-closed'}`}
               onClick={() => onToggleAvailable(item._id, item.available)}
            >
               {item.available ? 'Sí' : 'No'}
            </button>
         </td>
         <td>
            <button
               type="button"
               className={`admin-toggle-btn ${item.featured ? 'is-open' : 'is-closed'}`}
               onClick={() => onToggleFeatured(item._id, item.featured)}
            >
               {item.featured ? 'Sí' : 'No'}
            </button>
         </td>
         <td>
            <div className="admin-actions">
               <button
                  className="admin-btn admin-btn-warning admin-btn-sm"
                  onClick={() => onEdit(item._id)}
               >
                  Editar
               </button>
               <button
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  onClick={() => onDelete(item._id, item.name)}
               >
                  Borrar
               </button>
            </div>
         </td>
      </tr>
   );
};

// ── Componente principal ───────────────────────────────────────────────────
export const EstablishmentItems = ({
   establishmentId,
   itemEditorBasePath = '/admin/items'
}) => {
   const navigate = useNavigate();
   const itemEditorPrefix = itemEditorBasePath.endsWith('/')
      ? itemEditorBasePath.slice(0, -1)
      : itemEditorBasePath;

   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState(null);
   const [successMsg, setSuccessMsg] = useState(null);
   const [orderChanged, setOrderChanged] = useState(false);

   // Modal de confirmación
   const [deletingItem, setDeletingItem] = useState(null); // { id, name }

   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: { distance: 8 },
      })
   );

   useEffect(() => {
      fetchItems();
   }, [establishmentId]);

   const fetchItems = async () => {
      try {
         setLoading(true);
         const res = await itemService.getByEstablishment(establishmentId, { available: undefined });
         setItems(sortByOrder(res.data || []));
         setOrderChanged(false);
      } catch (err) {
         setError('Error loading tapas', err);
      } finally {
         setLoading(false);
      }
   };

   const showSuccess = (msg) => {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
   };

   // ── Drag end ────────────────────────────────────────────────────────────
   const handleDragEnd = useCallback((event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {return;}

      setItems(prev => moveByDndIds(prev, active.id, over.id));
      setOrderChanged(true);
   }, []);

   // ── Guardar orden ───────────────────────────────────────────────────────
   const handleSaveOrder = async () => {
      try {
         setSaving(true);
         setError(null);
         const payload = buildOrderPayload(items);
         await itemService.reorder(payload);
         setItems(prev => assignSequentialOrder(prev));
         setOrderChanged(false);
         showSuccess('Orden guardado correctamente');
      } catch (err) {
         setError('Error al guardar el orden', err);
      } finally {
         setSaving(false);
      }
   };

   // ── Toggles ─────────────────────────────────────────────────────────────
   const handleToggleAvailable = async (itemId, currentAvailable) => {
      try {
         await itemService.update(itemId, { available: !currentAvailable });
         setItems(prev =>
            prev.map(item => item._id === itemId ? { ...item, available: !currentAvailable } : item)
         );
      } catch (err) {
         setError('Error al cambiar disponibilidad', err);
      }
   };

   const handleToggleFeatured = async (itemId, currentFeatured) => {
      try {
         await itemService.update(itemId, { featured: !currentFeatured });
         setItems(prev =>
            prev.map(item => item._id === itemId ? { ...item, featured: !currentFeatured } : item)
         );
      } catch (err) {
         setError('Error al cambiar destacado', err);
      }
   };

   // ── Delete — abre modal ─────────────────────────────────────────────────
   const handleDeleteRequest = (itemId, itemName) => {
      setDeletingItem({ id: itemId, name: itemName });
   };

   const handleDeleteConfirm = async () => {
      try {
         await itemService.delete(deletingItem.id);
         setItems(prev => prev.filter(item => item._id !== deletingItem.id));
         showSuccess('Tapa eliminada correctamente');
      } catch (err) {
         setError('Error al eliminar la tapa', err);
      } finally {
         setDeletingItem(null);
      }
   };

   // ── Render ──────────────────────────────────────────────────────────────
   return (
      <section className="admin-section admin-items-section">

         {/* Modal de confirmación */}
         {deletingItem && (
            <div className="admin-modal-overlay">
               <div className="admin-modal">
                  <h3 className="admin-modal-title">¿Eliminar tapa?</h3>
                  <p className="admin-modal-body">
                     Vas a eliminar <strong>{deletingItem.name}</strong>. Esta acción es irreversible.
                  </p>
                  <div className="admin-modal-actions">
                     <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => setDeletingItem(null)}
                     >
                        Cancelar
                     </button>
                     <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={handleDeleteConfirm}
                     >
                        Sí, eliminar
                     </button>
                  </div>
               </div>
            </div>
         )}

         <div className="admin-section-header">
            <h2 className="admin-section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>
               Tapas ({items.length})
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               {orderChanged && (
                  <button
                     className="admin-btn admin-btn-primary admin-btn-sm"
                     onClick={handleSaveOrder}
                     disabled={saving}
                  >
                     {saving ? 'Guardando...' : '💾 Guardar orden'}
                  </button>
               )}
               <button
                  className="admin-btn admin-btn-primary admin-btn-sm"
                  onClick={() =>
                     navigate(`${itemEditorPrefix}/new`, { state: { establishmentId } })
                  }
               >
                  + Añadir tapa
               </button>
            </div>
         </div>

         {error && <div className="admin-alert admin-alert-error">{error}</div>}
         {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}

         {loading ? (
            <p className="admin-loading">Cargando tapas...</p>
         ) : items.length === 0 ? (
            <p className="admin-empty">No hay tapas para este establecimiento.</p>
         ) : (
            <div className="admin-table-wrapper">
               <table className="admin-table">
                  <thead>
                     <tr>
                        <th style={{ width: '32px' }}></th>
                        <th>Nombre</th>
                        <th>Opciones</th>
                        <th>Disponible</th>
                        <th>Destacado</th>
                        <th>Acciones</th>
                     </tr>
                  </thead>
                  <tbody>
                     <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                     >
                        <SortableContext
                           items={items.map(i => i._id)}
                           strategy={verticalListSortingStrategy}
                        >
                           {items.map(item => (
                              <SortableRow
                                 key={item._id}
                                 item={item}
                                 onToggleAvailable={handleToggleAvailable}
                                 onToggleFeatured={handleToggleFeatured}
                                 onDelete={handleDeleteRequest}
                                 onEdit={(id) => navigate(`${itemEditorPrefix}/${id}`)}
                              />
                           ))}
                        </SortableContext>
                     </DndContext>
                  </tbody>
               </table>
            </div>
         )}
      </section>
   );
};
