import { ArrowRight, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HostCTA({ className = "" }) {
   const navigate = useNavigate();

   return (
      <section className={`mt-8 px-4 pb-6 ${className}`} aria-labelledby="home-host-cta">
         <div className="relative overflow-hidden rounded-3xl border border-orange-500/25 bg-linear-to-br from-[#25140b] via-[#1b120d] to-[#0f0f0f] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-orange-500/45">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 left-8 h-24 w-24 rounded-full bg-orange-400/10 blur-2xl" />

            <div className="relative">
               <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-orange-300">
                  <Store size={12} />
                  Para hosteleros
               </p>

               <h2 id="home-host-cta" className="text-xl font-black text-white">
                  ¿Tienes un establecimiento?
               </h2>
               <p className="mt-2 max-w-xl text-sm text-neutral-300">
                  Publica tu local en nexTapa y conecta con clientes que están buscando dónde tapear hoy.
               </p>

               <button
                  type="button"
                  onClick={() => navigate("/host/register")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 hover:shadow-[0_12px_26px_rgba(249,115,22,0.28)]"
               >
                  Crear mi establecimiento
                  <ArrowRight size={16} />
               </button>
            </div>
         </div>
      </section>
   );
}
