import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CITIES = [
   {
      name: "Barcelona",
      img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=900&q=80",
      subtitle: "Plan urbano"
   },
   {
      name: "Valencia",
      img: "/topcities/valencia.jpg",
      subtitle: "Sabor mediterráneo"
   },
   {
      name: "Málaga",
      img: "/topcities/malaga.webp",
      subtitle: "Sol y barra"
   },
   {
      name: "Granada",
      img: "/topcities/granada.jpg",
      subtitle: "Tapas con encanto"
   },
   {
      name: "Sevilla",
      img: "/topcities/sevilla.jpg",
      subtitle: "Centro histórico"
   },
   {
      name: "Madrid",
      img: "/topcities/madrid.jpg",
      subtitle: "Mucho tapeo"
   }
];

const CityCard = ({ city, onClick, className = "", titleClassName = "text-base" }) => (
   <button
      type="button"
      onClick={onClick}
      className={`group/card relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/65 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-[0_14px_28px_rgba(0,0,0,0.34)] ${className}`}
   >
      <img
         src={city.img}
         alt={city.name}
         className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
         <p className={`font-bold text-white ${titleClassName}`}>{city.name}</p>
         <p className="text-xs text-neutral-300">{city.subtitle}</p>
      </div>
   </button>
);

export default function TopCities({ onCitySelect, className = "" }) {
   const scrollRef = useRef(null);
   const [canLeft, setCanLeft] = useState(false);
   const [canRight, setCanRight] = useState(true);

   const checkScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) {
         return;
      }

      setCanLeft(el.scrollLeft > 8);
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
   }, []);

   useEffect(() => {
      const el = scrollRef.current;
      if (!el) {
         return;
      }

      checkScroll();
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);

      return () => {
         el.removeEventListener("scroll", checkScroll);
         window.removeEventListener("resize", checkScroll);
      };
   }, [checkScroll]);

   const scroll = (direction) => {
      scrollRef.current?.scrollBy({ left: direction * 250, behavior: "smooth" });
   };

   return (
      <section id="home-cities" className={`mt-8 px-4 ${className}`}>
         <div className="mb-3 flex items-center justify-between">
            <div>
               <h2 className="text-lg font-semibold text-white">Explora ciudades</h2>
               <p className="text-xs text-neutral-500">Inspira tu próxima salida</p>
            </div>
         </div>

         <div className="hidden auto-rows-[104px] grid-cols-3 gap-3 lg:grid">
            {CITIES.map((city, index) => (
               <CityCard
                  key={city.name}
                  city={city}
                  onClick={() => onCitySelect?.(city.name)}
                  className={index === 0 ? "col-span-2 row-span-2" : ""}
                  titleClassName={index === 0 ? "text-2xl" : "text-lg"}
               />
            ))}
         </div>

         <div className="group relative lg:hidden">
            {canLeft && (
               <button
                  type="button"
                  onClick={() => scroll(-1)}
                  className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 opacity-0 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white group-hover:opacity-100"
                  aria-label="Anterior"
               >
                  <ChevronLeft size={16} />
               </button>
            )}

            {canRight && (
               <button
                  type="button"
                  onClick={() => scroll(1)}
                  className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 opacity-0 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white group-hover:opacity-100"
                  aria-label="Siguiente"
               >
                  <ChevronRight size={16} />
               </button>
            )}

            <div
               ref={scrollRef}
               className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
               {CITIES.map((city) => (
                  <CityCard
                     key={city.name}
                     city={city}
                     onClick={() => onCitySelect?.(city.name)}
                     className="h-28 w-48 shrink-0 snap-start"
                  />
               ))}
            </div>
         </div>
      </section>
   );
}

