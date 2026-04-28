

import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatDistance = (distance) => {
   if (distance == null) {return null;}
   if (typeof distance === "string") {return distance;}
   return distance < 1000
      ? `${Math.round(distance)}m`
      : `${(distance / 1000).toFixed(1)}km`;
};

export const LittleEstablishCard = ({ name, address, distance, slug }) => {
   const navigate = useNavigate();
   const formattedDistance = formatDistance(distance);

   return (
      <div
       
         className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl mt-4 hover:border-orange-500/30 transition-colors duration-200 cursor-pointer"
      >
         <div className="flex-shrink-0 w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center">
            <span className="text-orange-400 text-lg">🍽️</span>
         </div>

         <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{name}</h3>
            <p className="text-xs text-neutral-400 truncate">
               {address}
               {formattedDistance && <span className="text-orange-400 font-medium"> • {formattedDistance}</span>}
            </p>
         </div>

         <ChevronRight 
            onClick={() => slug && navigate(`/establishment/${slug}`, { state: { distance } })}
            className="w-4 h-4 text-neutral-300 flex-shrink-0" />
      </div>
   );
};