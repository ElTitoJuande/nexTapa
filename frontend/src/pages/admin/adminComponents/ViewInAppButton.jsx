

// src/pages/admin/adminComponents/ViewInAppButton.jsx


import { memo } from 'react';

export const ViewInAppButton = memo(({ slug }) => {
   if (!slug) {return null;}
   
   return (
       
      <a
         href={`/establishment/${slug}`}
         target="_blank"
         rel="noopener noreferrer"
         className="admin-btn admin-btn-secondary admin-btn-sm"
      >  
      Ver en la app ↗
      </a>
     
      
   );
});