

//src/pages/admin/adminComponents/BasicInformationAdmin.jsx
// Componente para gestionar la información básica de un establecimiento en el panel de administración
// src/pages/admin/adminComponents/FeaturesAdmin.jsx

import { useState, memo } from 'react';
import { SaveButton } from './SaveButton';

export const FeaturesAdmin = memo(({ features, onAdd, onRemove, saving }) => {
   const [input, setInput] = useState('');

   const handleAdd = () => {
      const trimmed = input.trim();
      if (!trimmed || features.includes(trimmed)) {return;}
      onAdd(trimmed);
      setInput('');
   };

   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Servicios Extra</h2>
         <div className="admin-tags-input">
            <div className="admin-tags">
               {features.map(f => (
                  <span key={f} className="admin-tag">
                     {f}
                     <button type="button" onClick={() => onRemove(f)}>×</button>
                  </span>
               ))}
               {features.length === 0 && (
                  <span className="admin-tags-empty">No se han añadido servicios</span>
               )}
            </div>
            <div className="admin-tag-add">
               <input
                  className="admin-input"
                  placeholder="Añadir servicio y presionar Enter"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                     if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAdd();
                     }
                  }}
               />
               <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAdd}>
            Add
               </button>
            </div>
         </div>
         {/* <SaveButton saving={saving} /> */}
      </section>
   );
});