import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Container from "../components/layout/Container";
import Section from "../components/layout/Section";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import ActionButton from "../components/common/ActionButton";
import Tag from "../components/common/Tag";
import RatingBar from "../components/common/RatingBar";

import { establishmentService } from "../services/establishmentService.js";
import { ItemGallery } from "../components/common/ItemGallery";
import { photoService } from "../services/photoService.js";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;


export const Establishment = () => {
   const navigate = useNavigate();
   const { id } = useParams();

   const [establishment, setEstablishment] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [photos, setPhotos] = useState([]);

   const mapInstance = useRef(null);

   useEffect(() => {
      loadEstablishmentData();
   }, [id]);

   const loadEstablishmentData = async () => {
      try {
         setLoading(true);
         setError(null);
         const response = await establishmentService.getById(id);
         setEstablishment(response.data);
         const photosResponse = await photoService.getByEstablishment(id);
         setPhotos(photosResponse || []);
      } catch (err) {
         console.error('Error cargando establecimiento:', err);
         setError('No se pudo cargar el establecimiento');
      } finally {
         setLoading(false);
      }
   };

   // ── useCallback ref: se ejecuta exactamente cuando el nodo aparece en el DOM ──
   const mapContainer = useCallback((node) => {
      if (!node || mapInstance.current) {return;}
      if (!establishment?.location?.coordinates) {return;}

      const [lng, lat] = establishment.location.coordinates;

      const map = new mapboxgl.Map({
         container: node,
         style: 'mapbox://styles/mapbox/streets-v12',
         center: [lng, lat],
         zoom: 15,
      });

      new mapboxgl.Marker({ color: "#f97316" })
         .setLngLat([lng, lat])
         .addTo(map);

      mapInstance.current = map;

      return () => {
         if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
         }
      };
   }, [establishment]);

   if (loading) {
      return (
         <Container>
            <div className="flex items-center justify-center h-screen">
               <p className="text-lg">Cargando establecimiento...</p>
            </div>
         </Container>
      );
   }

   if (error || !establishment) {
      return (
         <Container>
            <div className="flex flex-col items-center justify-center h-screen">
               <p className="text-lg text-red-500 mb-4">
                  {error || 'Establecimiento no encontrado'}
               </p>
               <Button onClick={() => navigate('/')}>Volver al inicio</Button>
            </div>
         </Container>
      );
   }

   return (
      <div>
         <div className="relative h-72 max-w-3xl mx-auto">
            <img
               src={establishment.mainImage || "https://images.unsplash.com/photo-1559339352-11d035aa65de"}
               className="w-full h-full object-cover rounded-xl"
               alt={establishment.name}
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
               <button
                  onClick={() => navigate(-1)}
                  className="bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                  </svg>
               </button>
               <span className="text-white font-semibold">nexTapa</span>
               <button className="bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
               </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
               {establishment.verified && (
                  <Badge className="mb-2 inline-block">VERIFICADO</Badge>
               )}
               <h1 className="text-3xl font-bold text-white">
                  {establishment.name}
               </h1>
               <p className="text-sm text-neutral-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>{establishment.averageRating?.toFixed(1) || '0.0'} - {establishment.totalReviews || 0} reviews
               </p>
            </div>
         </div>

         <Container>
            {/* GALERIA DE IMAGENES */}
            <div className="flex gap-3 mt-4 overflow-x-auto">
               {photos.length > 0 ? (
                  photos.map((photo) => (
                     <img
                        key={photo._id}
                        src={photo.url}
                        alt={photo.alt || photo.caption || establishment.name}
                        className="h-20 w-32 object-cover rounded-lg shrink-0"
                     />
                  ))
               ) : (
                  <img
                     src={establishment.mainImage}
                     alt={establishment.name}
                     className="h-20 w-32 object-cover rounded-lg shrink-0"
                  />
               )}
            </div>

            {/* GALERÍA DE TAPAS */}
            <Section title="Nuestras Tapas">
               <ItemGallery establishmentId={establishment._id} />
            </Section>

            <div className="grid grid-cols-3 gap-3 mt-6">
               <ActionButton label="Menu" />
               <ActionButton
                  label="Telefono"
                  onClick={() => window.location.href = `tel:${establishment.phone}`}
               />
               <ActionButton label="Compartir" />
            </div>

            {/* DESCRIPCION */}
            {establishment.description && (
               <Section title="Descripción">
                  <p className="text-sm text-neutral-600">
                     {establishment.description}
                  </p>
               </Section>
            )}

            {/* SERVICIOS/CARACTERISTICAS */}
            {establishment.features && establishment.features.length > 0 && (
               <Section title="Servicios">
                  <div className="flex flex-wrap">
                     {establishment.features.map((feature, i) => (
                        <Badge key={i} variant="feature" className="mr-2 mb-2">
                           {feature}
                        </Badge>
                     ))}
                  </div>
               </Section>
            )}

            {/* TIPO DE COCINA */}
            {establishment.cuisineType && establishment.cuisineType.length > 0 && (
               <Section title="Tipo de Cocina">
                  <div className="flex flex-wrap">
                     {establishment.cuisineType.map((cuisine, i) => (
                        <Tag key={i} label={cuisine} />
                     ))}
                  </div>
               </Section>
            )}

            {/* RANGO DE PRECIOS */}
            {establishment.priceRange && (
               <Section title="Rango de precios">
                  <p className="text-sm text-neutral-50">
                     {establishment.priceRange}
                  </p>
               </Section>
            )}

            {/* EMAIL */}
            {establishment.email && (
               <Section title="Contacto">
                  <p className="text-sm text-neutral-50">
                     {establishment.email}
                  </p>
               </Section>
            )}

            {/* UBICACIÓN */}
            <Section title="Ubicación">

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-4">
                  <div className="rounded-xl shadow-md">
                     <div ref={mapContainer} style={{ width: '100%', height: '320px' }} />
                  </div>

                  <div className="flex flex-col justify-center">
                     <div className="bg-neutral-900/40 backdrop-blur-sm rounded-xl p-5 border border-neutral-800">
                        <h3 className="text-lg font-semibold mb-3 text-white">Dirección</h3>
                        <p className="text-sm text-neutral-300 leading-relaxed">
                           {establishment.address?.street}<br />
                           {establishment.address?.postalCode}{" "}
                           {establishment.address?.city},{" "}
                           {establishment.address?.province}
                        </p>
                        <div className="mt-4">
                           <button
                              onClick={() => {
                                 const [lng, lat] = establishment.location.coordinates;
                                 window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
                              }}
                              className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
                           >
                              Cómo llegar
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </Section>

            {/* HORARIOS */}
            {establishment.schedule && Object.keys(establishment.schedule).length > 0 && (
               <Section title="Horarios">
                  {Object.entries(establishment.schedule).map(([day, hours]) => (
                     <div key={day} className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-medium">{day}:</span>
                        <span className="text-neutral-600">

                           {hours.closed ? 'Cerrado' : `${hours.open} - ${hours.close}`}

                        </span>
                     </div>
                  ))}
               </Section>
            )}

            {/* OPINIONES */}
            <Section title="Opiniones">
               <div className="flex items-center gap-4">
                  <div>
                     <p className="text-3xl font-bold">
                        {establishment.averageRating?.toFixed(1) || '0.0'}
                     </p>
                     <p>{'⭐'.repeat(Math.round(establishment.averageRating || 0))}</p>
                     <p className="text-sm text-neutral-400">
                        {establishment.totalReviews || 0} reviews
                     </p>
                  </div>
                  <div className="flex-1 space-y-2">
                     <RatingBar stars={5} value={80} />
                     <RatingBar stars={4} value={10} />
                     <RatingBar stars={3} value={5} />
                  </div>
               </div>
            </Section>

            <div className="mt-8 mb-6">
               <Button className="w-full bg-orange-500 py-4 rounded-xl text-white font-semibold hover:bg-orange-600 transition-colors">
                  Registrate Aqui
               </Button>
            </div>
         </Container>
      </div>
   );
};