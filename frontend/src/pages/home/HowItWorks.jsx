import { Search, Store, Utensils } from "lucide-react";

const STEPS = [
   {
      id: 1,
      title: "Busca rápido",
      description: "Encuentra locales o tapas en segundos.",
      icon: Search
   },
   {
      id: 2,
      title: "Elige tu plan",
      description: "Compara distancia, precio y valoraciones.",
      icon: Store
   },
   {
      id: 3,
      title: "Disfruta",
      description: "Ve al local y prueba tu próxima tapa.",
      icon: Utensils
   }
];

export default function HowItWorks({ className = "" }) {
   return (
      <section className={`mt-8 px-4 ${className}`} aria-labelledby="home-how-it-works">
         <h2 id="home-how-it-works" className="text-lg font-semibold text-white">
            Cómo funciona
         </h2>

         <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STEPS.map((step) => {
               const Icon = step.icon;
               return (
                  <article
                     key={step.id}
                     className="rounded-2xl border border-neutral-800 bg-neutral-900/65 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-200 hover:border-orange-500/35 hover:bg-neutral-900/85"
                  >
                     <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300/90">
                        <Icon size={13} />
                        Paso {step.id}
                     </div>
                     <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                     <p className="mt-1 text-xs text-neutral-400">{step.description}</p>
                  </article>
               );
            })}
         </div>
      </section>
   );
}
