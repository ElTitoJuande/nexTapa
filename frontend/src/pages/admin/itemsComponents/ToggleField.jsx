

// src/pages/admin/adminComponents/ToggleField.jsx
import { memo } from 'react';

export const ToggleField = memo(({ label, description, checked, onChange }) => (
   <div className="admin-toggle-field">
      <div className="admin-toggle-field-info">
         <span className="admin-toggle-field-label">{label}</span>
         {description && <span className="admin-toggle-field-desc">{description}</span>}
      </div>
      <button
         type="button"
         className={`admin-toggle-btn ${checked ? 'is-open' : 'is-closed'}`}
         onClick={() => onChange(!checked)}
      >
         {checked ? 'Sí' : 'No'}
      </button>
   </div>
));