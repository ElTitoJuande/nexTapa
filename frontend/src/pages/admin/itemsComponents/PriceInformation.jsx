

// src/pages/admin/itemsComponents/PriceInformation.jsx
import { memo } from 'react';

const MODALITY_SUGGESTIONS = [
   'Tapa', 'Pincho', 'Montadito', 'Media ración', 'Ración', 'Ración entera',
   'Entrante', 'Plato', 'Postre', 'Bocadillo', 'Desayuno', 'Gratis'
];

const emptyModality = () => ({ label: 'Tapa', price: 0, isFree: false, available: true });

export const PriceInformation = memo(({ form, handleChange }) => {
   const modalities = form.modalities || [emptyModality()];

   const update = (index, field, value) => {
      const updated = modalities.map((m, i) => {
         if (i !== index) {return m;}
         const next = { ...m, [field]: value };
         if (field === 'label' && value.toLowerCase().trim() === 'gratis') {
            next.price = 0;
         }
         return next;
      });
      handleChange('modalities', updated);
   };

   const add = () => {
      handleChange('modalities', [...modalities, emptyModality()]);
   };

   const remove = (index) => {
      if (modalities.length === 1) {return;}
      handleChange('modalities', modalities.filter((_, i) => i !== index));
   };

   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Precio y modalidades</h2>
         <p className="admin-field-hint" style={{ marginBottom: '1rem' }}>
            Añade todas las presentaciones disponibles para esta tapa
         </p>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {modalities.map((mod, index) => (
               <div
                  key={index}
                  style={{
                     display: 'grid',
                     gridTemplateColumns: '1fr auto auto auto',
                     gap: '0.5rem',
                     alignItems: 'center',
                     padding: '0.75rem',
                     background: mod.available ? 'var(--admin-bg)' : 'var(--admin-bg-muted, #f5f5f5)',
                     borderRadius: '8px',
                     border: '1px solid var(--admin-border)',
                     opacity: mod.available ? 1 : 0.6,
                  }}
               >
                  {/* Label con datalist de sugerencias */}
                  <div className="admin-field" style={{ margin: 0 }}>
                     <input
                        className="admin-input"
                        list={`modality-suggestions-${index}`}
                        value={mod.label}
                        onChange={e => update(index, 'label', e.target.value)}
                        placeholder="Ej: Tapa, Ración..."
                     />
                     <datalist id={`modality-suggestions-${index}`}>
                        {MODALITY_SUGGESTIONS.map(s => (
                           <option key={s} value={s} />
                        ))}
                     </datalist>
                  </div>

                  {/* Precio */}
                  <div className="admin-input-prefix-wrapper" style={{ margin: 0 }}>
                     <span className="admin-input-prefix">€</span>
                     <input
                        className="admin-input admin-input-with-prefix"
                        type="number"
                        min="0"
                        step="0.10"
                        value={mod.price}
                        onChange={e => update(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        style={{ width: '90px' }}
                     />
                  </div>

                  {/* Toggle disponible */}
                  <button
                     type="button"
                     title={mod.available ? 'Disponible' : 'No disponible'}
                     onClick={() => update(index, 'available', !mod.available)}
                     style={{
                        background: mod.available ? '#16a34a' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem 0.6rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap'
                     }}
                  >
                     {mod.available ? '✓ Activa' : '✗ Oculta'}
                  </button>

                  {/* Eliminar */}
                  <button
                     type="button"
                     onClick={() => remove(index)}
                     disabled={modalities.length === 1}
                     style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: modalities.length === 1 ? 'not-allowed' : 'pointer',
                        color: modalities.length === 1 ? '#d1d5db' : '#ef4444',
                        fontSize: '1.1rem',
                        padding: '0.2rem 0.4rem'
                     }}
                     title="Eliminar modalidad"
                  >
                     🗑
                  </button>
               </div>
            ))}
         </div>

         {/* Añadir modalidad */}
         <button
            type="button"
            onClick={add}
            className="admin-btn admin-btn-secondary admin-btn-sm"
            style={{ marginTop: '0.75rem' }}
         >
            + Añadir modalidad
         </button>
      </section>
   );
});

