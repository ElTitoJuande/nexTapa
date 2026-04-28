import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPinOff, Navigation } from "lucide-react";
import Badge from "../../components/common/Badge";
import { establishmentService } from "../../services/establishmentService";
import { useGeolocation } from "../../hooks/useGeolocation";
import { cloudinaryPresets } from "../../utils/cloudinaryHelpers.js";

const AUTOPLAY_MS = 5500;

const formatDistance = (distance) => {
  if (typeof distance !== "number") {
    return null;
  }

  return distance < 1000
    ? `${Math.round(distance)} m`
    : `${(distance / 1000).toFixed(1)} km`;
};

export default function NearbySection() {
  const navigate = useNavigate();
  const {
    coords,
    loading: geoLoading,
    error: geoError,
    clearCache,
  } = useGeolocation();

  const [establishments, setEstablishments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const progressBarRef = useRef(null);
  const autoplayFrameRef = useRef(null);
  const autoplayStartRef = useRef(0);

  const loadNearby = useCallback(async (location) => {
    setLoading(true);
    try {
      const response = await establishmentService.getNearby({
        lat: location.lat,
        lng: location.lng,
        limit: 10,
      });
      setEstablishments(response.data || []);
      setUsingFallback(false);
    } catch (error) {
      console.error("Error cargando establecimientos cercanos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFallback = useCallback(async () => {
    setLoading(true);
    try {
      const response = await establishmentService.getAll();
      setEstablishments((response.data || []).slice(0, 10));
      setUsingFallback(true);
    } catch (error) {
      console.error("Error cargando establecimientos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (geoLoading) {
      return;
    }

    if (coords) {
      loadNearby(coords);
    } else {
      loadFallback();
    }
  }, [coords, geoLoading, loadNearby, loadFallback]);

  useEffect(() => {
    if (currentIndex > establishments.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, establishments.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, []);

  useEffect(() => {
    const bar = progressBarRef.current;
    if (bar) {
      bar.style.transform = "scaleX(0)";
    }

    if (autoplayFrameRef.current) {
      window.cancelAnimationFrame(autoplayFrameRef.current);
    }

    autoplayStartRef.current = 0;

    if (
      establishments.length <= 1 ||
      isAutoplayPaused ||
      prefersReducedMotion
    ) {
      return;
    }

    const animate = (timestamp) => {
      if (!autoplayStartRef.current) {
        autoplayStartRef.current = timestamp;
      }

      const elapsed = timestamp - autoplayStartRef.current;
      const progress = Math.min(elapsed / AUTOPLAY_MS, 1);

      if (bar) {
        bar.style.transform = `scaleX(${progress})`;
      }

      if (elapsed >= AUTOPLAY_MS) {
        autoplayStartRef.current = timestamp;
        if (bar) {
          bar.style.transform = "scaleX(0)";
        }

        setCurrentIndex((prev) => {
          if (prev === establishments.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      }

      autoplayFrameRef.current = window.requestAnimationFrame(animate);
    };

    autoplayFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (autoplayFrameRef.current) {
        window.cancelAnimationFrame(autoplayFrameRef.current);
      }
      autoplayFrameRef.current = null;
      autoplayStartRef.current = 0;
    };
  }, [
    currentIndex,
    establishments.length,
    isAutoplayPaused,
    prefersReducedMotion,
  ]);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      if (prev === establishments.length - 1) {
        return 0;
      }
      return prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return establishments.length - 1;
      }
      return prev - 1;
    });
  };

  const mainEstablishment = establishments[currentIndex];

  const secondaryCards = useMemo(
    () =>
      establishments
        .map((establishment, index) => ({ establishment, index }))
        .slice(0, 3),
    [establishments],
  );

  if (geoLoading || (loading && establishments.length === 0)) {
    return (
      <section id="home-nearby" className="mt-8 px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cerca de ti</h2>
        </div>
        <div className="h-64 animate-pulse rounded-3xl border border-neutral-800 bg-neutral-900" />
      </section>
    );
  }

  if (!loading && establishments.length === 0) {
    return (
      <section id="home-nearby" className="mt-8 px-4">
        <h2 className="mb-4 text-lg font-semibold">Cerca de ti</h2>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
          <p className="text-sm text-neutral-400">
            No hemos encontrado establecimientos disponibles.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="home-nearby" className="mt-8 px-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {usingFallback ? "Establecimientos destacados" : "Cerca de ti"}
          </h2>
          {usingFallback && geoError && (
            <div className="mt-1 flex items-center gap-1.5">
              <MapPinOff size={11} className="text-neutral-500" />
              <span className="text-[11px] text-neutral-500">
                Ubicación no disponible
              </span>
              <button
                type="button"
                onClick={() => {
                  clearCache();
                  window.location.reload();
                }}
                className="text-[11px] text-orange-500 underline transition-colors hover:text-orange-400"
              >
                Activar
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/establishments")}
          className="text-sm font-semibold text-orange-400 transition-colors hover:text-orange-300"
        >
          Ver todos
        </button>
      </div>

      {mainEstablishment && (
        <div>
          <div
            className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-[0_16px_38px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(0,0,0,0.4)]"
            onMouseEnter={() => setIsAutoplayPaused(true)}
            onMouseLeave={() => setIsAutoplayPaused(false)}
            onTouchStart={() => setIsAutoplayPaused(true)}
            onTouchEnd={() => setIsAutoplayPaused(false)}
          >
            <button
              type="button"
              onClick={() =>
                navigate(`/establishment/${mainEstablishment.slug}`, {
                  state: { distance: mainEstablishment.distance },
                })
              }
              className={`relative block w-full text-left transition-opacity duration-200 ${mainEstablishment.isOpen ? "" : "opacity-75"}`}
            >
              {!mainEstablishment.isOpen && (
                <span className="absolute left-3 top-3 z-20 rounded-full border border-neutral-600 bg-black/70 px-3 py-1 text-xs font-bold text-white">
                  Cerrado
                </span>
              )}

              <img
                src={cloudinaryPresets.card(
                  mainEstablishment.mainImage || "/Logo.png",
                )}
                alt={mainEstablishment.name}
                className="h-60 w-full object-cover"
                onError={(event) => {
                  event.target.onerror = null;
                  event.target.src = "/Logo.png";
                }}
              />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute right-3 top-3">
                <Badge className="border-none bg-black/60 backdrop-blur-sm">
                  {Number(mainEstablishment.averageRating || 0).toFixed(1)}
                </Badge>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-bold text-white">
                  {mainEstablishment.name}
                </h3>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-sm text-neutral-200">
                    {mainEstablishment.cuisineType?.[0] || "Restaurante"}
                  </p>
                  {formatDistance(mainEstablishment.distance) && (
                    <span className="rounded-lg bg-orange-500/20 px-2 py-1 text-xs font-semibold text-orange-300">
                      {formatDistance(mainEstablishment.distance)}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {establishments.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                  aria-label="Siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {establishments.length > 1 && (
            <div className="mx-auto mt-3 h-0.5 w-24 overflow-hidden rounded-full bg-white/10">
              <div
                ref={progressBarRef}
                className="h-full origin-left rounded-full bg-orange-300/35"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          )}

          {establishments.length > 1 && (
            <div className="mt-4 flex justify-center gap-1.5">
              {establishments.map((establishment, index) => (
                <button
                  key={`${establishment._id}-${index}`}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-6 bg-orange-500"
                      : "w-1.5 bg-neutral-700"
                  }`}
                  aria-label={`Ir al establecimiento ${index + 1}`}
                />
              ))}
            </div>
          )}

          {secondaryCards.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {secondaryCards.map(({ establishment, index }) => (
                <button
                  key={establishment._id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className="group/card overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/45 hover:shadow-[0_14px_28px_rgba(0,0,0,0.34)]"
                >
                  <div className="relative">
                    {!establishment.isOpen && (
                      <span className="absolute left-2 top-2 z-10 rounded-full border border-neutral-600 bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                        Cerrado
                      </span>
                    )}

                    <img
                      src={cloudinaryPresets.tapaCard(
                        establishment.mainImage || "/Logo.png",
                      )}
                      alt={establishment.name}
                      className="h-24 w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                      onError={(event) => {
                        event.target.onerror = null;
                        event.target.src = "/Logo.png";
                      }}
                    />
                  </div>

                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-white">
                      {establishment.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-neutral-400">
                      {establishment.cuisineType?.[0] || "Restaurante"}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="inline-flex items-center gap-1 text-orange-300">
                        <Navigation size={11} />
                        {formatDistance(establishment.distance) ||
                          "Sin distancia"}
                      </span>
                      <span>
                        {Number(establishment.averageRating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
