import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { itemService } from "../services/itemService";

export const AllTapas = () => {
   const navigate = useNavigate();
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadItems();
   }, []);

   const loadItems = async () => {
      try {
         setLoading(true);
         const response = await itemService.getAllItemns();
         setItems(response.data || []);
      } catch (error) {
         console.error("Error cargando items:", error);
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
            Cargando tapas...
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-neutral-950 text-white">

         <Header />

         <div className="max-w-3xl mx-auto px-4 pb-24 mt-4">
            <div className="grid grid-cols-2 gap-3">
               {items.map((item) => (
                  <div
                     key={item._id}
                     className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-orange-500/40 transition-colors duration-200"
                  >
                     {/* IMAGEN */}
                     <div
                        className="relative cursor-pointer"
                        onClick={() => navigate(`/items/${item._id}`)}
                     >
                        <img
                           src={item.mainImage || "/fallback.png"}
                           alt={item.name}
                           className="w-full h-40 object-cover"
                        />

                        <div className="absolute top-2 right-2">
                           {item.isFree || !item.price ? (
                              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                 Gratis
                              </span>
                           ) : (
                              <span className="bg-neutral-900/90 text-orange-400 text-xs font-bold px-2 py-1 rounded-full border border-orange-500/40">
                                 €{item.price}
                              </span>
                           )}
                        </div>

                        {item.featured && (
                           <div className="absolute top-2 left-2">
                              <span className="bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded-full">
                                 ⭐ Destacada
                              </span>
                           </div>
                        )}
                     </div>

                     {/* DATOS */}
                     <div className="p-3">
                    
                        <h3
                           className="font-bold text-sm text-white leading-tight cursor-pointer hover:text-orange-400 transition-colors"
                           onClick={() => navigate(`/items/${item._id}`)}
                        >
                           {item.name}
                        </h3>

                        {item.averageRating > 0 && (
                           <div className="flex items-center gap-1 mt-1">
                              <span className="text-yellow-400 text-xs">⭐</span>
                              <span className="text-xs text-neutral-400">
                                 {item.averageRating.toFixed(1)}
                              </span>
                           </div>
                        )}

                        {/* Separador */}
                        <div className="border-t border-neutral-800 mt-2 pt-2">
                           {/* Nombre establecimiento */}
                           <p className="text-xs text-neutral-500 truncate">
                              {item.establishment?.name}
                           </p>

                           {/* Botón ir al establecimiento */}
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 navigate(`/establishment/${item.establishment?._id}`);
                              }}
                              className="mt-1.5 w-full text-xs py-1.5 rounded-lg bg-neutral-800 hover:bg-orange-500 text-neutral-400 hover:text-white transition-colors duration-200"
                           >
                              Ver local →
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

      </div>
   );
};