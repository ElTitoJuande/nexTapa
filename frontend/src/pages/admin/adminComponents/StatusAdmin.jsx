

// src/pages/admin/adminComponents/StatusAdmin.jsx
// Componente para gestionar el estado de un establecimiento (activo, verificado) en el panel de administración
import { memo } from 'react'; // Usamos memo para evitar renders innecesarios si las props no cambian
import { SaveButton } from './SaveButton'; // Importamos el botón de guardar

export const EstablishmentStatus = memo(({ active, verified, onChange, saving, name }) => {
   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Status de la cuenta de {name}</h2>
         <div className="flex flex-col gap-3 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
               <input
                  type="checkbox"
                  name="active"
                  checked={active}
                  onChange={onChange}
                  className="w-4 h-4 accent-blue-600"
               />
               <span className="text-sm font-medium text-slate-700">Activo</span>
               <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {active ? 'Sí' : 'No'}
               </span>
            </label>
            {/* <label className="flex items-center gap-3 cursor-pointer">
               <input
                  type="checkbox"
                  name="verified"
                  checked={verified}
                  onChange={onChange}
                  className="w-4 h-4 accent-blue-600"
               />
               <span className="text-sm font-medium text-slate-700">Verificado</span>
               <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${verified ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  {verified ? 'Sí' : 'No'}
               </span>
            </label> */}
         </div>
        
      </section>
   );
});