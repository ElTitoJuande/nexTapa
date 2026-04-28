// src/pages/Tapas.jsx
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Container from "../components/layout/Container";
import Section from "../components/layout/Section";
import Button from "../components/common/Button";
import { LittleEstablishCard } from "../components/common/LittleEstablishCard";

import { itemService } from "../services/itemService";
import { photoService } from "../services/photoService";
import { ItemGallery } from "../components/common/ItemGallery";
import { ReviewWidget } from "../components/common/ReviewWidget";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { cloudinaryPresets } from "../utils/cloudinaryHelpers.js";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  SquareArrowLeft,
  Tags,
  AlertTriangle,
  Leaf,
} from "lucide-react";

// ============================================
// LIGHTBOX
// ============================================
const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrent((i) => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={onClose}>
      <div className="flex justify-end p-3 shrink-0">
        <button onClick={onClose}
          className="text-white bg-white/20 hover:bg-white/30 rounded-full p-2.5 transition-colors">
          <X size={22} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center relative" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[current]}
          alt={`Foto ${current + 1}`}
          className="max-w-full max-h-full object-contain sm:max-h-[80vh]"
        />
        <button onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2.5 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <button onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2.5 transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>
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
};

// ============================================
// TAPAS
// ============================================
export const Tapas = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();

  const distanceFromState = location.state?.distance ?? null;

  const [tapa, setTapa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { coords, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    if (slug && !geoLoading) loadTapa();
  }, [slug, geoLoading]);

  const loadTapa = async () => {
    try {
      setLoading(true);
      const params = !distanceFromState && coords ? { lat: coords.lat, lng: coords.lng } : {};
      const response = await itemService.getBySlug(slug, params);
      if (!response || !response.data) { setError("Tapa no encontrada"); return; }
      const data = response.data;
      setTapa(data);
      const fotosData = await photoService.getByItem(data._id);
      const sorted = [...(fotosData || [])].sort((a, b) => a.order - b.order);
      setPhotos(sorted);
    } catch (err) {
      console.error("Error al cargar la tapa:", err);
      setError("No se pudo cargar la tapa.");
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index = 0) => { setLightboxIndex(index); setLightboxOpen(true); };

  const rawPrimaryUrl = photos.find((p) => p.isPrimary)?.url || tapa?.mainImage || null;
  const heroUrl = rawPrimaryUrl ? cloudinaryPresets.detail(rawPrimaryUrl) : "/Logo.png";
  const lightboxUrls = photos.length > 0
    ? photos.map((p) => cloudinaryPresets.detail(p.url))
    : rawPrimaryUrl ? [cloudinaryPresets.detail(rawPrimaryUrl)] : [];

  const distance = distanceFromState ?? tapa?.establishment?.distance ?? null;
  const isAvailableToday = tapa?.available && (tapa?.servedToday ?? true);

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg">Cargando tapa...</p>
        </div>
      </Container>
    );
  }

  if (error || !tapa) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-lg text-red-500 mb-4">{error || "Tapa no encontrada"}</p>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </div>
      </Container>
    );
  }

  return (
    <div>
      {/* ── Lightbox ── */}
      {lightboxOpen && lightboxUrls.length > 0 && (
        <Lightbox images={lightboxUrls} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />
      )}

      {/* ── Hero ── */}
      <div className="relative max-w-3xl mx-auto mt-4 h-96">
        {rawPrimaryUrl ? (
          <>
            <img src={heroUrl} alt={tapa.name}
              className="w-full h-full object-cover rounded-xl shadow-md cursor-pointer"
              onClick={() => openLightbox(0)}
              onError={(e) => { e.target.onerror = null; e.target.src = "/Logo.png"; }} />
            <div className="absolute inset-0 bg-black/20 rounded-xl pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full rounded-xl bg-neutral-800 overflow-hidden">
            <img src="/Logo.png" alt="nexTapa" className="w-full h-full object-cover opacity-60" />
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)}
            className="bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center">
            <SquareArrowLeft />
          </button>
          <span className="text-white font-semibold">nexTapa</span>
          <div className="w-10" />
        </div>

        {lightboxUrls.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            1 / {lightboxUrls.length}
          </div>
        )}
      </div>

      {/* ── Galería thumbnails ── */}
      {photos.length > 1 && (
        <div className="max-w-3xl mx-auto mt-3 px-2">
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((photo, i) => (
              <button key={photo._id || i} onClick={() => openLightbox(i)}
                className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  i === 0 ? "border-orange-500 opacity-100" : "border-transparent opacity-60 hover:opacity-90"
                }`}>
                <img src={cloudinaryPresets.thumbnail(photo.url)} alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/Logo.png"; }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Modalidades + disponibilidad ── */}
      <div className="max-w-3xl mx-auto px-4 mt-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-colors duration-200">

          {/* Fila superior: modalidades */}
          {tapa.modalities?.length > 0 && (
            <div className="px-5 pt-5 pb-4 border-b border-neutral-800">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3 font-medium">Modalidades</p>
              <div className="flex flex-wrap gap-2">
                {tapa.modalities.map((mod, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 border transition-opacity ${
                      !mod.available
                        ? "opacity-35 bg-neutral-800/40 border-neutral-700/30"
                        : mod.isFree
                        ? "bg-green-950/50 border-green-800/40"
                        : "bg-neutral-800/60 border-neutral-700/50"
                    }`}
                  >
                    <span className="text-sm text-neutral-200 font-medium">{mod.label}</span>
                    <span className="w-px h-3.5 bg-neutral-600" />
                    {mod.isFree ? (
                      <span className="text-xs font-semibold text-green-400/70 uppercase tracking-wide">Gratis</span>
                    ) : (
                      <span className="text-sm font-bold text-orange-300">{mod.price}€</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fila inferior: estado */}
          <div className="px-5 py-4 flex flex-wrap items-center gap-4">
            {/* Tapa disponible */}
            <div className="flex items-center gap-2">
              {isAvailableToday ? (
                <>
                  <CheckCircle className="text-green-500/70 w-4 h-4 shrink-0" />
                  <span className="text-sm text-green-400/70 font-medium">Tapa disponible</span>
                </>
              ) : tapa.availableOnlyOn?.length > 0 ? (
                <>
                  <XCircle className="text-red-400/60 w-4 h-4 shrink-0" />
                  <span className="text-sm text-red-400/60 font-medium">
                    Solo {tapa.availableOnlyOn.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-400/60 w-4 h-4 shrink-0" />
                  <span className="text-sm text-red-400/60 font-medium">No disponible</span>
                </>
              )}
            </div>

            {/* Separador vertical */}
            <span className="w-px h-4 bg-neutral-700 hidden sm:block" />

            {/* Local abierto */}
            <div className="flex items-center gap-2">
              {tapa.establishment?.isOpen ? (
                <>
                  <CheckCircle className="text-green-500/70 w-4 h-4 shrink-0" />
                  <span className="text-sm text-green-400/70 font-medium">Local abierto</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-400/60 w-4 h-4 shrink-0" />
                  <span className="text-sm text-red-400/60 font-medium">Local cerrado</span>
                </>
              )}
            </div>

            {/* Aviso combinado */}
            {isAvailableToday && !tapa.establishment?.isOpen && (
              <>
                <span className="w-px h-4 bg-neutral-700 hidden sm:block" />
                <p className="text-xs text-yellow-600/60 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Disponible pero el local está cerrado
                </p>
              </>
            )}
          </div>

        </div>
      </div>

      <Container>
        {/* ── Descripción ── */}
        {tapa.description && (
          <div className="mt-6 bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-orange-500/30 transition-colors duration-200">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-white">{tapa.name}</h2>
              <div className="w-16 h-1 bg-orange-500 rounded-full mt-3 mx-auto" />
            </div>
            <p className="text-sm text-white leading-relaxed text-center">{tapa.description}</p>
          </div>
        )}

        <LittleEstablishCard
          name={tapa.establishment.name}
          address={`${tapa.establishment.address.street}, ${tapa.establishment.address.number} - ${tapa.establishment.address.city} - ${tapa.establishment.address.province}`}
          distance={distance}
          slug={tapa.establishment.slug}
        />

        {/* ── Información adicional ── */}
        {(tapa.categories?.length > 0 || tapa.allergens?.length > 0 || tapa.dietaryOptions?.length > 0) && (
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">Información adicional</h2>
              <div className="w-12 h-1 bg-orange-500 rounded-full mt-2" />
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              {tapa.categories?.length > 0 && (
                <div className="flex-1 bg-neutral-900 rounded-2xl p-5 border border-neutral-800 hover:border-orange-500/30 transition-colors duration-200">
                  <div className="inline-flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 mb-4">
                    <Tags className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Categorías</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tapa.categories.map((cat, i) => (
                      <span key={i} className="text-sm text-neutral-200 bg-neutral-800 border border-neutral-700/60 px-3 py-1.5 rounded-xl">{cat}</span>
                    ))}
                  </div>
                </div>
              )}
              {tapa.allergens?.length > 0 && (
                <div className="flex-1 bg-neutral-900 rounded-2xl p-5 border border-neutral-800 hover:border-orange-500/30 transition-colors duration-200">
                  <div className="inline-flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 mb-4">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Alérgenos</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tapa.allergens.map((allergen, i) => (
                      <span key={i} className="text-sm text-neutral-200 bg-neutral-800 border border-neutral-700/60 px-3 py-1.5 rounded-xl">{allergen}</span>
                    ))}
                  </div>
                </div>
              )}
              {tapa.dietaryOptions?.length > 0 && (
                <div className="flex-1 bg-neutral-900 rounded-2xl p-5 border border-neutral-800 hover:border-orange-500/30 transition-colors duration-200">
                  <div className="inline-flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 mb-4">
                    <Leaf className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Dieta</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tapa.dietaryOptions.map((diet, i) => (
                      <span key={i} className="text-sm text-neutral-200 bg-neutral-800 border border-neutral-700/60 px-3 py-1.5 rounded-xl">{diet}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Valoración ── */}
        <Section title="Valoración">
          <ReviewWidget targetType="item" targetId={tapa._id} />
        </Section>

        <ItemGallery
          establishmentId={tapa.establishment._id}
          currentItemId={tapa._id}
          establishmentName={tapa.establishment.name}
          distance={distance}
        />

        <div className="mt-8 mb-6">
          <Button
            onClick={() => navigate(`/establishment/${tapa.establishment.slug}`)}
            className="w-full bg-orange-500 py-4 rounded-xl text-white font-semibold hover:bg-orange-600"
          >
            Volver al establecimiento {tapa.establishment.name}
          </Button>
        </div>
      </Container>
    </div>
  );
};