

// src/pages/admin/adminComponents/BasicInformationAdmin.jsx
// Componente para editar la información básica de un establecimiento en el panel admin
import { memo } from 'react';
import { SaveButton } from './SaveButton';

const TYPES = ['bar', 'restaurante', 'cafeteria', 'cerveceria', 'tasca', 'gastrobar', 'otro'];

export const BasicInformationAdmin = memo(({ form, onChange, saving }) => {
   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Información Básica de {form.name}</h2>

         <div className="admin-field">
            <label>Nombre *</label>
            <input className="admin-input" name="name" value={form.name} onChange={onChange} required />
         </div>

         <div className="admin-field">
            <label>Descripción *</label>
            <textarea className="admin-input" name="description" value={form.description} onChange={onChange} rows={4} required />
         </div>

         <div className="admin-grid-2">
            <div className="admin-field">
               <label>Tipo de establecimineto</label>
               <select className="admin-input" name="type" value={form.type} onChange={onChange}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
            </div>
            <div className="admin-field">
               <label>Rango de Precios</label>
               <input className="admin-input" name="priceRange" value={form.priceRange} onChange={onChange} placeholder="e.g. €€" />
            </div>
         </div>

         <SaveButton saving={saving} />
      </section>
   );
});