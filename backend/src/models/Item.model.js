import mongoose from "mongoose";

// Sub-schema embebido para las modalidades de precio/presentación
const modalitySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "El nombre de la modalidad es obligatorio"],
      trim: true,
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
    },
    price: {
      type: Number,
      min: [0, "El precio no puede ser negativo"],
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },

    // ── Slug ─────────────────────────────────────────────────────────────────
    // unique:true eliminado del campo — la unicidad se garantiza con el índice
    // compuesto slug+establishment definido al final del schema.
    slug: {
      type: String,
      trim: true,
    },
    // ─────────────────────────────────────────────────────────────────────────

    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      minlength: [10, "La descripción debe tener al menos 10 caracteres"],
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Establishment",
      required: [true, "El establecimiento es obligatorio"],
    },

    modalities: {
      type: [modalitySchema],
      validate: {
        validator: function (val) {
          if (!val || val.length === 0) return false;
          const hasInvalidFree = val.some((m) => m.isFree && m.price > 0);
          if (hasInvalidFree) return false;
          const labels = val.map((m) => m.label.toLowerCase().trim());
          return labels.length === new Set(labels).size;
        },
        message:
          "Las modalidades no son válidas (mínimo una, sin duplicados, gratis con precio 0)",
      },
      default: () => [
        { label: "Tapa", price: 0, isFree: false, available: true },
      ],
    },

    categories: [{ type: String }],
    allergens: [{ type: String }],
    dietaryOptions: [{ type: String }],

    available: { type: Boolean, default: true },
    seasonalItem: { type: Boolean, default: false },
    specialDays: [{ type: String }],

    mainImage: { type: String, default: null },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }],

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    totalReviews: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },

    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },

    deleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Índices ───────────────────────────────────────────────────────────────────

// Unicidad: mismo slug solo puede repetirse si es de otro establecimiento
itemSchema.index({ slug: 1, establishment: 1 }, { unique: true });

// ── Virtuals ──────────────────────────────────────────────────────────────────

itemSchema.virtual("isFree").get(function () {
  return this.modalities?.some((m) => m.isFree && m.available) ?? false;
});

itemSchema.virtual("basePrice").get(function () {
  const available = this.modalities?.filter((m) => m.available && !m.isFree);
  return available?.length ? Math.min(...available.map((m) => m.price)) : 0;
});

itemSchema.virtual("availableModalities").get(function () {
  return this.modalities?.filter((m) => m.available) ?? [];
});

// ─────────────────────────────────────────────────────────────────────────────

const Item = mongoose.model("Item", itemSchema);

export default Item;

