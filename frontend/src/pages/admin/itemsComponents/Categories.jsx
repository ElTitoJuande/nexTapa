

import { memo } from 'react';
import { TagSelector } from './TagSelector';

const CATEGORIES = [
   { value: 'Carne', label: '🥩 Carne' },
   { value: 'Pescado', label: '🐟 Pescado' },
   { value: 'Marisco', label: '🦐 Marisco' },
   { value: 'Verduras', label: '🥦 Verduras' },
   { value: 'Queso', label: '🧀 Queso' },
   { value: 'Embutido', label: '🥓 Embutido' },
   { value: 'Jamon', label: '🍖 Jamón' },
   { value: 'Huevo', label: '🍳 Huevo' },
   { value: 'Tortilla', label: '🟡 Tortilla' },
   { value: 'Frito', label: '🍟 Frito' },
   { value: 'Plancha', label: '🔥 A la Plancha' },
   { value: 'Horno', label: '♨️ Al Horno' },
   { value: 'Guiso', label: '🍲 Guiso' },
   { value: 'Ensalada', label: '🥗 Ensalada' },
   { value: 'Croqueta', label: '🟤 Croqueta' },
   { value: 'Patatas', label: '🥔 Patatas' },
   { value: 'Pan/Tostada', label: '🍞 Pan/Tostada' },
   { value: 'Montadito', label: '🥪 Montadito' },
   { value: 'Hamburguesa', label: '🍔 Hamburguesa' },
   { value: 'Arroz', label: '🥘 Arroz' },
   { value: 'Caldos', label: '🥣 Caldos' },
   { value: 'Gazpacho', label: '🍅 Gazpacho' },
   { value: 'Migas', label: '🌾 Migas' },
   { value: 'Encurtido', label: '🥒 Encurtidos' }, 
   { value: 'Legumbres', label: '🌱 Legumbres' },  
   { value: 'Postre', label: '🍰 Postre' },
   { value: 'Bebida', label: '🍷 Bebida' },
];

export const Categories = memo(({ form, handleChange }) => {
   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Categorías</h2>
         <TagSelector
            label="Selecciona las categorías que mejor describen esta tapa"
            options={CATEGORIES}
            selected={form.categories}
            onChange={val => handleChange('categories', val)}
         />
      </section>
   );
});