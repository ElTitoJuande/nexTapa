

// src/pages/admin/adminComponents/CuisineTypeAdmin.jsx

import { useState, memo } from 'react';
import { SaveButton } from './SaveButton';

export const CuisineTypeAdmin = memo(({ cuisineType, onAdd, onRemove, saving }) => {
   const [input, setInput] = useState('');

   const handleAdd = () => {
      const trimmed = input.trim();
      if (!trimmed || cuisineType.includes(trimmed)) {return;}
      onAdd(trimmed);
      setInput('');
   };

   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Tipo de Cocina</h2>
         <div className="admin-tags-input">
            <div className="admin-tags">
               {cuisineType.map(c => (
                  <span key={c} className="admin-tag">
                     {c}
                     <button type="button" onClick={() => onRemove(c)}>×</button>
                  </span>
               ))}
               {cuisineType.length === 0 && (
                  <span className="admin-tags-empty">No se han añadido tipos de cocina</span>
               )}
            </div>
            <div className="admin-tag-add">
               <input
                  className="admin-input"
                  placeholder="Añade un tipo de cocina y presiona Enter"
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