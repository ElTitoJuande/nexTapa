import { Banknote } from "lucide-react";

export const PriceMedium = ({ priceRange }) => {
   return (
      <div className="p-4 text-center">

         {/* Icono */}
         <div className="flex justify-center mb-2">
            <Banknote className="w-5 h-5 text-green-500" />
         </div>

         {/* Título */}
         <h3 className="text-white text-base font-semibold">
        Precio medio
         </h3>

         {/* Valor */}
         <p className="text-xl font-bold text-white mt-1">
            {priceRange || "—"}
         </p>

      </div>
   );
};