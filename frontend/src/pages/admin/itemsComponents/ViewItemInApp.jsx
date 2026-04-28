

// src/pages/admin/itemsComponents/ViewItemInApp.jsx
// Botón para ver la tapa en la app
import { memo } from 'react';

export const ViewItemInAppButton = memo(({ slug, coords }) => {
   if (!slug) {return null;}

   const query = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : '';

   return (
      <a
         href={`/items/${slug}${query}`}
         target="_blank"
         rel="noopener noreferrer"
         className="admin-btn admin-btn-secondary admin-btn-sm"
      >
         Ver en la app ↗
      </a>
   );
});