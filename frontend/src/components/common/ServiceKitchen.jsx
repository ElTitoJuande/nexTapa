// src/components/common/ServiceKitchen.jsx
import { Utensils, Sparkles } from "lucide-react";

export const ServiceKitchen = ({ features = [], cuisineType = [] }) => {
  if (features.length === 0 && cuisineType.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Servicios & Cocina</h2>
        <div className="w-12 h-1 bg-orange-500 rounded-full mt-2" />
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        {features.length > 0 && (
          <div className="flex-1 bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
            <div className="inline-flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">
                Servicios
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((f, i) => (
                <span
                  key={i}
                  className="text-sm text-neutral-200 bg-neutral-800 border border-neutral-700/60 px-3 py-1.5 rounded-xl"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {cuisineType.length > 0 && (
          <div className="flex-1 bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
            <div className="inline-flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 mb-4">
              <Utensils className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">
                Tipo de Cocina
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cuisineType.map((c, i) => (
                <span
                  key={i}
                  className="text-sm text-neutral-200 bg-neutral-800 border border-neutral-700/60 px-3 py-1.5 rounded-xl"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
