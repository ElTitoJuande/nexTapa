

// src/pages/AllTapas.jsx
// Página que muestra todas las tapas disponibles, ordenadas por proximidad al usuario
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { itemService } from "../services/itemService";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { cloudinaryPresets } from "../utils/cloudinaryHelpers.js";
import { MapPin } from "lucide-react";

export const AllTapas = () => {
   const navigate = useNavigate();
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const { coords, loading: geoLoading } = useGeolocation();

   const loadItems = useCallback(async () => {
      try {
         setLoading(true);
         const params = coords ? { lat: coords.lat, lng: coords.lng } : {};
         const response = await itemService.getAllItems(params);
         setItems(response.data || []);
      } catch (error) {
         console.error("Error cargando items:", error);
      } finally {
         setLoading(false);
      }
   }, [coords]);

   useEffect(() => {
      if (!geoLoading) {loadItems();}
   }, [loadItems, geoLoading]);

   if (loading && items.length === 0) {
      return (
         <div className="min-h-screen bg-transparent flex flex-col items-center justify-center text-white">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-neutral-400 italic">
               {geoLoading ? "Obteniendo tu ubicación..." : "Buscando las mejores tapas cerca de ti..."}
            </p>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-transparent text-white">
         <Header />

         <div className="max-w-3xl mx-auto px-4 pb-24 mt-4">
            <div className="flex items-center gap-2 mb-6">
               <MapPin className="text-orange-500" size={25} />
               <h1 className="text-xl font-bold">Tapas por proximidad</h1>
            </div>

            <div className="grid grid-cols-2 gap-3">
               {items.map((item) => {
                  const tapaUnavailable = item.available === false;
                  const notServedToday = item.servedToday === false;
                  const establishmentClosed = item.establishment?.isOpen === false;
                  const unavailable = tapaUnavailable || notServedToday || establishmentClosed;

                  const closedLabel = tapaUnavailable
                     ? "Tapa no disponible"
                     : notServedToday
                        ? `Solo: ${item.availableOnlyOn?.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`
                        : "Local cerrado";

                  return (
                     <div
                        key={item._id}
                        className={`bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-orange-500/40 transition-all duration-300 flex flex-col ${
                           unavailable ? "opacity-50" : ""
                        }`}
                     >
                        {/* IMAGEN — tapaCard: 400×300 fill, ~30-50 KB vs 2000px original */}
                        <div
                           className="relative cursor-pointer group"
                           onClick={() => navigate(`/items/${item.slug}`, { state: { distance: item.distance } })}
                        >
                           <img
                              src={cloudinaryPresets.tapaCard(item.mainImage || "/Logo.png")}
                              alt={item.name}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.target.onerror = null; e.target.src = "/Logo.png"; }}
                           />

                           <div className="absolute top-2 right-2">
                              <span className="bg-neutral-900/90 text-orange-400 text-xs font-bold px-2 py-1 rounded-full border border-orange-500/40 backdrop-blur-sm">
                                 {item.modalities?.[0]?.price === 0
                                    ? "Gratis"
                                    : `€${item.modalities?.[0]?.price ?? "—"}`}
                              </span>
                           </div>

                           {unavailable && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full border border-neutral-600 backdrop-blur-sm text-center">
                                    {closedLabel}
                                 </span>
                              </div>
                           )}
                        </div>

                        {/* DATOS */}
                        <div className="p-3 flex flex-col flex-1 justify-between">
                           <div>
                              <h3
                                 className="font-bold text-sm text-white leading-tight cursor-pointer hover:text-orange-400 transition-colors line-clamp-2"
                                 onClick={() => navigate(`/items/${item.slug}`, { state: { distance: item.distance } })}
                              >
                                 {item.name}
                              </h3>
                              <div className="flex items-center justify-between mt-2">
                                 {item.averageRating > 0 ? (
                                    <div className="flex items-center gap-1">
                                       <span className="text-yellow-400 text-xs">⭐</span>
                                       <span className="text-xs text-neutral-400">
                                          {Number(item.averageRating).toFixed(1)}
                                       </span>
                                    </div>
                                 ) : (
                                    <span />
                                 )}
                                 {typeof item.distance === "number" && (
                                    <span className="text-[10px] text-orange-500/80 font-medium">
                                       {item.distance < 1000
                                          ? `${Math.round(item.distance)}m`
                                          : `${(item.distance / 1000).toFixed(1)}km`}
                                    </span>
                                 )}
                              </div>
                           </div>

                           <div className="border-t border-neutral-800 mt-3 pt-3">
                              <p className="text-[11px] text-neutral-500 truncate mb-2">
                                 📍 {item.establishment?.name || "Local desconocido"}
                              </p>
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/establishment/${item.establishment?.slug}`, {
                                       state: { distance: item.distance }
                                    });
                                 }}
                                 className="w-full text-[11px] py-2 rounded-xl bg-neutral-800 hover:bg-orange-500 text-neutral-300 hover:text-white transition-all duration-200 font-medium"
                              >
                                 Ver local
                              </button>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
};
