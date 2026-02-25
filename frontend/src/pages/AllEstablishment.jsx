import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Container from "../components/layout/Container";
import Header from "../components/layout/Header";
import Badge from "../components/common/Badge";

import { establishmentService } from "../services/establishmentService";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapPreview = ({ coordinates }) => {
   const mapContainer = useRef(null);

   useEffect(() => {
      if (!coordinates) return;

      const [lng, lat] = coordinates;

      const map = new mapboxgl.Map({
         container: mapContainer.current,
         style: "mapbox://styles/mapbox/dark-v11",
         center: [lng, lat],
         zoom: 14,
         interactive: false,
      });

      new mapboxgl.Marker({ color: "#f97316" })
         .setLngLat([lng, lat])
         .addTo(map);

      return () => map.remove();
   }, [coordinates]);

   return (
      <div
         ref={mapContainer}
         className="w-full h-full min-h-45"
      />
   );
};

export const AllEstablishment = () => {
   const navigate = useNavigate();
   const [establishments, setEstablishments] = useState([]);

   useEffect(() => {
      loadEstablishments();
   }, []);

   const loadEstablishments = async () => {
      const response = await establishmentService.getAll();
      setEstablishments(response.data || []);
   };

   return (
      <div className="bg-neutral-950 min-h-screen text-white">
         <Header />

         <Container>
            <div className="space-y-6 py-8">

               {establishments.map((est) => {
                  const coords = est.location?.coordinates;

                  return (
                     <div
                        key={est._id}
                        className="bg-neutral-900 rounded-2xl overflow-hidden shadow-xl border border-neutral-800 hover:border-orange-500/30 transition-colors duration-300"
                     >
                        <div className="flex flex-col md:flex-row">

                           {/* IMAGEN PRINCIPAL */}
                           {est.mainImage && (
                              <div
                                 className="md:w-56 h-52 md:h-auto shrink-0 cursor-pointer relative overflow-hidden"
                                 onClick={() => navigate(`/establishment/${est._id}`)}
                              >
                                 <img
                                    src={est.mainImage}
                                    alt={est.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                 />

                                 <div className="absolute inset-0 bg-linear-to-r from-transparent to-neutral-900/40 md:block hidden" />
                              </div>
                           )}

                           {/* DATOS */}
                           <div
                              className="p-5 flex-1 cursor-pointer flex flex-col justify-between"
                              onClick={() => navigate(`/establishment/${est._id}`)}
                           >
                              <div>
                                 <h2 className="text-xl font-bold text-white hover:text-orange-400 transition-colors">
                                    {est.name}
                                 </h2>

                                 <p className="text-sm text-neutral-400 mt-2 line-clamp-3">
                                    {est.description}
                                 </p>

                                 <div className="flex gap-2 flex-wrap mt-3">
                                    {est.categories?.map((cat, i) => (
                                       <Badge key={i} variant="feature">
                                          {cat}
                                       </Badge>
                                    ))}
                                 </div>
                              </div>

                              {/* BOTON MAPS */}
                              <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                                 <div className="flex items-center gap-1 text-sm">
                                    <span className="text-yellow-400 text-base">⭐</span>
                                    <span className="font-semibold text-white">
                                       {est.averageRating ? est.averageRating.toFixed(1) : "0.0"}
                                    </span>
                                    <span className="text-neutral-500">/ 5</span>
                                 </div>

                                 {coords && (
                                    <button
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          const [lng, lat] = coords;
                                          window.open(
                                             `https://www.google.com/maps?q=${lat},${lng}`,
                                             "_blank"
                                          );
                                       }}
                                       className="flex items-center gap-1.5 text-xs px-3 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-lg transition font-medium"
                                    >
                                       <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="w-3.5 h-3.5"
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                       >
                                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                                       </svg>
                                       Abrir en Maps
                                    </button>
                                 )}
                              </div>
                           </div>

                           {/* MAPA */}
                           {coords && (
                              <div className="md:w-72 h-52 md:h-auto shrink-0 border-t border-neutral-800 md:border-t-0 md:border-l">
                                 <MapPreview coordinates={coords} />
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