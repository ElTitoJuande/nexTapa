// src/admin/adminComponents/MapboxPicker.jsx

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SaveButton } from './SaveButton';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export const MapboxPicker = ({ coordinates, onChange, onAddressChange, saving }) => {
   const mapContainer = useRef(null);
   const map = useRef(null);
   const marker = useRef(null);

   const defaultCoords = coordinates?.length === 2 ? coordinates : [-3.7038, 40.4168];
   const [lng, setLng] = useState(defaultCoords[0]);
   const [lat, setLat] = useState(defaultCoords[1]);
   const [geocoding, setGeocoding] = useState(false);

   // ── Geocodificación inversa: [lng, lat] → dirección ──────────────
   const reverseGeocode = useCallback(async (newLng, newLat) => {
      if (!onAddressChange) {return;}
      try {
         setGeocoding(true);
         const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${newLng},${newLat}.json?types=address&language=es&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
         );
         const data = await res.json();
         const feature = data.features?.[0];
         if (!feature) {return;}

         const context = feature.context || [];
         const get = (type) => context.find(c => c.id.startsWith(type))?.text || '';

         onAddressChange({
            street:     feature.text || '',
            number:     feature.address || '',
            city:       get('place') || get('locality') || '',
            province:   get('region') || '',
            postalCode: get('postcode') || '',
            country:    get('country') || '',
         });
      } catch (err) {
         console.error('Error en geocodificación inversa:', err);
      } finally {
         setGeocoding(false);
      }
   }, [onAddressChange]);

   // ── Actualizar posición completa ──────────────────────────────────
   const updatePosition = useCallback((newLng, newLat) => {
      const roundedLng = parseFloat(newLng.toFixed(6));
      const roundedLat = parseFloat(newLat.toFixed(6));
      setLng(roundedLng);
      setLat(roundedLat);
      onChange([roundedLng, roundedLat]);
      reverseGeocode(roundedLng, roundedLat);
   }, [onChange, reverseGeocode]);

   // ── Inicializar mapa ──────────────────────────────────────────────
   useEffect(() => {
      if (map.current) {return;}
      if (!mapContainer.current) {return;}

      map.current = new mapboxgl.Map({
         container: mapContainer.current,
         style: 'mapbox://styles/mapbox/streets-v12',
         center: [lng, lat],
         zoom: 14,
      });

      marker.current = new mapboxgl.Marker({ draggable: true, color: '#E53E3E' })
         .setLngLat([lng, lat])
         .addTo(map.current);

      marker.current.on('dragend', () => {
         const { lng: newLng, lat: newLat } = marker.current.getLngLat();
         updatePosition(newLng, newLat);
      });

      map.current.on('click', (e) => {
         marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
         updatePosition(e.lngLat.lng, e.lngLat.lat);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

   }, []);

   // ── Sincronizar si las coordenadas cambian desde fuera (dirección → mapa) ──
   useEffect(() => {
      if (!map.current || !marker.current) {return;}
      if (!coordinates || coordinates.length !== 2) {return;}
      const [newLng, newLat] = coordinates;
      if (Math.abs(newLng - lng) > 0.0001 || Math.abs(newLat - lat) > 0.0001) {
         setLng(newLng);
         setLat(newLat);
         marker.current.setLngLat([newLng, newLat]);
         map.current.flyTo({ center: [newLng, newLat], zoom: 15 });
      }
   }, [coordinates]);

   // ── Inputs manuales ───────────────────────────────────────────────
   const handleManualChange = (newLng, newLat) => {
      if (map.current && marker.current) {
         marker.current.setLngLat([newLng, newLat]);
         map.current.flyTo({ center: [newLng, newLat], zoom: 15 });
      }
      onChange([newLng, newLat]);
      reverseGeocode(newLng, newLat);
   };

   return (
      <div className="admin-section">
         <h2 className="admin-section-title">
            Ubicación en el mapa
            {geocoding && (
               <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 8, fontWeight: 400 }}>
                  Obteniendo dirección...
               </span>
            )}
         </h2>

         <div
            ref={mapContainer}
            style={{ width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden' }}
         />

         <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '8px 0 12px' }}>
            Haz clic en el mapa o arrastra el marcador. La dirección se actualizará automáticamente.
         </p>

         <div className="admin-grid-2">
            <div className="admin-field">
               <label>Longitud</label>
               <input
                  type="number"
                  step="any"
                  value={lng}
                  className="admin-input"
                  onChange={(e) => {
                     const val = parseFloat(e.target.value);
                     setLng(val);
                     handleManualChange(val, lat);
                  }}
               />
            </div>
            <div className="admin-field">
               <label>Latitud</label>
               <input
                  type="number"
                  step="any"
                  value={lat}
                  className="admin-input"
                  onChange={(e) => {
                     const val = parseFloat(e.target.value);
                     setLat(val);
                     handleManualChange(lng, val);
                  }}
               />
            </div>
         </div>

         <div className="admin-form-footer">
            <SaveButton saving={saving} />
         </div>
      </div>
   );
};