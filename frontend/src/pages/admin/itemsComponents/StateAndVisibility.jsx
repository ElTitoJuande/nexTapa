

// src/pages/admin/itemsComponents/StateAndVisibility.jsx
// Componente para gestionar el estado (disponible, destacado) y días especiales de una tapa
import { memo } from 'react';
import { ToggleField } from './ToggleField';

const DAYS = [
   { value: 'lunes', label: 'Lunes' },
   { value: 'martes', label: 'Martes' },
   { value: 'miercoles', label: 'Miércoles' },
   { value: 'jueves', label: 'Jueves' },
   { value: 'viernes', label: 'Viernes' },
   { value: 'sabado', label: 'Sábado' },
   { value: 'domingo', label: 'Domingo' },
];

export const StateAndVisibility = memo(({ form, handleChange }) => {

   const toggleDay = (value) => {
      const current = form.specialDays || [];
      const updated = current.includes(value)
         ? current.filter(d => d !== value)
         : [...current, value];
      handleChange('specialDays', updated);
   };

   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Estado y visibilidad</h2>

         <div className="admin-toggles-list">
            <ToggleField
               label="Disponible"
               description="La tapa aparece en la carta y en los resultados de búsqueda"
               checked={form.available}
               onChange={val => handleChange('available', val)}
            />
            <ToggleField
               label="Destacada"
               description="Se muestra en posición preferente en la carta del establecimiento"
               checked={form.featured}
               onChange={val => handleChange('featured', val)}
            />
            {/* <ToggleField
               label="Producto de temporada"
               description="Indica que la tapa está disponible solo en ciertas épocas del año"
               checked={form.seasonalItem}
               onChange={val => handleChange('seasonalItem', val)}
            /> */}
         </div>

         <div className="admin-field" style={{ marginTop: '1.25rem' }}>
            <label className="admin-label">Días especiales</label>
            <div className="admin-tag-grid">
               {DAYS.map(d => (
                  <button
                     key={d.value}
                     type="button"
                     className={`admin-tag-btn ${(form.specialDays || []).includes(d.value) ? 'is-selected' : ''}`}
                     onClick={() => toggleDay(d.value)}
                  >
                     {d.label}
                  </button>
               ))}
            </div>
            <span className="admin-field-hint">
               Deja vacío si está disponible todos los días. Selecciona los días en que se sirve esta tapa.
            </span>
         </div>
      </section>
   );
});