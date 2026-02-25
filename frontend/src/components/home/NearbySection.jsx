
// NearbySection.jsx - Sección de establecimientos cercanos en la página de inicio

import Card from "../common/Card";
import Badge from "../common/Badge";

export default function NearbySection() {
   return (
      <section className="px-4">
         <div className="flex justify-between mb-3">
            <h2 className="text-lg font-semibold">Establecimientos cercanos</h2>
            <span className="text-orange-400">Ver todos</span>
         </div>

         <Card>
            <img
               src="https://images.unsplash.com/photo-1559339352-11d035aa65de"
               className="h-48 w-full object-cover"
            />
            <div className="p-3 space-y-1">
               <div className="flex justify-between">
                  <h3 className="font-semibold">El Olivo de Madrid</h3>
                  <Badge>4.8</Badge>
               </div>
               <p className="text-sm text-neutral-400">
            0.5 KM de Ti • Bar
               </p>
            </div>
         </Card>
      </section>
   );
}
