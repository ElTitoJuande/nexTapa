

// src/components/search/SearchDropdown.jsx
// Dropdown de búsqueda global reutilizable

import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Store, UtensilsCrossed } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getMainPrice = (modalities = []) => {
   if (!modalities.length) {return null;}
   const first = modalities[0];
   if (first.isFree) {return 'Gratis';}
   return first.price != null ? `${first.price.toFixed(2)} €` : null;
};

const highlight = (text = '', query = '') => {
   if (!query || query.length < 2) {return text;}
   const regex = new RegExp(`(${query.trim()})`, 'gi');
   const parts = text.split(regex);
   return parts.map((part, i) =>
      regex.test(part)
         ? <mark key={i} className="bg-orange-500/20 text-orange-400 rounded px-0.5">{part}</mark>
         : part
   );
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

const EstablishmentResult = ({ item, query, onClick }) => (
   <button
      onMouseDown={onClick} // mousedown en lugar de click para que no compita con onBlur del input
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/60 transition-colors text-left group"
   >
      {/* Foto o placeholder */}
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-800 flex items-center justify-center">
         {item.mainImage
            ? <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" />
            : <Store className="w-5 h-5 text-neutral-600" />
         }
      </div>

      <div className="flex-1 min-w-0">
         <p className="text-sm font-semibold text-white truncate">
            {highlight(item.name, query)}
         </p>
         <p className="text-xs text-neutral-500 truncate">
            {item.address?.neighborhood || item.address?.city}
            {item.priceRange && <span className="ml-2 text-neutral-600">{item.priceRange}</span>}
         </p>
      </div>

      {/* Badge abierto/cerrado */}
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
         item.isOpen
            ? 'bg-green-500/15 text-green-400'
            : 'bg-neutral-700/60 text-neutral-500'
      }`}>
         {item.isOpen ? 'Abierto' : 'Cerrado'}
      </span>
   </button>
);

const ItemResult = ({ item, query, onClick }) => {
   const price = getMainPrice(item.modalities);

   return (
      <button
         onMouseDown={onClick}
         className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/60 transition-colors text-left group"
      >
         {/* Foto o placeholder */}
         <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-800 flex items-center justify-center">
            {item.mainImage
               ? <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" />
               : <UtensilsCrossed className="w-5 h-5 text-neutral-600" />
            }
         </div>

         <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
               {highlight(item.name, query)}
            </p>
            <p className="text-xs text-neutral-500 truncate">
               {item.establishment?.name}
            </p>
         </div>

         {price && (
            <span className="text-xs font-semibold text-orange-400 flex-shrink-0">
               {price}
            </span>
         )}
      </button>
   );
};

const Divider = ({ label }) => (
   <div className="px-4 pt-3 pb-1">
      <p className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">{label}</p>
   </div>
);

// ── Componente principal ──────────────────────────────────────────────────────

export const SearchDropdown = ({ placeholder = 'Tu próxima tapa aquí...' }) => {
   const navigate  = useNavigate();
   const inputRef  = useRef(null);
   const wrapperRef = useRef(null);

   const { query, setQuery, results, loading, error, isOpen, clear, close, open } = useSearch({ limit: 5 });

   // Cerrar dropdown al hacer click fuera
   useEffect(() => {
      const handler = (e) => {
         if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
            close();
         }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
   }, [close]);

   const handleSelectEstablishment = (slug) => {
      clear();
      navigate(`/establishment/${slug}`);
   };

   const handleSelectItem = (slug) => {
      clear();
      navigate(`/items/${slug}`);
   };

   const hasEstablishments = results.establishments?.length > 0;
   const hasItems          = results.items?.length > 0;
   const hasResults        = hasEstablishments || hasItems;
   const showDropdown      = isOpen && query.length >= 2;

   return (
      <div ref={wrapperRef} className="relative z-50 w-full">

         {/* ── Input ── */}
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />

            <input
               ref={inputRef}
               value={query}
               onChange={e => setQuery(e.target.value)}
               onFocus={open}
               placeholder={placeholder}
               className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
            />

            {/* Spinner o botón de limpiar */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
               {loading
                  ? <Loader2 className="w-4 h-4 text-neutral-500 animate-spin" />
                  : query && (
                     <button onClick={clear} className="text-neutral-500 hover:text-neutral-300 transition-colors">
                        <X className="w-4 h-4" />
                     </button>
                  )
               }
            </div>
         </div>

         {/* ── Dropdown ── */}
         {showDropdown && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/40">

               {/* Sin resultados */}
               {!loading && !hasResults && !error && (
                  <div className="px-4 py-6 text-center">
                     <p className="text-sm text-neutral-500">Sin resultados para <span className="text-white">"{query}"</span></p>
                  </div>
               )}

               {/* Error */}
               {error && (
                  <div className="px-4 py-4 text-center">
                     <p className="text-sm text-red-400">{error}</p>
                  </div>
               )}

               {/* Establecimientos */}
               {hasEstablishments && (
                  <>
                     <Divider label="Establecimientos" />
                     {results.establishments.map(est => (
                        <EstablishmentResult
                           key={est._id}
                           item={est}
                           query={query}
                           onClick={() => handleSelectEstablishment(est.slug)}
                        />
                     ))}
                  </>
               )}

               {/* Separador visual entre secciones */}
               {hasEstablishments && hasItems && (
                  <div className="mx-4 border-t border-neutral-800/60" />
               )}

               {/* Tapas */}
               {hasItems && (
                  <>
                     <Divider label="Tapas" />
                     {results.items.map(item => (
                        <ItemResult
                           key={item._id}
                           item={item}
                           query={query}
                           onClick={() => handleSelectItem(item.slug)}
                        />
                     ))}
                  </>
               )}

               {/* Footer con total */}
               {hasResults && (
                  <div className="px-4 py-2.5 border-t border-neutral-800/60 bg-neutral-950/60">
                     <p className="text-[11px] text-neutral-600 text-center">
                        {results.total} resultado{results.total !== 1 ? 's' : ''} para "{query}"
                     </p>
                  </div>
               )}

            </div>
         )}
      </div>
   );
};
