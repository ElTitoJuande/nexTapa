

//src/models/Establishment.model.js
// Modelo de establecimiento con validaciones, lógica de horarios y soft delete

import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
  open:  { type: String, match: [/^\d{2}:\d{2}$/, 'Formato horario inválido (HH:MM)'], default: '' },
  close: { type: String, match: [/^\d{2}:\d{2}$/, 'Formato horario inválido (HH:MM)'], default: '' },
}, { _id: false });

const timeRangeSchema = new mongoose.Schema({
  open:      { type: String, match: [/^\d{2}:\d{2}$/, 'Formato horario inválido (HH:MM)'], default: '' },
  close:     { type: String, match: [/^\d{2}:\d{2}$/, 'Formato horario inválido (HH:MM)'], default: '' },
  closed:    { type: Boolean, default: false },
  split:     { type: Boolean, default: false },
  afternoon: { type: shiftSchema, default: () => ({ open: '', close: '' }) },
}, { _id: false });

const socialLinksSchema = new mongoose.Schema({
  instagram: { type: String, trim: true, default: '' },
  facebook:  { type: String, trim: true, default: '' },
  twitter:   { type: String, trim: true, default: '' },
  googleBusiness: { type: String, trim: true, default: '' },
}, { _id: false });

const establishmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del establecimiento es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  slug:        { type: String, unique: true, lowercase: true },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  owner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  type: {
    type: String,
    enum: ['bar', 'restaurante', 'cafeteria', 'cerveceria', 'tasca', 'gastrobar', 'otro'],
    default: 'bar'
  },
  cuisineType: [{ type: String }],
  address: {
    street:     { type: String, required: [true, 'La calle es obligatoria'] },
    number:     String,
    city:       { type: String, required: [true, 'La ciudad es obligatoria'] },
    province:   { type: String, required: [true, 'La provincia es obligatoria'] },
    postalCode: { type: String, required: [true, 'El código postal es obligatorio'] },
    country:    { type: String, default: 'España' }
  },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      required: [true, 'Las coordenadas son obligatorias'],
      validate: {
        validator: (coords) =>
          coords.length === 2 &&
          coords[0] >= -180 && coords[0] <= 180 &&
          coords[1] >= -90  && coords[1] <= 90,
        message: 'Coordenadas inválidas'
      }
    }
  },
  phone:   { type: String, required: [true, 'El teléfono es obligatorio'], trim: true },
  email:   { type: String, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Por favor introduce un email válido'] },
  website: { type: String, trim: true },
  socialLinks: { type: socialLinksSchema, default: () => ({}) },
  schedule: {
    lunes:     { type: timeRangeSchema, default: () => ({ closed: true }) },
    martes:    { type: timeRangeSchema, default: () => ({ closed: true }) },
    miercoles: { type: timeRangeSchema, default: () => ({ closed: true }) },
    jueves:    { type: timeRangeSchema, default: () => ({ closed: true }) },
    viernes:   { type: timeRangeSchema, default: () => ({ closed: true }) },
    sabado:    { type: timeRangeSchema, default: () => ({ closed: true }) },
    domingo:   { type: timeRangeSchema, default: () => ({ closed: true }) }
  },
  features:  [{ type: String }],
  priceRange: {
    type: String,
    trim: true,
    set: (val) => {
      if (!val || val.toString().trim() === '') return '';
      return `${val.toString().replace(/€/g, '').trim()}€`;
    }
  },
  mainImage:     { type: String, default: null },
  images:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
  averageRating: { type: Number, default: 0, min: 0, max: 5, set: val => Math.round(val * 10) / 10 },
  totalReviews:  { type: Number, default: 0 },
  verified:      { type: Boolean, default: false },
  active:        { type: Boolean, default: true },
  // ── Soft delete ─────────────────────────────────────────────────────────────
  deleted:       { type: Boolean, default: false, index: true },
  deletedAt:     { type: Date, default: null },
  // ────────────────────────────────────────────────────────────────────────────
  views:         { type: Number, default: 0 },
  favorites:     { type: Number, default: 0 },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  updatedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true }
}, {
  timestamps: true,
  toJSON:   { virtuals: false },
  toObject: { virtuals: false }
});

// ── Índice geoespacial ─────────────────────────────────────────────────────────
establishmentSchema.index({ location: '2dsphere' });

// ── Static: lógica de apertura reutilizable en cualquier controller ────────────
establishmentSchema.statics.computeIsOpen = function (schedule) {
  if (!schedule) return false;

  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const now = new Date();
  const todaySchedule = schedule[days[now.getDay()]];

  if (!todaySchedule || todaySchedule.closed) return false;

  const current =
    now.getHours().toString().padStart(2, '0') + ':' +
    now.getMinutes().toString().padStart(2, '0');

  const inRange = (open, close) => {
    if (!open || !close) return false;
    if (close < open) return current >= open || current < close; // cierre de madrugada
    return current >= open && current < close;
  };

  if (inRange(todaySchedule.open, todaySchedule.close)) return true;

  if (todaySchedule.split && todaySchedule.afternoon) {
    return inRange(todaySchedule.afternoon.open, todaySchedule.afternoon.close);
  }

  return false;
};

const Establishment = mongoose.model('Establishment', establishmentSchema, 'establishments');

export default Establishment;