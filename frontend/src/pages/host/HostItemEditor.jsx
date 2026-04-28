import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  GripVertical,
  ImagePlus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { itemService } from "../../services/itemService";
import { photoService } from "../../services/photoService";
import { toastService } from "../../services/toastService";
import { useGeolocation } from "../../hooks/useGeolocation";
import { cloudinaryPresets } from "../../utils/cloudinaryHelpers";
import {
  assignSequentialOrder,
  buildOrderPayload,
  moveByDndIds,
  sortByOrder,
} from "../admin/utils/sortableOrder";

const cardClass =
  "rounded-2xl border border-[#262626] bg-gradient-to-b from-[#111111]/95 to-[#080808]/95 p-5";
const labelClass = "mb-1 block text-sm font-medium text-slate-400";
const inputClass =
  "w-full rounded-xl border border-[#2a2a2a] bg-[#080808] px-3 py-2.5 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-[#f77827]/60 focus:ring-2 focus:ring-[#f77827]/20";

const DAY_OPTIONS = [
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miercoles", label: "Miercoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sabado" },
  { value: "domingo", label: "Domingo" },
];

const CATEGORY_OPTIONS = [
  { value: "Carne", label: "🥩 Carne" },
  { value: "Pescado", label: "🐟 Pescado" },
  { value: "Marisco", label: "🦐 Marisco" },
  { value: "Verduras", label: "🥦 Verduras" },
  { value: "Queso", label: "🧀 Queso" },
  { value: "Embutido", label: "🥓 Embutido" },
  { value: "Jamon", label: "🍖 Jamon" },
  { value: "Huevo", label: "🍳 Huevo" },
  { value: "Tortilla", label: "🫓 Tortilla" },
  { value: "Frito", label: "🍟 Frito" },
  { value: "Plancha", label: "🔥 Plancha" },
  { value: "Horno", label: "♨️ Horno" },
  { value: "Guiso", label: "🍲 Guiso" },
  { value: "Ensalada", label: "🥗 Ensalada" },
  { value: "Croqueta", label: "🟤 Croqueta" },
  { value: "Patatas", label: "🥔 Patatas" },
  { value: "Pan/Tostada", label: "🍞 Pan/Tostada" },
  { value: "Montadito", label: "🥪 Montadito" },
  { value: "Hamburguesa", label: "🍔 Hamburguesa" },
  { value: "Arroz", label: "🍚 Arroz" },
  { value: "Caldos", label: "🥣 Caldos" },
  { value: "Gazpacho", label: "🍅 Gazpacho" },
  { value: "Migas", label: "🌾 Migas" },
  { value: "Encurtido", label: "🥒 Encurtido" },
  { value: "Legumbres", label: "🫘 Legumbres" },
  { value: "Postre", label: "🍰 Postre" },
  { value: "Bebida", label: "🍷 Bebida" },
];

const ALLERGEN_OPTIONS = [
  { value: "Gluten", label: "🌾 Gluten" },
  { value: "Lactosa", label: "🥛 Lactosa" },
  { value: "Huevo", label: "🥚 Huevo" },
  { value: "Pescado", label: "🐟 Pescado" },
  { value: "Marisco", label: "🦐 Marisco" },
  { value: "Frutos secos", label: "🌰 Frutos secos" },
  { value: "Cacahuetes", label: "🥜 Cacahuetes" },
  { value: "Soja", label: "🫘 Soja" },
  { value: "Apio", label: "🥬 Apio" },
  { value: "Mostaza", label: "🌿 Mostaza" },
  { value: "Sesamo", label: "🌰 Sesamo" },
  { value: "Sulfitos", label: "🍷 Sulfitos" },
  { value: "Altramuz", label: "🌼 Altramuz" },
  { value: "Moluscos", label: "🐚 Moluscos" },
];

const DIETARY_OPTIONS = [
  { value: "Vegetariano", label: "🥕 Vegetariano" },
  { value: "Vegano", label: "🌱 Vegano" },
  { value: "Sin Gluten", label: "🚫🌾 Sin Gluten" },
  { value: "Sin Lactosa", label: "🚫🥛 Sin Lactosa" },
  { value: "Sin Azucar", label: "🚫🍬 Sin Azucar" },
  { value: "Halal", label: "☪️ Halal" },
  { value: "Kosher", label: "✡️ Kosher" },
];

const MODALITY_SUGGESTIONS = [
  "Tapa",
  "Pincho",
  "Montadito",
  "Media racion",
  "Racion",
  "Racion entera",
  "Entrante",
  "Plato",
  "Postre",
  "Bocadillo",
  "Desayuno",
  "Gratis",
];

const makeEmptyModality = () => ({
  label: "Tapa",
  price: 0,
  isFree: false,
  available: true,
});

const makeInitialForm = () => ({
  name: "",
  description: "",
  modalities: [makeEmptyModality()],
  categories: [],
  allergens: [],
  dietaryOptions: [],
  available: true,
  featured: false,
  seasonalItem: false,
  specialDays: [],
  order: 0,
  mainImage: "",
});

const normalizeIncomingItem = (itemData) => ({
  name: itemData?.name || "",
  description: itemData?.description || "",
  modalities: itemData?.modalities?.length
    ? itemData.modalities
    : [makeEmptyModality()],
  categories: itemData?.categories || [],
  allergens: itemData?.allergens || [],
  dietaryOptions: itemData?.dietaryOptions || [],
  available: itemData?.available !== undefined ? itemData.available : true,
  featured: itemData?.featured || false,
  seasonalItem: itemData?.seasonalItem || false,
  specialDays: itemData?.specialDays || [],
  order: itemData?.order || 0,
  mainImage: itemData?.mainImage || "",
});

function HostCard({ title, children, action }) {
  return (
    <section className={cardClass}>
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#232323] pb-2">
        <h2 className="m-0 text-lg font-semibold text-slate-100">{title}</h2>
        {action || null}
      </div>
      {children}
    </section>
  );
}

function BooleanBadge({ value, yes = "Si", no = "No" }) {
  return (
    <span
      className={`rounded-full border px-3 py-0.5 text-xs font-bold ${
        value
          ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
          : "border-rose-400/35 bg-rose-500/15 text-rose-300"
      }`}
    >
      {value ? yes : no}
    </span>
  );
}

function ChipSelector({ options, selected = [], onChange, hint }) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {normalizedOptions.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                isSelected
                  ? "border-[#f77827]/60 bg-[#f77827]/20 text-orange-200"
                  : "border-[#2a2a2a] bg-[#080808] text-slate-300 hover:border-[#f77827]/60 hover:text-orange-200"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function HostSortablePhotoThumb({ photo, deleting, onDelete, onSetPrimary }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#080808] ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div className="relative aspect-square w-full">
        <img
          src={cloudinaryPresets.thumbnail(photo.url)}
          alt={photo.alt || "Foto"}
          className="h-full w-full object-cover"
        />
        {photo.isPrimary && (
          <span className="absolute left-2 top-2 rounded-full border border-amber-300/50 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
            Principal
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 p-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-[#171717] hover:text-slate-200"
          aria-label="Reordenar foto"
        >
          <GripVertical size={14} />
        </button>

        {!photo.isPrimary && (
          <button
            type="button"
            onClick={() => onSetPrimary(photo)}
            className="rounded-lg p-1.5 text-amber-300 hover:bg-[#171717]"
            aria-label="Marcar principal"
          >
            <Star size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(photo._id)}
          disabled={deleting}
          className="rounded-lg p-1.5 text-rose-300 hover:bg-[#171717] disabled:opacity-50"
          aria-label="Eliminar foto"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}
function HostItemPhotoSection({ itemId, mainImage, onMainImageChange }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const fetchPhotos = useCallback(async () => {
    if (!itemId) {
      setPhotos([]);
      return;
    }
    try {
      setLoading(true);
      const data = await photoService.getByItem(itemId);
      setPhotos(sortByOrder(data || []));
      setOrderChanged(false);
    } catch (error) {
      toastService.error(error?.response?.data?.message || "No se pudieron cargar las fotos");
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const onDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    setPhotos((prev) => moveByDndIds(prev, active.id, over.id));
    setOrderChanged(true);
  }, []);

  const onSaveOrder = async () => {
    try {
      setSavingOrder(true);
      const payload = buildOrderPayload(photos);
      await photoService.reorder(payload);
      setPhotos((prev) => assignSequentialOrder(prev));
      setOrderChanged(false);
      toastService.success("Orden de fotos guardado");
    } catch (error) {
      toastService.error(error?.response?.data?.message || "No se pudo guardar el orden");
    } finally {
      setSavingOrder(false);
    }
  };

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !itemId) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      toastService.error("Solo se permiten imagenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastService.error("Maximo 5MB por imagen");
      return;
    }

    try {
      setUploading(true);
      const isPrimary = photos.length === 0;
      await photoService.uploadToItem(file, itemId, { isPrimary });
      await fetchPhotos();
      toastService.success("Foto subida");
      if (isPrimary) {
        const updated = await photoService.getByItem(itemId);
        const primary = updated?.find((photo) => photo.isPrimary);
        if (primary?.url) {
          onMainImageChange(primary.url);
        }
      }
    } catch (error) {
      toastService.error(error?.response?.data?.message || "No se pudo subir la foto");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onDelete = async (photoId) => {
    if (!window.confirm("Vas a eliminar esta foto. Continuar?")) {
      return;
    }
    try {
      setDeletingId(photoId);
      await photoService.delete(photoId);
      setPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
      toastService.success("Foto eliminada");
    } catch (error) {
      toastService.error(error?.response?.data?.message || "No se pudo eliminar la foto");
    } finally {
      setDeletingId(null);
    }
  };

  const onSetPrimary = async (photo) => {
    try {
      await photoService.setPrimary(photo._id);
      await fetchPhotos();
      onMainImageChange(photo.url);
      toastService.success("Foto principal actualizada");
    } catch (error) {
      toastService.error(error?.response?.data?.message || "No se pudo marcar principal");
    }
  };

  if (!itemId) {
    return (
      <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Guarda la tapa primero para poder anadir fotos.
      </div>
    );
  }

  const primary = photos.find((photo) => photo.isPrimary);
  const displayImage = primary?.url || mainImage;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#080808]">
            <div className="aspect-[16/10]">
              {displayImage ? (
                <img
                  src={cloudinaryPresets.tapaDetail(displayImage)}
                  alt="Imagen principal"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  Sin imagen principal
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={onUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#f77827]/50 bg-[#f77827]/20 px-3 py-2 text-sm font-semibold text-orange-200 hover:bg-[#f77827]/30 disabled:opacity-50"
          >
            <ImagePlus size={15} />
            {uploading ? "Subiendo..." : "Anadir foto"}
          </button>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="rounded-xl border border-[#2a2a2a] bg-[#080808] px-3 py-6 text-center text-sm text-slate-400">
              Cargando fotos...
            </div>
          ) : photos.length === 0 ? (
            <div className="rounded-xl border border-[#2a2a2a] bg-[#080808] px-3 py-6 text-center text-sm text-slate-500">
              Las fotos apareceran aqui
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={photos.map((photo) => photo._id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((photo) => (
                    <HostSortablePhotoThumb
                      key={photo._id}
                      photo={photo}
                      deleting={deletingId === photo._id}
                      onDelete={onDelete}
                      onSetPrimary={onSetPrimary}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <div className="flex justify-end">
            {orderChanged ? (
              <button
                type="button"
                onClick={onSaveOrder}
                disabled={savingOrder}
                className="rounded-lg bg-[#f77827] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#e56f21] disabled:opacity-50"
              >
                {savingOrder ? "Guardando..." : "Guardar orden"}
              </button>
            ) : (
              <span className="text-xs text-slate-500">Arrastra para reordenar</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export function HostItemEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { coords } = useGeolocation();
  const isNew = id === "new";

  const establishmentIdFromState = location.state?.establishmentId;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [item, setItem] = useState(null);
  const [form, setForm] = useState(makeInitialForm);

  const viewLink = useMemo(() => {
    if (!item?.slug) {
      return "";
    }
    const query = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : "";
    return `/items/${item.slug}${query}`;
  }, [item?.slug, coords]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (success) {
      setSuccess("");
    }
  };

  const fetchItem = useCallback(async () => {
    if (!id || isNew) {
      return;
    }

    try {
      setLoading(true);
      const response = await itemService.getById(id);
      const data = response?.data;
      if (!data) {
        throw new Error("No item data");
      }
      setItem(data);
      setForm(normalizeIncomingItem(data));
    } catch (fetchError) {
      const message =
        fetchError?.response?.data?.message || "No se pudo cargar la tapa";
      setError(message);
      toastService.error(message);
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleModalitiesChange = (index, field, value) => {
    setField(
      "modalities",
      form.modalities.map((modality, idx) => {
        if (idx !== index) {
          return modality;
        }
        const next = { ...modality, [field]: value };
        if (field === "label" && value.toLowerCase().trim() === "gratis") {
          next.price = 0;
        }
        return next;
      }),
    );
  };

  const addModality = () => {
    setField("modalities", [...form.modalities, makeEmptyModality()]);
  };

  const removeModality = (index) => {
    if (form.modalities.length === 1) {
      return;
    }
    setField(
      "modalities",
      form.modalities.filter((_, idx) => idx !== index),
    );
  };

  const toggleDay = (dayValue) => {
    const selected = form.specialDays || [];
    if (selected.includes(dayValue)) {
      setField(
        "specialDays",
        selected.filter((day) => day !== dayValue),
      );
      return;
    }
    setField("specialDays", [...selected, dayValue]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (isNew && !establishmentIdFromState) {
      const message =
        "No hay establecimiento asociado. Crea la tapa desde la configuracion del local.";
      setError(message);
      toastService.error(message);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        modalities: (form.modalities || []).map((modality) => ({
          ...modality,
          price: Number(modality.price) || 0,
          isFree: Number(modality.price) === 0,
        })),
        ...(isNew && establishmentIdFromState
          ? { establishment: establishmentIdFromState }
          : {}),
      };

      if (isNew) {
        const created = await itemService.create(payload);
        const newId = created?.data?._id;
        if (!newId) {
          throw new Error("No se pudo obtener el id del item");
        }
        toastService.success("Tapa creada");
        navigate(`/host/items/${newId}`, {
          replace: true,
          state: { establishmentId: establishmentIdFromState },
        });
        return;
      }

      await itemService.update(id, payload);
      setSuccess("Cambios guardados");
      toastService.success("Tapa actualizada");
      fetchItem();
    } catch (submitError) {
      const message =
        submitError?.response?.data?.message || "No se pudo guardar la tapa";
      setError(message);
      toastService.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-[1180px] px-4 py-6 md:px-6">
        <div className="rounded-2xl border border-[#262626] bg-gradient-to-b from-[#111111]/95 to-[#080808]/95 px-4 py-5 text-sm text-slate-300">
          Cargando tapa...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 py-6 md:px-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#2a2a2a] bg-[#080808] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-[#171717]"
            >
              <ArrowLeft size={15} />
              Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {isNew ? "Nueva tapa" : `Editar: ${item?.name || ""}`}
              </h1>
              {!isNew && item?.establishment?.name ? (
                <p className="text-sm text-slate-400">{item.establishment.name}</p>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#f77827] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e46d20] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </header>

        {error ? (
          <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        <HostCard title="Fotos">
          <HostItemPhotoSection
            itemId={isNew ? null : id}
            mainImage={form.mainImage || item?.mainImage}
            onMainImageChange={(url) => setField("mainImage", url)}
          />
        </HostCard>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-3">
            <HostCard title="Informacion basica">
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input
                    className={inputClass}
                    type="text"
                    value={form.name}
                    onChange={(event) => setField("name", event.target.value)}
                    placeholder="Nombre de la tapa"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Descripcion *</label>
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    value={form.description}
                    onChange={(event) => setField("description", event.target.value)}
                    placeholder="Describe la tapa, ingredientes, elaboracion..."
                    maxLength={500}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {form.description.length}/500 caracteres
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Orden de visualizacion</label>
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    value={form.order === "" ? "" : Number(form.order) + 1}
                    onChange={(event) => {
                      const value = event.target.value;
                      setField(
                        "order",
                        value === "" ? "" : Math.max(parseInt(value, 10) - 1, 0),
                      );
                    }}
                  />
                </div>
              </div>
            </HostCard>

            <HostCard title="Precio y modalidades">
              <p className="mb-3 text-sm text-slate-400">
                Anade todas las presentaciones disponibles para esta tapa.
              </p>

              <div className="space-y-2">
                {form.modalities.map((modality, index) => (
                  <div
                    key={`${index}-${modality.label}`}
                    className={`rounded-xl border p-3 ${
                      modality.available
                        ? "border-[#2a2a2a] bg-[#080808]"
                        : "border-[#3a3a3a] bg-[#080808]/50 opacity-70"
                    }`}
                  >
                    <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto_auto] sm:items-center">
                      <div>
                        <input
                          className={inputClass}
                          list={`host-modality-${index}`}
                          value={modality.label}
                          onChange={(event) =>
                            handleModalitiesChange(index, "label", event.target.value)
                          }
                          placeholder="Ej: Tapa, Racion..."
                        />
                        <datalist id={`host-modality-${index}`}>
                          {MODALITY_SUGGESTIONS.map((option) => (
                            <option key={option} value={option} />
                          ))}
                        </datalist>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#0b0b0b] px-2.5">
                        <span className="text-sm text-slate-400">EUR</span>
                        <input
                          className="w-full bg-transparent py-2 text-sm text-slate-100 outline-none"
                          type="number"
                          min="0"
                          step="0.1"
                          value={modality.price}
                          onChange={(event) =>
                            handleModalitiesChange(
                              index,
                              "price",
                              parseFloat(event.target.value) || 0,
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleModalitiesChange(index, "available", !modality.available)
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-bold ${
                          modality.available
                            ? "border border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
                            : "border border-slate-500/40 bg-slate-500/15 text-slate-300"
                        }`}
                      >
                        {modality.available ? "Activa" : "Oculta"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeModality(index)}
                        disabled={form.modalities.length === 1}
                        className="rounded-lg border border-rose-400/45 bg-rose-500/10 px-2.5 py-2 text-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Eliminar modalidad"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addModality}
                className="mt-3 rounded-xl border border-[#2a2a2a] bg-[#080808] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-[#171717]"
              >
                + Anadir modalidad
              </button>
            </HostCard>

            <HostCard title="Alergenos">
              <ChipSelector
                options={ALLERGEN_OPTIONS}
                selected={form.allergens}
                onChange={(values) => setField("allergens", values)}
                hint="Marca todos los alergenos presentes para informar correctamente."
              />
            </HostCard>
          </div>

          <div className="space-y-3">
            <HostCard title="Estado y visibilidad">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#2a2a2a] bg-[#0b0b0b] px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Disponible</p>
                    <p className="text-xs text-slate-500">
                      Aparece en la carta y en los resultados de busqueda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setField("available", !form.available)}
                  >
                    <BooleanBadge value={Boolean(form.available)} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#2a2a2a] bg-[#0b0b0b] px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Destacada</p>
                    <p className="text-xs text-slate-500">
                      Se muestra en posicion preferente dentro de la carta.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setField("featured", !form.featured)}
                  >
                    <BooleanBadge value={Boolean(form.featured)} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>Dias especiales</label>
                <div className="flex flex-wrap gap-2">
                  {DAY_OPTIONS.map((day) => {
                    const selected = (form.specialDays || []).includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          selected
                            ? "border-[#f77827]/60 bg-[#f77827]/20 text-orange-200"
                            : "border-[#2a2a2a] bg-[#080808] text-slate-300 hover:border-[#f77827]/60 hover:text-orange-200"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Deja vacio si esta disponible todos los dias.
                </p>
              </div>
            </HostCard>

            <HostCard title="Categorias">
              <ChipSelector
                options={CATEGORY_OPTIONS}
                selected={form.categories}
                onChange={(values) => setField("categories", values)}
              />
            </HostCard>

            <HostCard title="Opciones dieteticas">
              <ChipSelector
                options={DIETARY_OPTIONS}
                selected={form.dietaryOptions}
                onChange={(values) => setField("dietaryOptions", values)}
              />
            </HostCard>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2">
          {!isNew && viewLink ? (
            <a
              href={viewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border border-[#2a2a2a] bg-[#080808] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-[#171717]"
            >
              <Eye size={15} />
              Ver en la app
            </a>
          ) : null}
        </footer>
      </form>
    </section>
  );
}
