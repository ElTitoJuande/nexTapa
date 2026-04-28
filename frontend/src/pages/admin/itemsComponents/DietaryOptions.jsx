

import { memo } from 'react';
import { TagSelector } from './TagSelector';

const DIETARY_OPTIONS = [
   { value: 'Vegetariano', label: '🥕 Vegetariano' },
   { value: 'Vegano', label: '🌱 Vegano' },
   { value: 'Sin Gluten', label: '🚫🌾 Sin Gluten' },
   { value: 'Sin Lactosa', label: '🚫🥛 Sin Lactosa' },
   { value: 'Sin Azúcar', label: '🚫🍬 Sin Azúcar' },
   { value: 'Halal', label: '☪️ Halal' },
   { value: 'Kosher', label: '✡️ Kosher' },
];

export const DietaryOptions = memo(({ form, handleChange }) => {
   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Opciones dietéticas</h2>
         <TagSelector
            label="Selecciona las opciones que aplican"
            options={DIETARY_OPTIONS}
            selected={form.dietaryOptions}
            onChange={val => handleChange('dietaryOptions', val)}
         />
      </section>
   );
});