

// src/pages/admin/adminComponents/ViewInAppButton.jsx


import { memo } from 'react';

export const ViewInAppButton = memo(({ id }) => {
   if (!id) {return null;}

   return (
       
      <a
         href={`/establishment/${id}`}
         target="_blank"
         rel="noopener noreferrer"
         className="admin-btn admin-btn-secondary admin-btn-sm"
      >  
      Ver en la app ↗
      </a>
     
      
   );
});