export default function TopCities() {
   return (
      <section className="px-4 mt-6">
         <h2 className="text-lg font-semibold mb-3">Top Ciudades</h2>
         <div className="flex gap-3">
            {["Madrid", "Barcelona", "Sevilla"].map(city => (
               <button
                  key={city}
                  className="px-4 py-2 bg-neutral-800 rounded-full">
                  {city}
               </button>
            ))}
         </div>
      </section>
   );
}
