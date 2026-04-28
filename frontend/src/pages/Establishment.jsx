// src/pages/Establishment.jsx
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  X,
  ChevronLeft,
  ChevronRight,
  SquareArrowLeft,
  Clock,
  MapPinHouse,
  Banknote,
  CalendarDays,
} from "lucide-react";

import Container from "../components/layout/Container";
import Section from "../components/layout/Section";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { ReviewWidget } from "../components/common/ReviewWidget";
import { SocialLinks } from "../components/common/SocialLinks.jsx";
import { ReservationModal } from "../components/common/ReservationModal";

import { establishmentService } from "../services/establishmentService.js";
import { ItemGallery } from "../components/common/ItemGallery";
import { photoService } from "../services/photoService.js";
import { ScheduleDisplay } from "../components/common/ScheduleDisplay";
import { ServiceKitchen } from "../components/common/ServiceKitchen";
import { Contact } from "../components/common/Contact";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { cloudinaryPresets } from "../utils/cloudinaryHelpers.js";
import { useAuth } from "../context/AuthContext";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={onClose}>
      {/* Botón cerrar */}
      <div className="flex justify-end p-3 shrink-0">
        <button onClick={onClose}
          className="text-white bg-white/20 hover:bg-white/30 rounded-full p-2.5 transition-colors">
          <X size={22} />
        </button>
      </div>

      {/* Imagen centrada */}
      <div className="flex-1 flex items-center justify-center relative" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[current]}
          alt={`Foto ${current + 1}`}
          className="max-w-full max-h-full object-contain sm:max-h-[80vh]"
        />
        {/* Flechas superpuestas */}
        <button onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2.5 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <button onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2.5 transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center pb-6 pt-3 shrink-0">
        <div className="flex gap-2">
          {images.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-orange-400" : "bg-white/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export const Establishment = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const preloadedDistance = location.state?.distance ?? null;

  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reservationOpen, setReservationOpen] = useState(false);

  const mapInstance = useRef(null);
  const { coords, loading: geoLoading } = useGeolocation();

  const loadEstablishmentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = !preloadedDistance && coords?.lat
        ? { lat: coords.lat, lng: coords.lng }
        : {};
      const response = await establishmentService.getBySlug(slug, params);
      setEstablishment(response.data);
      const photosResponse = await photoService.getByEstablishment(response.data._id);
      setPhotos(photosResponse || []);
    } catch (err) {
      console.error("Error cargando establecimiento:", err);
      setError("No se pudo cargar el establecimiento");
    } finally {
      setLoading(false);
    }
  }, [slug, coords, preloadedDistance]);

  useEffect(() => {
    loadEstablishmentData();
  }, [loadEstablishmentData]);

  const mapContainer = useCallback((node) => {
    if (!node || mapInstance.current || !establishment?.location?.coordinates) return;
    const [lng, lat] = establishment.location.coordinates;
    const map = new mapboxgl.Map({
      container: node,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 15,
    });
    new mapboxgl.Marker({ color: "#f97316" }).setLngLat([lng, lat]).addTo(map);
    mapInstance.current = map;
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [establishment]);

  const rawPrimaryUrl = photos.find((p) => p.isPrimary)?.url || establishment?.mainImage;
  const heroUrl = rawPrimaryUrl ? cloudinaryPresets.detail(rawPrimaryUrl) : "/Logo.png";
  const lightboxUrls = photos.map((p) => cloudinaryPresets.detail(p.url)).filter(Boolean);
  const allLightboxImages = lightboxUrls.length > 0
    ? lightboxUrls
    : rawPrimaryUrl ? [cloudinaryPresets.detail(rawPrimaryUrl)] : [];

  const openLightbox = (index = 0) => { setLightboxIndex(index); setLightboxOpen(true); };

  const displayDistance = () => {
    const dist = Number(preloadedDistance ?? establishment?.distance);
    if (isNaN(dist) || dist <= 0) return geoLoading ? "Calculando distancia..." : "Distancia no disponible";
    return dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`;
  };

  const isLoggedInClient = user && user.role === "cliente";

  if (loading && !establishment) {
    return (
      <Container>
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-white">Cargando establecimiento...</p>
        </div>
      </Container>
    );
  }

  if (error || !establishment) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center h-screen text-white">
          <p className="text-lg text-red-500 mb-4">{error || "Establecimiento no encontrado"}</p>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </div>
      </Container>
    );
  }

  const hasContact = establishment.phone || establishment.email || establishment.website;
  const hasSocial = Object.values(establishment.socialLinks || {}).some((v) => v?.trim());

  return (
    <div className="bg-transparent min-h-screen text-white">
      {lightboxOpen && allLightboxImages.length > 0 && (
        <Lightbox images={allLightboxImages} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />
      )}

      {reservationOpen && isLoggedInClient && (
        <ReservationModal establishment={establishment} onClose={() => setReservationOpen(false)} onSuccess={() => {}} />
      )}

      {/* ── Hero ── */}
      <div className="relative h-72 max-w-3xl mx-auto">
        <img src={heroUrl} className="w-full h-full object-cover rounded-xl cursor-pointer"
          alt={establishment.name} onClick={() => openLightbox(0)} />
        <div className="absolute inset-0 bg-black/40 rounded-xl pointer-events-none" />

        {/* Barra superior — sin corazón */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)}
            className="bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80">
            <SquareArrowLeft />
          </button>
          <span className="text-white font-semibold">nexTapa</span>
          <div className="w-10" /> {/* spacer para centrar el título */}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          {establishment.verified && <Badge className="mb-2 inline-block">VERIFICADO</Badge>}
          <h1 className="text-3xl font-bold text-white">{establishment.name}</h1>
          <span className="text-l text-white font-bold">{displayDistance()}</span>
          <p className="text-sm text-white flex items-center gap-1 font-bold">
            <span className="text-yellow-400">★</span>
            {Number(establishment.averageRating || 0).toFixed(1)} · {establishment.totalReviews || 0} reviews
          </p>
        </div>
      </div>

      <Container>
        {/* ── Galería thumbnails cuadrada ── */}
        {photos.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((photo, i) => (
              <img key={photo._id}
                src={cloudinaryPresets.thumbnail(photo.url)}
                className="h-20 w-20 object-cover rounded-lg shrink-0 cursor-pointer hover:opacity-80"
                onClick={() => openLightbox(i)}
                alt="Foto del establecimiento" />
            ))}
          </div>
        )}

        {/* ── Descripción ── */}
        <div className="mt-4 bg-neutral-900 rounded-2xl p-5 border border-neutral-800 hover:border-orange-500/30 transition-colors duration-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Descripción</h2>
              <div className="w-12 h-1 bg-orange-500 rounded-full mt-2" />
            </div>
            {establishment.priceRange && (
              <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700/60 rounded-xl px-3 py-2 shrink-0 ml-4">
                <Banknote size={16} className="text-green-400 shrink-0" strokeWidth={1.8} />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Precio medio</span>
                  <span className="text-sm font-bold text-white">{establishment.priceRange}</span>
                </div>
              </div>
            )}
          </div>
          {establishment.description && (
            <p className="text-sm text-white leading-relaxed">{establishment.description}</p>
          )}
        </div>

        {/* ── Tapas ── */}
        <Section>
          <ItemGallery
            establishmentId={establishment._id}
            currentItemId={establishment.tapas?.[0]?._id}
            establishmentName={establishment.name}
            distance={preloadedDistance ?? establishment.distance}
          />
        </Section>

        {/* ── Servicios & Cocina ── */}
        {(establishment.features?.length > 0 || establishment.cuisineType?.length > 0) && (
          <ServiceKitchen features={establishment.features || []} cuisineType={establishment.cuisineType || []} />
        )}

        {/* ── Contacto + Redes ── */}
        {(hasContact || hasSocial) && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {hasContact && (
              <div className="flex-1 bg-neutral-900 rounded-2xl p-5 border border-neutral-800 hover:border-orange-500/30 transition-colors duration-200">
                <div className="mb-4">
                  <h3 className="text-white font-semibold text-lg">Contacto</h3>
                  <div className="w-12 h-1 bg-orange-500 rounded-full mt-2" />
                </div>
                <Contact phone={establishment.phone} email={establishment.email} website={establishment.website} />
              </div>
            )}
            {hasSocial && (
              <div className="flex-1">
                <SocialLinks socialLinks={establishment.socialLinks || {}} />
              </div>
            )}
          </div>
        )}

        {/* ── Mapa + Dirección + Horario ── */}
        <div className="mt-4 rounded-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-neutral-700/60 h-64 lg:h-auto lg:min-h-80">
              <div ref={mapContainer} className="w-full h-full" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/40">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                  <MapPinHouse className="text-orange-500 shrink-0" size={20} /> Dirección
                </h3>
                <p className="text-sm text-neutral-200">
                  {establishment.address?.street}, {establishment.address?.number}<br />
                  {establishment.address?.postalCode} {establishment.address?.city}, {establishment.address?.province}
                </p>
                <button
                  onClick={() => {
                    const [lng, lat] = establishment.location.coordinates;
                    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all text-sm font-medium"
                >
                  Cómo llegar
                </button>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/40">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                  <Clock className="text-orange-500 shrink-0" size={20} /> Horario
                </h3>
                <ScheduleDisplay schedule={establishment.schedule} isOpen={establishment.isOpen} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Valoración ── */}
        <Section title="Valoración">
          <ReviewWidget targetType="establishment" targetId={establishment._id} />
        </Section>

        {/* ── CTA final ── */}
        <div className="mt-6 mb-6">
          {isLoggedInClient ? (
            <button onClick={() => setReservationOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-[0.98]">
              <CalendarDays size={18} /> Reservar mesa
            </button>
          ) : (
            <button onClick={() => navigate("/register")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-[0.98]">
              Regístrate aquí
            </button>
          )}
        </div>
      </Container>
    </div>
  );
};