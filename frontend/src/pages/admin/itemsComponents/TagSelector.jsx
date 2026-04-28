

// src/admin/admincomponets/TaSelector.jsx

export const TagSelector = ({ options, selected = [], onChange, label }) => {
   const toggle = (value) => {
      if (selected.includes(value)) {
         onChange(selected.filter(v => v !== value));
      } else {
         onChange([...selected, value]);
      }
   };

   return (
      <div className="admin-field">
         <label className="admin-label">{label}</label>
         <div className="admin-tag-grid">
            {options.map(opt => (
               <button
                  key={opt.value}
                  type="button"
                  className={`admin-tag-btn ${selected.includes(opt.value) ? 'is-selected' : ''}`}
                  onClick={() => toggle(opt.value)}
               >
                  {opt.label}
               </button>
            ))}
         </div>
      </div>
   );
};
