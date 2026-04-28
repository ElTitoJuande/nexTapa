import { Flame, Gift, MapPin, Star } from "lucide-react";

const FILTERS = [
   {
      id: "nearby",
      label: "Cerca de mí",
      icon: MapPin,
      action: "scroll-nearby"
   },
   {
      id: "open-now",
      label: "Abierto ahora",
      icon: Flame,
      action: "go-establishments"
   },
   {
      id: "free",
      label: "Tapas gratis",
      icon: Gift,
      action: "go-items"
   },
   {
      id: "top",
      label: "Top valoradas",
      icon: Star,
      action: "scroll-featured"
   }
];

const scrollToId = (id) => {
   const target = document.getElementById(id);
   if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
   }
};

export default function QuickFilters({ onNavigate }) {
   const handleClick = (filterAction) => {
      if (filterAction === "scroll-nearby") {
         scrollToId("home-nearby");
         return;
      }

      if (filterAction === "scroll-featured") {
         scrollToId("home-featured");
         return;
      }

      if (filterAction === "go-establishments") {
         onNavigate?.("/establishments?openNow=true");
         return;
      }

      if (filterAction === "go-items") {
         onNavigate?.("/items");
      }
   };

   return (
      <div className="mt-4 flex gap-2.5 overflow-x-auto pt-1 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
         {FILTERS.map((filter) => {
            const Icon = filter.icon;
            return (
               <button
                  key={filter.id}
                  type="button"
                  onClick={() => handleClick(filter.action)}
                  className="shrink-0 rounded-full border border-neutral-700 bg-neutral-900/70 px-3.5 py-2 text-xs font-semibold text-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/60 hover:bg-orange-500/10 hover:text-orange-300"
               >
                  <span className="flex items-center gap-1.5">
                     <Icon size={13} />
                     {filter.label}
                  </span>
               </button>
            );
         })}
      </div>
   );
}
