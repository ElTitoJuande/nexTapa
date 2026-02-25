

// src/admin/adminComponents/AdressAdmin.jsx
// Componente para editar la dirección de un establecimiento en el panel admin
import { memo } from 'react'; // memo para evitar re-render innecesarios si las props no cambian
import { SaveButton } from './SaveButton';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Geocodificación directa: dirección → [lng, lat]
const geocodeAddress = async (address) => {
   const { street, number, city, province, postalCode, country } = address;
   // Construir query con los campos que haya
   const query = [street, number, postalCode, city, province, country]
      .filter(Boolean)
      .join(', ');
   if (!query.trim()) {return null;}

   try {
      const res = await fetch(
         `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?types=address&language=es&access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();
      const coords = data.features?.[0]?.geometry?.coordinates;
      return coords || null; // [lng, lat]
   } catch (err) {
      console.error('Error en geocodificación directa:', err);
      return null;
   }
};

export const AdressAdmin = memo(({ address, onChange, onCoordinatesChange, saving }) => {
   const handleBlur = async () => { // Al perder foco, intentar geocodificar la dirección
      if (!onCoordinatesChange) {return;}
      const coords = await geocodeAddress(address);
      if (coords) {
         onCoordinatesChange(coords); // [lng, lat]
      }
   };

   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Dirección</h2>
         <div className="admin-grid-2">
            <div className="admin-field">
               <label>Calle *</label>
               <input className="admin-input" name="street" value={address.street} onChange={onChange} onBlur={handleBlur} required />
            </div>
            <div className="admin-field">
               <label>Número</label>
               <input className="admin-input" name="number" value={address.number} onChange={onChange} onBlur={handleBlur} />
            </div>
            <div className="admin-field">
               <label>Ciudad</label>
               <input className="admin-input" name="city" value={address.city} onChange={onChange} onBlur={handleBlur} required />
            </div>
            <div className="admin-field">
               <label>Provincia</label>
               <input className="admin-input" name="province" value={address.province} onChange={onChange} onBlur={handleBlur} required />
            </div>
            <div className="admin-field">
               <label>Código Postal</label>
               <input className="admin-input" name="postalCode" value={address.postalCode} onChange={onChange} onBlur={handleBlur} required />
            </div>
            <div className="admin-field">
               <label>País</label>
               <input className="admin-input" name="country" value={address.country} onChange={onChange} onBlur={handleBlur} />
            </div>
            <SaveButton saving={saving} />
         </div>
      </section>
   );
});