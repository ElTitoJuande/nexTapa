


// src/pages/AllEstablishment.jsx
// Página que muestra todos los establecimientos disponibles, ordenados por proximidad al usuario
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Container from "../components/layout/Container";
import Header from "../components/layout/Header";
import Badge from "../components/common/Badge";
import { useGeolocation } from "../hooks/useGeolocation";
import { establishmentService } from "../services/establishmentService";
import { cloudinaryPresets } from "../utils/cloudinaryHelpers.js";
import { MapPinOff, ExternalLink } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// MapPreview: lazy — se monta solo cuando entra en viewport
// Click/tap abre la ubicación en Google Maps
const MapPreview = ({ coordinates }) => {
   const mapContainer = useRef(null);
   const mapInstance = useRef(null);
   const observerRef = useRef(null);

   useEffect(() => {
      if (!coordinates || !mapContainer.current) {return;}

      observerRef.current = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting && !mapInstance.current) {
               const [lng, lat] = coordinates;
               mapInstance.current = new mapboxgl.Map({
                  container: mapContainer.current,
                  style: "mapbox://styles/mapbox/dark-v11",
                  center: [lng, lat],
                  zoom: 14,
                  interactive: false,
               });
               new mapboxgl.Marker({ color: "#f97316" })
                  .setLngLat([lng, lat])
                  .addTo(mapInstance.current);
               observerRef.current.disconnect();
            }
         },
         { threshold: 0.1 }
      );

      observerRef.current.observe(mapContainer.current);

      return () => {
         observerRef.current?.disconnect();
         mapInstance.current?.remove();
         mapInstance.current = null;
      };
   }, [coordinates]);

   const handleOpenGoogleMaps = (e) => {
      e.stopPropagation();
      const [lng, lat] = coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
   };

   return (
      <div
         className="relative w-full h-full cursor-pointer group"
         onClick={handleOpenGoogleMaps}
         title="Ver en Google Maps"
      >
         <div ref={mapContainer} className="w-full h-full" />
         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
            <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-80 transition-opacity duration-200 drop-shadow" />
         </div>
      </div>
   );
};

export const AllEstablishment = () => {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const [establishments, setEstablishments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [usingFallback, setUsingFallback] = useState(false);
   const { coords, loading: geoLoading, error: geoError, clearCache } = useGeolocation();
   const openNowOnly = searchParams.get("openNow") === "true";

   const loadNearby = useCallback(async () => {
      try {
         setLoading(true);
         const response = await establishmentService.getNearby({
            lat: coords.lat,
            lng: coords.lng,
            limit: 50,
         });
         setEstablishments(response.data || []);
         setUsingFallback(false);
      } catch (error) {
         console.error("Error cargando establecimientos cercanos:", error);
      } finally {
         setLoading(false);
      }
   }, [coords]);

   const loadFallback = useCallback(async () => {
      try {
         setLoading(true);
         const response = await establishmentService.getAll();
         setEstablishments((response.data || []).slice(0, 50));
         setUsingFallback(true);
      } catch (error) {
         console.error("Error cargando establecimientos:", error);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      if (geoLoading) {return;}
      if (coords) {loadNearby();}
      else {loadFallback();}
   }, [coords, geoLoading, loadNearby, loadFallback]);

   const visibleEstablishments = openNowOnly
      ? establishments.filter((est) => est.isOpen === true)
      : establishments;

   if (geoLoading || loading) {
      return (
         <div className="bg-transparent min-h-screen text-white">
            <Header />
            <Container>
               <div className="space-y-4 py-8">
                  {[...Array(3)].map((_, i) => (
                     <div key={i} className="bg-neutral-900 rounded-2xl h-36 animate-pulse" />
                  ))}
               </div>
            </Container>
         </div>
      );
   }

   return (
      <div className="bg-transparent min-h-screen text-white">
         <Header />

         <Container>
            {usingFallback && (
               <div className="flex items-center gap-2 py-4 mt-2">
                  <MapPinOff size={14} className="text-neutral-500 shrink-0" />
                  <p className="text-xs text-neutral-500">
                     Ubicación no disponible — mostrando todos los establecimientos.
                  </p>
                  {geoError && (
                     <button
                        onClick={() => { clearCache(); window.location.reload(); }}
                        className="text-xs text-orange-500 hover:text-orange-400 underline transition-colors shrink-0"
                     >
                        Activar ubicación
                     </button>
                  )}
               </div>
            )}

            {openNowOnly && (
               <div className="mt-2 flex items-center gap-2 py-1.5">
                  <p className="text-xs text-orange-300">
                     Filtro activo: mostrando solo locales abiertos ahora ({visibleEstablishments.length}).
                  </p>
                  <button
                     onClick={() => navigate("/establishments")}
                     className="text-xs text-orange-500 hover:text-orange-400 underline transition-colors shrink-0"
                  >
                     Quitar filtro
                  </button>
               </div>
            )}

            <div className="space-y-4 py-4">
               {visibleEstablishments.length === 0 && (
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-6 text-center">
                     <p className="text-sm text-neutral-300">
                        {openNowOnly
                           ? "No hay establecimientos abiertos ahora en esta zona."
                           : "No se encontraron establecimientos."}
                     </p>
                  </div>
               )}

               {visibleEstablishments.map((est) => {
                  const estCoords = est.location?.coordinates;
                  const isOpen = est.isOpen === true;

                  return (
                     <div
                        key={est._id}
                        className={`relative bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-orange-500/30 transition-colors duration-300 ${!isOpen ? "opacity-60" : ""}`}
                     >
                        {/* ── MÓVIL: 2 columnas (foto+datos superpuestos | mapa)
                            ── DESKTOP: 3 columnas (foto | info+botón | mapa) */}
                        <div className="flex flex-row h-36 md:h-52">

                           {/* BLOQUE 1 — Foto
                               Móvil: ancho fijo, datos superpuestos con degradado
                               Desktop: solo foto, sin overlay de datos */}
                           <div
                              className="relative flex-1 md:flex-none md:w-56 cursor-pointer overflow-hidden"
                              onClick={() => navigate(`/establishment/${est.slug}`, { state: { distance: est.distance } })}
                           >
                              {est.mainImage ? (
                                 <img
                                    src={cloudinaryPresets.card(est.mainImage)}
                                    alt={est.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                 />
                              ) : (
                                 <div className="w-full h-full bg-neutral-800" />
                              )}

                              {/* Degradado + datos superpuestos — SOLO MÓVIL */}
                              <div className="md:hidden absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
                              <div className="md:hidden absolute inset-0 flex flex-col justify-between p-3">
                                 {!isOpen && (
                                    <span className="self-start bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-neutral-600 backdrop-blur-sm">
                                       Cerrado
                                    </span>
                                 )}
                                 <div className={!isOpen ? "" : "mt-auto"}>
                                    <h2 className="text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow">
                                       {est.name}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                       {typeof est.distance === "number" && (
                                          <span className="text-[11px] text-orange-400 font-semibold">
                                             {est.distance < 1000
                                                ? `${Math.round(est.distance)} m`
                                                : `${(est.distance / 1000).toFixed(1)} km`}
                                          </span>
                                       )}
                                       {est.averageRating > 0 && (
                                          <div className="flex items-center gap-0.5">
                                             <span className="text-yellow-400 text-xs">⭐</span>
                                             <span className="text-xs text-white font-semibold">
                                                {Number(est.averageRating).toFixed(1)}
                                             </span>
                                          </div>
                                       )}
                                    </div>
                                    {est.categories?.length > 0 && (
                                       <div className="flex gap-1 flex-wrap mt-1.5">
                                          {est.categories.slice(0, 2).map((cat, i) => (
                                             <Badge key={i} variant="feature">{cat}</Badge>
                                          ))}
                                       </div>
                                    )}
                                 </div>
                              </div>

                              {/* Badge cerrado — SOLO DESKTOP, sobre la foto */}
                              {!isOpen && (
                                 <div className="hidden md:block absolute top-3 left-3 z-10">
                                    <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full border border-neutral-600 backdrop-blur-sm">
                                       Cerrado
                                    </span>
                                 </div>
                              )}
                           </div>

                           {/* BLOQUE 2 — Info + botón — SOLO DESKTOP */}
                           <div
                              className="hidden md:flex flex-col justify-between flex-1 min-w-0 p-5 cursor-pointer"
                              onClick={() => navigate(`/establishment/${est.slug}`, { state: { distance: est.distance } })}
                           >
                              <div>
                                 <h2 className="text-xl font-bold text-white hover:text-orange-400 transition-colors">
                                    {est.name}
                                 </h2>
                                 {typeof est.distance === "number" && (
                                    <p className="text-sm text-orange-400 mt-2">
                                       {est.distance < 1000
                                          ? `${Math.round(est.distance)} m`
                                          : `${(est.distance / 1000).toFixed(1)} km`}
                                    </p>
                                 )}
                                 <div className="flex gap-2 flex-wrap mt-3">
                                    {est.categories?.map((cat, i) => (
                                       <Badge key={i} variant="feature">{cat}</Badge>
                                    ))}
                                 </div>
                              </div>
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                 <div className="flex items-center gap-1">
                                    <span className="text-yellow-400 text-base">⭐</span>
                                    <span className="font-semibold text-white text-sm">
                                       {Number(est.averageRating || 0).toFixed(1)}
                                    </span>
                                 </div>
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       if (!estCoords) {return;}
                                       const [lng, lat] = estCoords;
                                       window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
                                    }}
                                    className="flex items-center gap-1.5 text-xs px-3 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-lg transition font-medium text-white"
                                 >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Abrir en Maps
                                 </button>
                              </div>
                           </div>

                           {/* BLOQUE 3 — Mapa (ambos breakpoints, ancho diferente) */}
                           {estCoords ? (
                              <div className="w-32 md:w-72 shrink-0 border-l border-neutral-800">
                                 <MapPreview coordinates={estCoords} />
                              </div>
                           ) : (
                              <div className="w-32 md:w-72 shrink-0 border-l border-neutral-800 bg-neutral-800 flex items-center justify-center">
                                 <span className="text-[10px] text-neutral-500">Sin ubicación</span>
                              </div>
                           )}
                        </div>
                     </div>
                  );
               })}
            </div>
         </Container>
      </div>
   );
};
