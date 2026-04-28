// src/models/Coupon.model.js
import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({

  // ── Relaciones ────────────────────────────────────────────────────────────────
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El cliente es obligatorio'],
    index: true
  },

  establishment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: [true, 'El establecimiento es obligatorio'],
    index: true
  },

  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: [true, 'La reserva de origen es obligatoria'],
    unique: true
  },

  // ── Descuento — solo porcentaje, sin importe ──────────────────────────────────
  discountPercent: {
    type: Number,
    default: 5,
    min: 1,
    max: 100
  },

  // ── Estado ────────────────────────────────────────────────────────────────────
  // active  → disponible para el cliente
  // used    → el cliente lo ha canjeado
  // expired → no se usó antes de la fecha de expiración
  status: {
    type: String,
    enum: ['active', 'used', 'expired'],
    default: 'active',
    index: true
  },

  // ── Fechas ────────────────────────────────────────────────────────────────────
  // Expira 90 días después de ser creado
  expiresAt: {
    type: Date,
    default: null,
    index: true
  },

  usedAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true,
  toJSON:   { virtuals: false },
  toObject: { virtuals: false }
});

// ── Código único legible (ej: NEXT-A3F2-9K1P) ────────────────────────────────
couponSchema.pre('save', function () {
  if (!this.isNew) return;

  const chars   = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  this.code     = `NEXT-${segment()}-${segment()}`;
  this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
});

couponSchema.add({
  code: { type: String, unique: true, index: true }
});

const Coupon = mongoose.model('Coupon', couponSchema, 'coupons');
export default Coupon;