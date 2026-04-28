// src/models/Reservation.model.js

import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({

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

  // ── Datos de la reserva ───────────────────────────────────────────────────────
  date: {
    type: Date,
    required: [true, 'La fecha de la reserva es obligatoria']
  },

  time: {
    type: String,
    required: [true, 'La hora de la reserva es obligatoria'],
    match: [/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)']
  },

  guests: {
    type: Number,
    required: [true, 'El número de comensales es obligatorio'],
    min: [1, 'Debe haber al menos 1 comensal'],
    max: [50, 'Máximo 50 comensales por reserva']
  },

  notes: {
    type: String,
    trim: true,
    maxlength: [300, 'Las notas no pueden exceder 300 caracteres'],
    default: ''
  },

  // ── Estado ────────────────────────────────────────────────────────────────────
  // pending   → el establecimiento aún no ha respondido
  // confirmed → el establecimiento ha aceptado
  // rejected  → el establecimiento ha rechazado
  // completed → la reserva se ha consumado (establecimiento la marca como completada)
  // cancelled → el cliente ha cancelado antes de que el establecimiento responda
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },

  // Razón opcional de rechazo (la rellena el establecimiento)
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [200, 'La razón de rechazo no puede exceder 200 caracteres'],
    default: null
  },

  // ── Importe de la cuenta (lo introduce el establecimiento al completar) ────────
  // Necesario para calcular el 5% del cupón
  totalAmount: {
    type: Number,
    min: [0, 'El importe no puede ser negativo'],
    default: null
  },

  // Referencia al cupón generado al completar (si aplica)
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  }

}, {
  timestamps: true,
  toJSON:   { virtuals: false },
  toObject: { virtuals: false }
});

const Reservation = mongoose.model('Reservation', reservationSchema, 'reservations');

export default Reservation;