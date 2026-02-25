

// src/pages/admin/adminComponents/StatusAdmin.jsx
// Componente para gestionar el estado de un establecimiento (activo, verificado) en el panel de administración
import { memo } from 'react'; // Usamos memo para evitar renders innecesarios si las props no cambian
import { SaveButton } from './SaveButton'; // Importamos el botón de guardar

export const EstablishmentStatus = memo(({ active, verified, onChange, saving, name }) => {
   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Status de la cueta de {name}</h2>
         <div className="admin-toggles-row">
            <div className="admin-toggles">
               <label className="admin-toggle">
                  <input type="checkbox" name="active" checked={active} onChange={onChange} />
                  <span>Activo</span>
               </label>
               <label className="admin-toggle">
                  <input type="checkbox" name="verified" checked={verified} onChange={onChange} />
                  <span>Verificado</span>
               </label>
            </div>
            <SaveButton saving={saving} />
         </div>
      </section>
   );
});