import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  CalendarClock,
  Facebook,
  GripVertical,
  ImagePlus,
  Instagram,
  MapPin,
  Pencil,
  Star,
  Trash2,
  Twitter,
  X,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { establishmentService } from "../../services/establishmentService";
import { itemService } from "../../services/itemService";
import { photoService } from "../../services/photoService";
import { toastService } from "../../services/toastService";
import { cloudinaryPresets } from "../../utils/cloudinaryHelpers";
import {
  assignSequentialOrder,
  buildOrderPayload,
  moveByDndIds,
  sortByOrder,
} from "../admin/utils/sortableOrder";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;
const mapboxEventsDescriptor = mapboxgl.config
  ? Object.getOwnPropertyDescriptor(mapboxgl.config, "EVENTS_URL")
  : null;
if (mapboxEventsDescriptor?.configurable) {
  Object.defineProperty(mapboxgl.config, "EVENTS_URL", {
    value: null,
    configurable: true,
  });
}

const ESTABLISHMENT_TYPES = [
  "bar",
  "restaurante",
  "cafeteria",
  "cerveceria",
  "tasca",
  "gastrobar",
  "otro",
];

const DEFAULT_COORDINATES = [-3.7038, 40.4168];

const DAY_KEYS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const DAY_LABELS = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miercoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sabado",
  domingo: "Domingo",
};

const SOCIAL_FIELDS = [
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/tu_local",
    Icon: Instagram,
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/tu_local",
    Icon: Facebook,
  },
  {
    key: "twitter",
    label: "Twitter / X",
    placeholder: "https://x.com/tu_local",
    Icon: Twitter,
  },
  {
    key: "googleBusiness",
    label: "Google My Business",
    placeholder: "https://maps.google.com/?cid=...",
    Icon: MapPin,
  },
];

const cardClass =
  "rounded-2xl border border-[#262626] bg-gradient-to-b from-[#111111]/95 to-[#080808]/95 p-3 sm:p-5";
const labelClass = "mb-1 block text-sm font-medium text-slate-400";
const inputClass =
  "w-full rounded-xl border border-[#2a2a2a] bg-[#080808] px-3 py-2.5 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-[#f77827]/60 focus:ring-2 focus:ring-[#f77827]/20";

const makeDay = (closed = false, open = "09:00", close = "00:00") => ({
  open,
  close,
  split: false,
  afternoon: { open: "", close: "" },
  closed,
});

const mapDay = (dayData, fallbackClosed = false) => ({
  open: dayData?.open || "",
  close: dayData?.close || "",
  split: dayData?.split ?? false,
  afternoon: {
    open: dayData?.afternoon?.open || "",
    close: dayData?.afternoon?.close || "",
  },
  closed: dayData?.closed ?? fallbackClosed,
});

const buildForm = (establishment) => ({
  name: establishment?.name || "",
  slug: establishment?.slug || "",
  description: establishment?.description || "",
  mainImage: establishment?.mainImage || "",
  type: establishment?.type || "bar",
  cuisineType: establishment?.cuisineType || [],
  address: {
    street: establishment?.address?.street || "",
    number: establishment?.address?.number || "",
    city: establishment?.address?.city || "",
    province: establishment?.address?.province || "",
    postalCode: establishment?.address?.postalCode || "",
    country: establishment?.address?.country || "Espana",
  },
  location: {
    type: "Point",
    coordinates:
      establishment?.location?.coordinates?.length === 2
        ? establishment.location.coordinates
        : DEFAULT_COORDINATES,
  },
  phone: establishment?.phone || "",
  email: establishment?.email || "",
  website: establishment?.website || "",
  socialLinks: {
    instagram: establishment?.socialLinks?.instagram || "",
    facebook: establishment?.socialLinks?.facebook || "",
    twitter: establishment?.socialLinks?.twitter || "",
    googleBusiness: establishment?.socialLinks?.googleBusiness || "",
  },
  schedule: {
    lunes: mapDay(establishment?.schedule?.lunes, true),
    martes: mapDay(establishment?.schedule?.martes),
    miercoles: mapDay(establishment?.schedule?.miercoles),
    jueves: mapDay(establishment?.schedule?.jueves),
    viernes: mapDay(establishment?.schedule?.viernes),
    sabado: mapDay(establishment?.schedule?.sabado),
    domingo: mapDay(establishment?.schedule?.domingo),
  },
  features: establishment?.features || [],
  priceRange: establishment?.priceRange || "EUR",
  active: establishment?.active ?? true,
  verified: establishment?.verified ?? false,
});

const geocodeAddress = async (address) => {
  if (!MAPBOX_TOKEN) {
    return null;
  }

  const query = [
    address.street,
    address.number,
    address.postalCode,
    address.city,
    address.province,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

  if (!query.trim()) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?types=address&language=es&access_token=${MAPBOX_TOKEN}`,
    );
    const data = await response.json();
    return data.features?.[0]?.geometry?.coordinates || null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};

function HostCard({ title, children, action }) {
  return (
    <section className={cardClass}>
      <div className="mb-3 flex flex-col gap-2 border-b border-[#262626] pb-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h2 className="m-0 max-w-full break-words text-base font-semibold leading-tight whitespace-normal text-slate-100 sm:text-lg">
          {title}
        </h2>
        {action ? <div className="w-full self-start sm:w-auto sm:self-auto">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function HostTagSection({
  title,
  items,
  onAdd,
  onRemove,
  placeholder,
  emptyText,
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (!trimmed || items.includes(trimmed)) {
      return;
    }
    onAdd(trimmed);
    setInput("");
  };

  return (
    <HostCard title={title}>
      <div className="mb-3 flex min-h-10 flex-wrap gap-2">
        {items.length === 0 && (
          <span className="text-sm italic text-slate-500">{emptyText}</span>
        )}
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-full border border-blue-300/35 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="text-blue-300 transition-colors hover:text-blue-100"
              aria-label={`Eliminar ${item}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className={inputClass}
          value={input}
          placeholder={placeholder}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }
          }}
        />
        <button
          type="button"
          onClick={addTag}
          className="w-full rounded-xl border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-[#191919] sm:w-auto"
        >
          Anadir
        </button>
      </div>
    </HostCard>
  );
}

function HostMapPickerSection({ coordinates, onChange, onAddressChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const defaultCoords =
    coordinates?.length === 2 ? coordinates : DEFAULT_COORDINATES;
  const [lng, setLng] = useState(defaultCoords[0]);
  const [lat, setLat] = useState(defaultCoords[1]);
  const [geocoding, setGeocoding] = useState(false);

  const reverseGeocode = useCallback(
    async (rawLng, rawLat) => {
      if (!MAPBOX_TOKEN || !onAddressChange) {
        return;
      }

      try {
        setGeocoding(true);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${rawLng},${rawLat}.json?types=address&language=es&limit=1&proximity=${rawLng},${rawLat}&autocomplete=false&access_token=${MAPBOX_TOKEN}`,
        );
        const data = await response.json();
        const feature = data.features?.[0];

        if (!feature) {
          return;
        }

        const context = feature.context || [];
        const getContext = (prefix) =>
          context.find((item) => item.id.startsWith(prefix))?.text || "";

        onAddressChange({
          street: feature.text || "",
          number: feature.address || "",
          city: getContext("place") || getContext("locality") || "",
          province: getContext("region") || "",
          postalCode: getContext("postcode") || "",
          country: getContext("country") || "",
        });
      } catch (error) {
        console.error("Error reverse geocoding:", error);
      } finally {
        setGeocoding(false);
      }
    },
    [onAddressChange],
  );

  const updatePosition = useCallback(
    (newLng, newLat) => {
      const roundedLng = Number(newLng.toFixed(6));
      const roundedLat = Number(newLat.toFixed(6));
      setLng(roundedLng);
      setLat(roundedLat);
      onChange([roundedLng, roundedLat]);
      reverseGeocode(newLng, newLat);
    },
    [onChange, reverseGeocode],
  );

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current || !MAPBOX_TOKEN) {
      return;
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 17,
      performanceMetricsCollection: false,
    });

    markerRef.current = new mapboxgl.Marker({ draggable: true, color: "#f77827" })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    markerRef.current.on("dragend", () => {
      const markerPosition = markerRef.current.getLngLat();
      updatePosition(markerPosition.lng, markerPosition.lat);
    });

    mapRef.current.on("click", (event) => {
      markerRef.current.setLngLat([event.lngLat.lng, event.lngLat.lat]);
      updatePosition(event.lngLat.lng, event.lngLat.lat);
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, [lat, lng, updatePosition]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) {
      return;
    }

    if (!coordinates || coordinates.length !== 2) {
      return;
    }

    const [nextLng, nextLat] = coordinates;
    if (Math.abs(nextLng - lng) > 0.0001 || Math.abs(nextLat - lat) > 0.0001) {
      setLng(nextLng);
      setLat(nextLat);
      markerRef.current.setLngLat([nextLng, nextLat]);
      mapRef.current.flyTo({ center: [nextLng, nextLat], zoom: 17 });
    }
  }, [coordinates, lat, lng]);

  const handleManualLng = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setLng(value);
      return;
    }

    setLng(parsed);
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([parsed, lat]);
      mapRef.current.flyTo({ center: [parsed, lat], zoom: 17 });
    }
    onChange([parsed, lat]);
    reverseGeocode(parsed, lat);
  };

  const handleManualLat = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setLat(value);
      return;
    }

    setLat(parsed);
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([lng, parsed]);
      mapRef.current.flyTo({ center: [lng, parsed], zoom: 17 });
    }
    onChange([lng, parsed]);
    reverseGeocode(lng, parsed);
  };

  return (
    <HostCard
      title="Mapa y ubicacion"
      action={
        geocoding ? (
          <span className="text-xs font-medium text-slate-400">Geocodificando...</span>
        ) : null
      }
    >
      <div
        ref={mapContainerRef}
        className="h-56 w-full overflow-hidden rounded-xl border border-[#2a2a2a] sm:h-72"
      />

      <p className="mt-2 text-xs text-slate-500">
        Pulsa el mapa o arrastra el pin para ajustar la direccion.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Longitud</label>
          <input
            type="number"
            step="0.0000001"
            className={inputClass}
            value={lng}
            onChange={(event) => handleManualLng(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Latitud</label>
          <input
            type="number"
            step="0.0000001"
            className={inputClass}
            value={lat}
            onChange={(event) => handleManualLat(event.target.value)}
          />
        </div>
      </div>
    </HostCard>
  );
}

function HostSortablePhotoThumb({ photo, deletingId, onDelete, onSetPrimary }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-square overflow-hidden rounded-lg border ${
        photo.isPrimary ? "border-[#f77827]" : "border-[#2a2a2a]"
      } bg-[#080808]`}
      {...attributes}
      {...listeners}
    >
      <img
        src={cloudinaryPresets.thumbnail(photo.url)}
        alt={photo.alt || "Foto del establecimiento"}
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {photo.isPrimary && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-[#f77827] px-2 py-0.5 text-[10px] font-semibold text-white">
          Principal
        </span>
      )}

      <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-2 rounded-md bg-black/60 p-1 opacity-100 md:inset-0 md:rounded-none md:p-0 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
        {!photo.isPrimary && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSetPrimary(photo);
            }}
            className="rounded-lg bg-white/90 p-1.5 text-slate-900 transition-colors hover:bg-white"
            title="Marcar como principal"
          >
            <Star size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(photo._id);
          }}
          className="rounded-lg bg-rose-100 p-1.5 text-rose-700 transition-colors hover:bg-rose-200"
          disabled={deletingId === photo._id}
          title="Eliminar foto"
        >
          {deletingId === photo._id ? "..." : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
}

function HostPhotosSection({ establishmentId, mainImage, onMainImageChange }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);

  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await photoService.getByEstablishment(establishmentId);
      setPhotos(sortByOrder(response || []));
      setOrderChanged(false);
    } catch {
      setError("No se pudieron cargar las fotos");
    } finally {
      setLoading(false);
    }
  }, [establishmentId]);

  useEffect(() => {
    if (establishmentId) {
      fetchPhotos();
    }
  }, [establishmentId, fetchPhotos]);

  const showSuccess = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setPhotos((prev) => moveByDndIds(prev, active.id, over.id));
    setOrderChanged(true);
  }, []);

  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);
      setError("");
      const payload = buildOrderPayload(photos);
      await photoService.reorder(payload);
      setPhotos((prev) => assignSequentialOrder(prev));
      setOrderChanged(false);
      showSuccess("Orden de fotos guardado");
    } catch {
      setError("No se pudo guardar el orden");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Formato no valido. Usa JPG, PNG o WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      await photoService.uploadToEstablishment(file, establishmentId);
      showSuccess("Foto subida correctamente");
      await fetchPhotos();
    } catch (uploadError) {
      setError(uploadError?.response?.data?.message || "Error al subir la foto");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm("Eliminar esta foto?")) {
      return;
    }

    try {
      setDeletingId(photoId);
      await photoService.delete(photoId);
      setPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
      showSuccess("Foto eliminada");
    } catch {
      setError("No se pudo eliminar la foto");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (photo) => {
    try {
      await photoService.setPrimary(photo._id);
      await fetchPhotos();
      onMainImageChange?.(photo.url);
      showSuccess("Foto principal actualizada");
    } catch {
      setError("No se pudo marcar la foto principal");
    }
  };

  const primaryPhoto = photos.find((photo) => photo.isPrimary);
  const displayImage = primaryPhoto?.url || mainImage;
  const nonPrimaryPhotos = photos.filter((photo) => !photo.isPrimary);

  return (
    <HostCard
      title={`Galeria (${photos.length})`}
      action={
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          {orderChanged && (
            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={savingOrder}
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-[#191919] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {savingOrder ? "Guardando..." : "Guardar orden"}
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-[#f77827] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e06a1e] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <ImagePlus size={14} />
            {uploading ? "Subiendo..." : "Anadir foto"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      }
    >
      {error && (
        <div className="mb-3 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-3 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {successMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando fotos...</p>
      ) : (
        <div className="space-y-3">
          <div className="h-44 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#080808] sm:h-52">
            {displayImage ? (
              <img
                src={cloudinaryPresets.gallery(displayImage)}
                alt="Imagen principal"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-slate-500">
                Sin imagen principal
              </div>
            )}
          </div>

          {photos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#2a2a2a] px-4 py-6 text-center text-sm text-slate-500">
              No hay fotos todavia. Anade la primera con el boton superior.
            </div>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={nonPrimaryPhotos.map((photo) => photo._id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
                    {nonPrimaryPhotos.map((photo) => (
                      <HostSortablePhotoThumb
                        key={photo._id}
                        photo={photo}
                        deletingId={deletingId}
                        onDelete={handleDelete}
                        onSetPrimary={handleSetPrimary}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <p className="text-center text-xs text-slate-500">
                Arrastra miniaturas para cambiar el orden
              </p>
            </>
          )}
        </div>
      )}
    </HostCard>
  );
}

function HostSortableItemRow({
  item,
  onToggleAvailable,
  onToggleFeatured,
  onDelete,
  onEdit,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    background: isDragging ? "rgba(15, 23, 42, 0.7)" : undefined,
  };

  const renderOptions = () => {
    if (!item.modalities?.length) {
      return <span className="text-slate-500">Sin modalidades</span>;
    }

    if (item.modalities.length === 1) {
      const modality = item.modalities[0];
      return (
        <span>
          {modality.label} -{" "}
          {modality.isFree || modality.price === 0 ? (
            <span className="font-semibold text-emerald-400">Gratis</span>
          ) : (
            `${modality.price} EUR`
          )}
        </span>
      );
    }

    return (
      <select
        className="rounded-lg border border-[#2a2a2a] bg-[#080808] px-2 py-1 text-xs text-slate-300"
        defaultValue=""
        onChange={(event) => {
          event.target.value = "";
        }}
      >
        <option value="" disabled>
          {item.modalities.length} opciones
        </option>
        {item.modalities.map((modality, index) => (
          <option key={`${item._id}-${index}`} disabled>
            {modality.label} -{" "}
            {modality.isFree || modality.price === 0
              ? "Gratis"
              : `${modality.price} EUR`}
          </option>
        ))}
      </select>
    );
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="px-3 py-3">
        <button
          type="button"
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-[#191919] hover:text-slate-200"
          title="Arrastrar"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
      </td>

      <td className="px-3 py-3 text-slate-100">{item.name}</td>
      <td className="px-3 py-3 text-slate-300">{renderOptions()}</td>

      <td className="px-3 py-3">
        <button
          type="button"
          onClick={() => onToggleAvailable(item._id, item.available)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            item.available
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-rose-500/15 text-rose-300"
          }`}
        >
          {item.available ? "Si" : "No"}
        </button>
      </td>

      <td className="px-3 py-3">
        <button
          type="button"
          onClick={() => onToggleFeatured(item._id, item.featured)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            item.featured
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-rose-500/15 text-rose-300"
          }`}
        >
          {item.featured ? "Si" : "No"}
        </button>
      </td>

      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(item._id)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#2a2a2a] bg-[#111111] px-2.5 py-1 text-xs font-semibold text-slate-200 transition-colors hover:bg-[#191919]"
          >
            <Pencil size={12} /> Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id, item.name)}
            className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/25"
          >
            <Trash2 size={12} /> Borrar
          </button>
        </div>
      </td>
    </tr>
  );
}

function HostItemMobileCard({
  item,
  onToggleAvailable,
  onToggleFeatured,
  onDelete,
  onEdit,
}) {
  const getModalitiesSummary = () => {
    if (!item.modalities?.length) {
      return "Sin modalidades";
    }

    if (item.modalities.length === 1) {
      const modality = item.modalities[0];
      const priceLabel =
        modality.isFree || modality.price === 0
          ? "Gratis"
          : `${modality.price} EUR`;
      return `${modality.label} - ${priceLabel}`;
    }

    return `${item.modalities.length} opciones`;
  };

  return (
    <article className="rounded-xl border border-[#2a2a2a] bg-[#080808] p-3.5">
      <div className="flex flex-col gap-2 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-slate-100">{item.name}</p>
          <p className="mt-1 text-xs text-slate-400">{getModalitiesSummary()}</p>
        </div>

        <button
          type="button"
          onClick={() => onEdit(item._id)}
          className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-[#2a2a2a] bg-[#111111] px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-[#191919] min-[390px]:w-auto"
        >
          <Pencil size={12} />
          Editar
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        <button
          type="button"
          onClick={() => onToggleAvailable(item._id, item.available)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            item.available
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-rose-500/15 text-rose-300"
          }`}
        >
          {item.available ? "Disponible" : "No disponible"}
        </button>

        <button
          type="button"
          onClick={() => onToggleFeatured(item._id, item.featured)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            item.featured
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-rose-500/15 text-rose-300"
          }`}
        >
          {item.featured ? "Destacada" : "No destacada"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDelete(item._id, item.name)}
        className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/25"
      >
        <Trash2 size={12} />
        Borrar tapa
      </button>
    </article>
  );
}

function HostItemsSection({ establishmentId, itemEditorBasePath = "/host/items" }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [orderChanged, setOrderChanged] = useState(false);

  const itemEditorPrefix = itemEditorBasePath.endsWith("/")
    ? itemEditorBasePath.slice(0, -1)
    : itemEditorBasePath;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await itemService.getByEstablishment(establishmentId, {
        available: undefined,
      });
      setItems(sortByOrder(response?.data || []));
      setOrderChanged(false);
    } catch {
      setError("No se pudieron cargar las tapas");
    } finally {
      setLoading(false);
    }
  }, [establishmentId]);

  useEffect(() => {
    if (establishmentId) {
      fetchItems();
    }
  }, [establishmentId, fetchItems]);

  const showSuccess = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setItems((prev) => moveByDndIds(prev, active.id, over.id));
    setOrderChanged(true);
  }, []);

  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);
      setError("");
      const payload = buildOrderPayload(items);
      await itemService.reorder(payload);
      setItems((prev) => assignSequentialOrder(prev));
      setOrderChanged(false);
      showSuccess("Orden guardado correctamente");
    } catch {
      setError("No se pudo guardar el orden");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleToggleAvailable = async (itemId, currentAvailable) => {
    try {
      await itemService.update(itemId, { available: !currentAvailable });
      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, available: !currentAvailable } : item,
        ),
      );
    } catch {
      setError("No se pudo actualizar la disponibilidad");
    }
  };

  const handleToggleFeatured = async (itemId, currentFeatured) => {
    try {
      await itemService.update(itemId, { featured: !currentFeatured });
      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, featured: !currentFeatured } : item,
        ),
      );
    } catch {
      setError("No se pudo actualizar el destacado");
    }
  };

  const handleDelete = async (itemId, itemName) => {
    if (!window.confirm(`Eliminar la tapa \"${itemName}\"?`)) {
      return;
    }

    try {
      await itemService.delete(itemId);
      setItems((prev) => prev.filter((item) => item._id !== itemId));
      showSuccess("Tapa eliminada correctamente");
    } catch {
      setError("No se pudo eliminar la tapa");
    }
  };

  return (
    <HostCard
      title={`Carta de tapas (${items.length})`}
      action={
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          {orderChanged && (
            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={savingOrder}
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-[#191919] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {savingOrder ? "Guardando..." : "Guardar orden"}
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              navigate(`${itemEditorPrefix}/new`, { state: { establishmentId } })
            }
            className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-[#2563eb] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1d4ed8] sm:w-auto"
          >
            + Anadir tapa
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-3 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-3 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {successMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando tapas...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2a2a2a] px-4 py-6 text-center text-sm text-slate-500">
          No hay tapas registradas para este establecimiento.
        </div>
      ) : (
        <>
          <div className="space-y-2.5 md:hidden">
            {items.map((item) => (
              <HostItemMobileCard
                key={item._id}
                item={item}
                onToggleAvailable={handleToggleAvailable}
                onToggleFeatured={handleToggleFeatured}
                onDelete={handleDelete}
                onEdit={(id) => navigate(`${itemEditorPrefix}/${id}`)}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="overflow-x-auto rounded-xl border border-[#262626] bg-[#0b0b0b]">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead className="border-b border-[#262626] bg-[#111111]">
                      <tr>
                        <th className="w-8 px-3 py-3 text-left text-xs uppercase tracking-wide text-slate-400" />
                        <th className="px-3 py-3 text-left text-xs uppercase tracking-wide text-slate-400">Nombre</th>
                        <th className="px-3 py-3 text-left text-xs uppercase tracking-wide text-slate-400">Opciones</th>
                        <th className="px-3 py-3 text-left text-xs uppercase tracking-wide text-slate-400">Disponible</th>
                        <th className="px-3 py-3 text-left text-xs uppercase tracking-wide text-slate-400">Destacada</th>
                        <th className="px-3 py-3 text-left text-xs uppercase tracking-wide text-slate-400">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <HostSortableItemRow
                          key={item._id}
                          item={item}
                          onToggleAvailable={handleToggleAvailable}
                          onToggleFeatured={handleToggleFeatured}
                          onDelete={handleDelete}
                          onEdit={(id) => navigate(`${itemEditorPrefix}/${id}`)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </>
      )}
    </HostCard>
  );
}

export function HostEstablishmentSettings({
  establishment,
  onEstablishmentUpdated,
}) {
  const [form, setForm] = useState(() => buildForm(establishment));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm(buildForm(establishment));
  }, [establishment]);

  const establishmentId = establishment?._id;

  const canSave = useMemo(
    () => Boolean(establishmentId) && !saving,
    [establishmentId, saving],
  );

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleRootChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearMessages();
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
    clearMessages();
  };

  const handleAddressBlur = async () => {
    const coords = await geocodeAddress(form.address);
    if (coords) {
      setForm((prev) => ({
        ...prev,
        location: { type: "Point", coordinates: coords },
      }));
    }
  };

  const handleScheduleChange = (day, field, value) => {
    setForm((prev) => {
      const previousDay = prev.schedule[day] || {};
      const updatedDay =
        field === "afternoon"
          ? {
              ...previousDay,
              afternoon: { ...previousDay.afternoon, ...value },
            }
          : { ...previousDay, [field]: value };

      return {
        ...prev,
        schedule: { ...prev.schedule, [day]: updatedDay },
      };
    });
    clearMessages();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!establishmentId) {
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      type: form.type,
      cuisineType: form.cuisineType,
      address: form.address,
      location: form.location,
      phone: form.phone,
      email: form.email,
      website: form.website,
      socialLinks: form.socialLinks,
      schedule: form.schedule,
      features: form.features,
      priceRange: form.priceRange,
      mainImage: form.mainImage,
      active: form.active,
    };

    try {
      setSaving(true);
      clearMessages();
      const response = await establishmentService.update(establishmentId, payload);
      const updatedEstablishment = response?.data || {
        ...establishment,
        ...payload,
      };
      setForm(buildForm(updatedEstablishment));
      onEstablishmentUpdated?.(updatedEstablishment);
      setSuccess("Cambios guardados correctamente");
      toastService.success("Cambios guardados correctamente");
    } catch (saveError) {
      const message =
        saveError?.response?.data?.message ||
        "No se pudieron guardar los cambios del establecimiento";
      setError(message);
      toastService.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (!establishmentId) {
    return null;
  }

  return (
    <section className="rounded-[22px] border border-[#2a2a2a] bg-[#090909]/90 p-3 sm:p-5">
      <div className="mb-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="m-0 max-w-full break-words text-base font-bold leading-tight whitespace-normal text-slate-100 sm:text-lg">
            Ajustes del local
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Estructura optimizada para movil y bloques en negro.
          </p>
        </div>

        <button
          type="submit"
          form="host-establishment-form"
          disabled={!canSave}
          className="w-full rounded-xl bg-[#f77827] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#e06a1e] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <form id="host-establishment-form" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <HostCard title="Estado de tu local">
              <div className="grid gap-2.5">
                <label
                  htmlFor="host-active-status"
                  className="flex flex-col gap-2 rounded-xl border border-[#262626] bg-[#080808] px-3 py-2.5 sm:flex-row sm:items-center"
                >
                  <span className="inline-flex items-center gap-2 text-sm text-slate-200">
                    <input
                      id="host-active-status"
                      type="checkbox"
                      name="active"
                      checked={Boolean(form.active)}
                      onChange={handleRootChange}
                      disabled={saving}
                      className="accent-[#f77827]"
                    />
                    Activo
                  </span>

                  <span
                    className={`self-start rounded-full border px-2.5 py-0.5 text-xs font-bold sm:ml-auto sm:self-auto ${
                      form.active
                        ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
                        : "border-rose-400/35 bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {form.active ? "Si" : "No"}
                  </span>
                </label>

                <div className="flex flex-col gap-2 rounded-xl border border-[#262626] bg-[#080808] px-3 py-2.5 sm:flex-row sm:items-center">
                  <span className="text-sm text-slate-200">Verificacion</span>
                  <span
                    className={`self-start rounded-full border px-2.5 py-0.5 text-xs font-bold sm:ml-auto sm:self-auto ${
                      form.verified
                        ? "border-blue-400/35 bg-blue-500/15 text-blue-300"
                        : "border-amber-400/35 bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {form.verified ? "Verificado" : "Pendiente"}
                  </span>
                </div>
              </div>
            </HostCard>

            <HostCard title="Datos de contacto">
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Telefono *</label>
                  <input
                    className={inputClass}
                    name="phone"
                    value={form.phone}
                    onChange={handleRootChange}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    className={inputClass}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleRootChange}
                  />
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input
                    className={inputClass}
                    name="website"
                    value={form.website}
                    onChange={handleRootChange}
                  />
                </div>
              </div>
            </HostCard>

            <HostCard title="Informacion basica">
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input
                    className={inputClass}
                    name="name"
                    value={form.name}
                    onChange={handleRootChange}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Descripcion *</label>
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    name="description"
                    value={form.description}
                    onChange={handleRootChange}
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Tipo de establecimiento</label>
                    <select
                      className={inputClass}
                      name="type"
                      value={form.type}
                      onChange={handleRootChange}
                    >
                      {ESTABLISHMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Rango de precios</label>
                    <input
                      className={inputClass}
                      name="priceRange"
                      value={form.priceRange}
                      onChange={handleRootChange}
                    />
                  </div>
                </div>
              </div>
            </HostCard>

            <HostTagSection
              title="Tipo de cocina"
              items={form.cuisineType}
              onAdd={(cuisine) => {
                setForm((prev) => ({
                  ...prev,
                  cuisineType: [...prev.cuisineType, cuisine],
                }));
                clearMessages();
              }}
              onRemove={(cuisine) => {
                setForm((prev) => ({
                  ...prev,
                  cuisineType: prev.cuisineType.filter((item) => item !== cuisine),
                }));
                clearMessages();
              }}
              placeholder="Anade un tipo de cocina"
              emptyText="No hay tipos de cocina anadidos"
            />

            <HostTagSection
              title="Servicios extra"
              items={form.features}
              onAdd={(feature) => {
                setForm((prev) => ({
                  ...prev,
                  features: [...prev.features, feature],
                }));
                clearMessages();
              }}
              onRemove={(feature) => {
                setForm((prev) => ({
                  ...prev,
                  features: prev.features.filter((item) => item !== feature),
                }));
                clearMessages();
              }}
              placeholder="Anade un servicio"
              emptyText="No hay servicios anadidos"
            />

            <HostCard title="Direccion">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Calle *</label>
                  <input
                    className={inputClass}
                    name="street"
                    value={form.address.street}
                    onChange={handleAddressChange}
                    onBlur={handleAddressBlur}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Numero</label>
                  <input
                    className={inputClass}
                    name="number"
                    value={form.address.number}
                    onChange={handleAddressChange}
                    onBlur={handleAddressBlur}
                  />
                </div>

                <div>
                  <label className={labelClass}>Ciudad *</label>
                  <input
                    className={inputClass}
                    name="city"
                    value={form.address.city}
                    onChange={handleAddressChange}
                    onBlur={handleAddressBlur}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Provincia *</label>
                  <input
                    className={inputClass}
                    name="province"
                    value={form.address.province}
                    onChange={handleAddressChange}
                    onBlur={handleAddressBlur}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Codigo postal *</label>
                  <input
                    className={inputClass}
                    name="postalCode"
                    value={form.address.postalCode}
                    onChange={handleAddressChange}
                    onBlur={handleAddressBlur}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Pais</label>
                  <input
                    className={inputClass}
                    name="country"
                    value={form.address.country}
                    onChange={handleAddressChange}
                    onBlur={handleAddressBlur}
                  />
                </div>
              </div>
            </HostCard>

            <HostPhotosSection
              establishmentId={establishmentId}
              mainImage={form.mainImage}
              onMainImageChange={(url) => {
                setForm((prev) => ({ ...prev, mainImage: url }));
                clearMessages();
              }}
            />
          </div>

          <div className="space-y-4">
            <HostCard title="Redes sociales">
              <div className="grid gap-3 sm:grid-cols-2">
                {SOCIAL_FIELDS.map(({ key, label, placeholder, Icon }) => (
                  <div key={key}>
                    <label className={`${labelClass} inline-flex items-center gap-1.5`}>
                      <Icon size={14} />
                      {label}
                    </label>
                    <input
                      className={inputClass}
                      type="url"
                      name={key}
                      value={form.socialLinks[key] || ""}
                      onChange={(event) => {
                        const { name, value } = event.target;
                        setForm((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, [name]: value },
                        }));
                        clearMessages();
                      }}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </HostCard>

            <HostCard
              title="Horarios"
              action={
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <CalendarClock size={14} />
                  Semanal
                </span>
              }
            >
              <div className="space-y-3">
                {DAY_KEYS.map((day) => {
                  const dayConfig = form.schedule[day] || makeDay(true);
                  return (
                    <div key={day} className="rounded-xl border border-[#262626] bg-[#080808] p-3">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="min-w-20 text-sm font-semibold text-slate-200">
                          {DAY_LABELS[day]}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleScheduleChange(day, "closed", !dayConfig.closed)
                          }
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            dayConfig.closed
                              ? "bg-rose-500/15 text-rose-300"
                              : "bg-emerald-500/15 text-emerald-300"
                          }`}
                        >
                          {dayConfig.closed ? "Cerrado" : "Abierto"}
                        </button>
                      </div>

                      {dayConfig.closed ? (
                        <p className="text-sm text-slate-500">Cerrado</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid gap-2 min-[420px]:grid-cols-[1fr_auto_1fr] min-[420px]:items-center">
                            {dayConfig.split && (
                              <span className="text-xs text-slate-400 min-[420px]:col-span-3">Manana</span>
                            )}
                            <input
                              type="time"
                              className="w-full rounded-lg border border-[#2a2a2a] bg-[#080808] px-2.5 py-1.5 text-sm text-slate-200 outline-none focus:border-[#f77827]/60"
                              value={dayConfig.open || ""}
                              onChange={(event) =>
                                handleScheduleChange(day, "open", event.target.value)
                              }
                            />
                            <span className="hidden text-slate-500 min-[420px]:inline">-</span>
                            <input
                              type="time"
                              className="w-full rounded-lg border border-[#2a2a2a] bg-[#080808] px-2.5 py-1.5 text-sm text-slate-200 outline-none focus:border-[#f77827]/60"
                              value={dayConfig.close || ""}
                              onChange={(event) =>
                                handleScheduleChange(day, "close", event.target.value)
                              }
                            />
                          </div>

                          {dayConfig.split && (
                            <div className="grid gap-2 min-[420px]:grid-cols-[1fr_auto_1fr] min-[420px]:items-center">
                              <span className="text-xs text-slate-400 min-[420px]:col-span-3">Tarde</span>
                              <input
                                type="time"
                                className="w-full rounded-lg border border-[#2a2a2a] bg-[#080808] px-2.5 py-1.5 text-sm text-slate-200 outline-none focus:border-[#f77827]/60"
                                value={dayConfig.afternoon?.open || ""}
                                onChange={(event) =>
                                  handleScheduleChange(day, "afternoon", {
                                    open: event.target.value,
                                  })
                                }
                              />
                              <span className="hidden text-slate-500 min-[420px]:inline">-</span>
                              <input
                                type="time"
                                className="w-full rounded-lg border border-[#2a2a2a] bg-[#080808] px-2.5 py-1.5 text-sm text-slate-200 outline-none focus:border-[#f77827]/60"
                                value={dayConfig.afternoon?.close || ""}
                                onChange={(event) =>
                                  handleScheduleChange(day, "afternoon", {
                                    close: event.target.value,
                                  })
                                }
                              />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleScheduleChange(day, "split", !dayConfig.split)
                            }
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              dayConfig.split
                                ? "border-[#f77827]/55 bg-[#f77827]/15 text-orange-300"
                                : "border-slate-600 text-slate-400 hover:border-[#f77827]/55 hover:text-orange-300"
                            }`}
                          >
                            {dayConfig.split ? "Quitar turno partido" : "+ Turno partido"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </HostCard>

            <HostMapPickerSection
              coordinates={form.location.coordinates}
              onChange={(coordinates) => {
                setForm((prev) => ({
                  ...prev,
                  location: { type: "Point", coordinates },
                }));
                clearMessages();
              }}
              onAddressChange={(addressData) => {
                setForm((prev) => ({
                  ...prev,
                  address: { ...prev.address, ...addressData },
                }));
                clearMessages();
              }}
            />

            <HostItemsSection
              establishmentId={establishmentId}
              itemEditorBasePath="/host/items"
            />
          </div>
        </div>
      </form>
    </section>
  );
}
