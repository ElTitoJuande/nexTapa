import { memo } from 'react';


export const BasicInformationItem = memo(({ form, handleChange }) => {
   // Valores por defecto para evitar errores si 'form' llega incompleto
   const name = form?.name || '';
   const description = form?.description || '';
   const order = form?.order ?? 0;

   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Información básica</h2>

         <div className="admin-field">
            <label className="admin-label">Nombre *</label>
            <input
               className="admin-input"
               type="text"
               value={name}
               onChange={e => handleChange('name', e.target.value)}
               placeholder="Nombre de la tapa"
               required
            />
         </div>

         <div className="admin-field">
            <label className="admin-label">Descripción *</label>
            <textarea
               className="admin-input admin-textarea"
               value={description}
               onChange={e => handleChange('description', e.target.value)}
               placeholder="Describe la tapa, sus ingredientes, elaboración..."
               rows={4}
               required
            />
            <span className="admin-field-hint">{description.length}/500 caracteres</span>
         </div>
          

         <div className="admin-field">
            <label className="admin-label">Orden de visualización</label>
            <input
               className="admin-input"
               type="number"
               min="1"
               value={order === '' ? '' : order + 1}
               onChange={e => handleChange('order', e.target.value === '' ? '' : parseInt(e.target.value, 10) - 1)}
            />
         </div>
         
      </section>
   );
});

