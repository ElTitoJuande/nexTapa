


import { memo } from 'react';
import { TagSelector } from './TagSelector';

const ALLERGENS = [
   { value: 'Gluten', label: '🌾 Gluten' },
   { value: 'Lactosa', label: '🥛 Lácteos' },
   { value: 'Huevo', label: '🥚 Huevo' },
   { value: 'Pescado', label: '🐟 Pescado' },
   { value: 'Marisco', label: '🦐 Marisco' },
   { value: 'Frutos secos', label: '🥜 Frutos Secos' },
   { value: 'Cacahuetes', label: '🥜 Cacahuetes' },
   { value: 'Soja', label: '🫘 Soja' },
   { value: 'Apio', label: '🥬 Apio' },
   { value: 'Mostaza', label: '🌿 Mostaza' },
   { value: 'Sésamo', label: '🌰 Sésamo' },
   { value: 'Sulfitos', label: '🍷 Sulfitos' },
   { value: 'Altramuz', label: '🌼 Altramuz' },
   { value: 'Moluscos', label: '🐚 Moluscos' },
];

export const Allergens = memo(({ form, handleChange }) => {
   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Alérgenos</h2>
         <p className="admin-section-desc">
                  Marca todos los alérgenos presentes. Esta información es importante para la seguridad de los clientes.
         </p>
         <TagSelector
            label=""
            options={ALLERGENS}
            selected={form.allergens}
            onChange={val => handleChange('allergens', val)}
         />
      </section>
   );
});