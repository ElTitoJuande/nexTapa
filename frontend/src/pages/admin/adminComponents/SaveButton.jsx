

// src/admin/adminComponents/SaveButton.jsx

import { memo } from 'react'; // Usamos memo para evitar renders innecesarios si las props no cambian

export const SaveButton = memo(({ saving }) => {    

   return (
      <div className='admin-form-footer'>
         <button type="submit" disabled={saving} className="admin-btn admin-btn-primary admin-btn-sm">
            {saving ? 'Cabiando...' : 'Guardar cambios'}
         </button>
      </div>
   );
});