// src/pages/SearchPage.jsx
// Pagina /search - carga inicial rapida + lazy loading al hacer scroll

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
   Search, X, Loader2, UtensilsCrossed,
   Star, Gift, Sparkles,
} from "lucide-react";
import { api } from "../services/api";
import { useSearch } from "../hooks/useSearch";
import Header from "../components/layout/Header";

const getMainPrice = (modalities = []) => {
   if (!modalities?.length) {return null;}
   const first = modalities[0];
   if (first.isFree) {return "Gratis";}
   return first.price != null ? `${first.price.toFixed(2)} EUR` : null;
};

const categoryMeta = {
   nearby:    { label: "Cercano",    color: "text-blue-400",    bg: "bg-blue-500/10"    },
   verified:  { label: "Verificado", color: "text-emerald-400", bg: "bg-emerald-500/10" },
   top_rated: { label: "Top",        color: "text-yellow-400",  bg: "bg-yellow-500/10"  },
   free:      { label: "Gratis",     color: "text-green-400",   bg: "bg-green-500/10"   },
   recent:    { label: "Nuevo",      color: "text-orange-400",  bg: "bg-orange-500/10"  },
};

const highlight = (text = "", query = "") => {
   if (!query || query.length < 2) {return text;}
   const regex = new RegExp(`(${query.trim()})`, "gi");
   return text.split(regex).map((part, i) =>
      regex.test(part)
         ? <mark key={i} className="bg-orange-500/20 text-orange-400 rounded-sm px-0.5 not-italic">{part}</mark>
         : part
   );
};

// Variante B fijada como diseno final para el fondo del buscador.
const SEARCH_DOCK_STYLE = {
   shell: "rounded-[18px] border border-orange-400/35 bg-[linear-gradient(120deg,rgba(255,106,0,0.18),rgba(12,12,14,0.92)_28%,rgba(12,12,14,0.95)_72%,rgba(255,106,0,0.12))] shadow-[0_16px_34px_rgba(0,0,0,0.52)]",
   glowTop: "-top-12 left-8 right-8 h-16 bg-orange-400/25 blur-2xl",
   glowBottom: "-bottom-10 left-16 right-16 h-12 bg-orange-500/12 blur-2xl",
   input: "m-[7px] rounded-[14px] border border-orange-300/20 bg-black/45 px-4 py-2.5 backdrop-blur-md focus-within:border-orange-300/50 focus-within:ring-1 focus-within:ring-orange-400/20",
};

const GridCard = ({ item, onClick, index = 0 }) => {
   const meta = categoryMeta[item._category] || categoryMeta.recent;
   const price = getMainPrice(item.modalities);
   const img = item.mainImage || null;

   return (
      <button
         onClick={onClick}
         className="relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800/60 group active:scale-95 transition-transform duration-150"
         style={{
            aspectRatio: "4/3",
            animationDelay: `${index * 30}ms`,
            animation: "fadeUp 0.3s ease forwards",
            opacity: 0,
         }}
      >
         {img ? (
            <img
               src={img}
               alt={item.name}
               loading="lazy"
               decoding="async"
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-800/60">
               <UtensilsCrossed className="w-8 h-8 text-neutral-700" />
            </div>
         )}

         <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/5 to-transparent" />

         <span className={`absolute top-1.5 left-1.5 text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full backdrop-blur-sm ${meta.bg} ${meta.color}`}>
            {meta.label}
         </span>

         <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="text-white text-[11px] font-bold leading-tight truncate">{item.name}</p>
            <p className="text-neutral-400 text-[10px] truncate mt-0.5">
               {item.establishment?.name || ""}
            </p>
            {price && <span className="text-orange-400 text-[10px] font-bold">{price}</span>}
         </div>
      </button>
   );
};

const DropdownResult = ({ item, query, onClick }) => {
   const price = getMainPrice(item.modalities);
   const isEst = item._type === "establishment";

   return (
      <button
         onMouseDown={onClick}
         className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors text-left"
      >
         <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-neutral-800 flex items-center justify-center">
            {item.mainImage
               ? <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" />
               : <UtensilsCrossed className="w-4 h-4 text-neutral-600" />
            }
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{highlight(item.name, query)}</p>
            <p className="text-xs text-neutral-500 truncate">
               {isEst ? (item.address?.neighborhood || item.address?.city) : item.establishment?.name}
            </p>
         </div>
         <div className="flex flex-col items-end gap-1 shrink-0">
            {price && <span className="text-[11px] font-bold text-orange-400">{price}</span>}
            {isEst && (
               <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  item.isOpen ? "bg-green-500/15 text-green-400" : "bg-neutral-800 text-neutral-600"
               }`}>
                  {item.isOpen ? "Abierto" : "Cerrado"}
               </span>
            )}
         </div>
      </button>
   );
};

const SectionHeader = ({ icon: Icon, label, color }) => (
   <div className="flex items-center gap-2 px-1 mb-3 mt-6 first:mt-0">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className={`text-[11px] font-black tracking-widest uppercase ${color}`}>{label}</span>
   </div>
);

const GridSkeleton = ({ count = 9 }) => (
   <div className="grid grid-cols-2 gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
         <div
            key={i}
            className="rounded-xl bg-neutral-900 animate-pulse"
            style={{ aspectRatio: "4/3", animationDelay: `${i * 40}ms` }}
         />
      ))}
   </div>
);

export const SearchPage = () => {
   const navigate = useNavigate();
   const inputRef = useRef(null);
   const wrapperRef = useRef(null);
   const loaderRef = useRef(null);

   const [initial, setInitial] = useState([]);
   const [more, setMore] = useState([]);
   const [loadingInitial, setLoadingInitial] = useState(true);
   const [loadingMore, setLoadingMore] = useState(false);
   const [moreLoaded, setMoreLoaded] = useState(false);

   const { query, setQuery, results, loading, isOpen, clear, close, open } = useSearch({ limit: 6 });

   useEffect(() => {
      setTimeout(() => inputRef.current?.focus(), 100);
   }, []);

   useEffect(() => {
      const load = async () => {
         try {
            setLoadingInitial(true);
            let url = "/search/suggestions";
            try {
               const pos = await new Promise((resolve, reject) =>
                  navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
               );
               url = `/search/suggestions?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`;
            } catch {
               // Sin coordenadas.
            }

            const res = await api.get(url);
            if (res.data.success) {
               setInitial(res.data.data.grid.filter((i) => i._type !== "establishment"));
            }
         } catch {
            // Carga silenciosa.
         } finally {
            setLoadingInitial(false);
         }
      };

      load();
   }, []);

   const loadMore = useCallback(async () => {
      if (moreLoaded || loadingMore) {return;}
      try {
         setLoadingMore(true);
         const res = await api.get("/search/suggestions/more");
         if (res.data.success) {
            setMore(res.data.data.grid.filter((i) => i._type !== "establishment"));
         }
         setMoreLoaded(true);
      } catch {
         // Carga silenciosa.
      } finally {
         setLoadingMore(false);
      }
   }, [moreLoaded, loadingMore]);

   useEffect(() => {
      if (loadingInitial) {return;}
      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting) {loadMore();}
         },
         { threshold: 0.1 }
      );
      if (loaderRef.current) {observer.observe(loaderRef.current);}
      return () => observer.disconnect();
   }, [loadingInitial, loadMore]);

   useEffect(() => {
      const handler = (e) => {
         if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {close();}
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, [close]);

   const handleSelect = (item) => {
      clear();
      navigate(`/items/${item.slug}`);
   };

   const hasDropdown = isOpen && query.length >= 2;
   const dropdownItems = results.items ?? [];
   const hasResults = dropdownItems.length > 0;

   const moreGrouped = more.reduce((acc, item) => {
      const cat = item._category || "recent";
      if (!acc[cat]) {acc[cat] = [];}
      acc[cat].push(item);
      return acc;
   }, {});

   const moreSections = [
      { key: "top_rated", icon: Star, label: "Mejor valorados", color: "text-yellow-400" },
      { key: "recent", icon: Sparkles, label: "Recien llegados", color: "text-orange-400" },
   ];

   return (
      <>
         <style>{`
            @keyframes fadeUp {
               from { opacity: 0; transform: translateY(6px); }
               to   { opacity: 1; transform: translateY(0); }
            }
         `}</style>

         <div className="min-h-screen bg-transparent">
            <Header showSearch={false} />

            <div className="mx-auto max-w-3xl">
               <div className="sticky top-0 z-40 px-4 pt-2 pb-3">
                  <div ref={wrapperRef} className="relative">
                     <div className={`relative overflow-hidden transition-all duration-300 ${SEARCH_DOCK_STYLE.shell}`}>
                        <div className={`pointer-events-none absolute ${SEARCH_DOCK_STYLE.glowTop}`} />
                        <div className={`pointer-events-none absolute ${SEARCH_DOCK_STYLE.glowBottom}`} />

                        <div className={`relative flex items-center gap-3 transition-all duration-300 ${SEARCH_DOCK_STYLE.input}`}>
                           {loading
                              ? <Loader2 className="w-4 h-4 text-neutral-500 animate-spin shrink-0" />
                              : <Search className="w-4 h-4 text-neutral-500 shrink-0" />
                           }
                           <input
                              ref={inputRef}
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              onFocus={open}
                              placeholder="Busca tapas, bares, barrios..."
                              className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
                           />
                           {query && (
                              <button onClick={clear} className="text-neutral-500 hover:text-neutral-300 transition-colors shrink-0">
                                 <X className="w-4 h-4" />
                              </button>
                           )}
                        </div>
                     </div>

                     {hasDropdown && (
                        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
                           {!hasResults && !loading && (
                              <div className="px-4 py-8 text-center">
                                 <p className="text-sm text-neutral-500">Sin resultados para <span className="text-white">"{query}"</span></p>
                              </div>
                           )}
                           {hasResults && (
                              <>
                                 <div className="px-4 pt-3 pb-1">
                                    <p className="text-[10px] font-black tracking-widest text-neutral-600 uppercase">Tapas</p>
                                 </div>
                                 {dropdownItems.map((item) => (
                                    <DropdownResult key={item._id} item={item} query={query} onClick={() => handleSelect(item)} />
                                 ))}
                                 <div className="px-4 py-2.5 border-t border-neutral-800/40 bg-neutral-950/60 text-center">
                                    <p className="text-[11px] text-neutral-600">
                                       {dropdownItems.length} resultado{dropdownItems.length !== 1 ? "s" : ""} para "{query}"
                                    </p>
                                 </div>
                              </>
                           )}
                        </div>
                     )}
                  </div>
               </div>

               <div className="px-3 pb-24 pt-4">
                  {loadingInitial ? (
                     <GridSkeleton count={9} />
                  ) : initial.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Search className="w-10 h-10 text-neutral-800" />
                        <p className="text-neutral-600 text-sm">Empieza a buscar tu proxima tapa</p>
                     </div>
                  ) : (
                     <>
                        <div className="flex items-center gap-2 px-1 mb-3">
                           <Gift className="w-3.5 h-3.5 text-green-400" />
                           <span className="text-[11px] font-black tracking-widest uppercase text-green-400">Tapas gratis</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                           {initial.map((item, i) => (
                              <GridCard key={`${item._id}-${i}`} item={item} onClick={() => handleSelect(item)} index={i} />
                           ))}
                        </div>

                        <div ref={loaderRef} className="mt-6">
                           {loadingMore && (
                              <>
                                 <div className="flex items-center gap-2 px-1 mb-3 mt-2">
                                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                                    <span className="text-[11px] font-black tracking-widest uppercase text-yellow-400">Cargando mas...</span>
                                 </div>
                                 <GridSkeleton count={6} />
                              </>
                           )}

                           {moreLoaded && moreSections.map(({ key, icon, label, color }) => {
                              const items = moreGrouped[key];
                              if (!items?.length) {return null;}
                              return (
                                 <div key={key}>
                                    <SectionHeader icon={icon} label={label} color={color} />
                                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                                       {items.map((item, i) => (
                                          <GridCard
                                             key={`${item._id}-${key}-${i}`}
                                             item={item}
                                             onClick={() => handleSelect(item)}
                                             index={i}
                                          />
                                       ))}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>
      </>
   );
};
