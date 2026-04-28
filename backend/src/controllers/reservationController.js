// src/controllers/reservationController.js
import Reservation from '../models/Reservation.model.js';
import Establishment from '../models/Establishment.model.js';
import Coupon from '../models/Coupon.model.js';
import { notifyEstablishment, notifyClient } from '../app.js';
import { sendEmail } from '../config/brevo.js';
import { reservationConfirmedMail, reservationRejectedMail } from '../email-templates/generateTemplates.js';

// ─────────────────────────────────────────────
//  POST /api/reservations
//  Cliente crea una nueva reserva
// ─────────────────────────────────────────────
export const createReservation = async (req, res, next) => {
  try {
    const { establishmentId, date, time, guests, notes } = req.body;
    const clientId = req.user._id;

    const establishment = await Establishment.findById(establishmentId)
      .select('name email owner deleted active');

    if (!establishment || establishment.deleted || !establishment.active) {
      return res.status(404).json({ message: 'Establecimiento no encontrado o inactivo' });
    }

    const reservation = await Reservation.create({
      client: clientId,
      establishment: establishmentId,
      date, time, guests, notes
    });

    if (establishment.owner) {
      notifyEstablishment(establishment.owner.toString(), {
        type:              'new_reservation',
        reservationId:     reservation._id.toString(),
        clientId:          clientId.toString(),
        date, time, guests, notes,
        establishmentName: establishment.name
      });
    }

    res.status(201).json({ message: 'Reserva creada, pendiente de confirmación', reservation });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  PATCH /api/reservations/:id/confirm
//  FLUJO 1 — Hostelero confirma → email al cliente (sin cupón)
// ─────────────────────────────────────────────
export const confirmReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('establishment', 'owner name')
      .populate('client', 'name email');

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (!reservation.establishment.owner) {
      return res.status(403).json({ message: 'Este establecimiento no tiene propietario asignado' });
    }

    if (reservation.establishment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ message: `La reserva ya está en estado: ${reservation.status}` });
    }

    reservation.status = 'confirmed';
    await reservation.save();

    // Email al cliente — confirmación sin cupón
    setTimeout(() => {
      sendEmail(
        [{ email: reservation.client.email, name: reservation.client.name }],
        `✅ Reserva confirmada en ${reservation.establishment.name} — nexTapa`,
        reservationConfirmedMail({
          clientName:        reservation.client.name,
          establishmentName: reservation.establishment.name,
          date:              reservation.date,
          time:              reservation.time,
          guests:            reservation.guests,
        })
      ).catch((err) => console.error('[Brevo] Error en email de confirmación:', err.message));
    }, 0);

    res.json({ message: 'Reserva confirmada', reservation });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  PATCH /api/reservations/:id/reject
//  FLUJO 1 — Hostelero rechaza → email al cliente
// ─────────────────────────────────────────────
export const rejectReservation = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const reservation = await Reservation.findById(req.params.id)
      .populate('establishment', 'owner name')
      .populate('client', 'name email');

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (!reservation.establishment.owner) {
      return res.status(403).json({ message: 'Este establecimiento no tiene propietario asignado' });
    }

    if (reservation.establishment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ message: `La reserva ya está en estado: ${reservation.status}` });
    }

    reservation.status          = 'rejected';
    reservation.rejectionReason = rejectionReason || null;
    await reservation.save();

    // Email al cliente — rechazo
    setTimeout(() => {
      sendEmail(
        [{ email: reservation.client.email, name: reservation.client.name }],
        `😔 Reserva no disponible en ${reservation.establishment.name} — nexTapa`,
        reservationRejectedMail({
          clientName:        reservation.client.name,
          establishmentName: reservation.establishment.name,
          date:              reservation.date,
          time:              reservation.time,
          guests:            reservation.guests,
          rejectionReason:   rejectionReason || null,
        })
      ).catch((err) => console.error('[Brevo] Error en email de rechazo:', err.message));
    }, 0);

    res.json({ message: 'Reserva rechazada', reservation });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  PATCH /api/reservations/:id/complete
//  FLUJO 2 — Hostelero finaliza → genera cupón → WS al cliente
// ─────────────────────────────────────────────
export const completeReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('establishment', 'owner name')
      .populate('client', 'name email');

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (!reservation.establishment.owner) {
      return res.status(403).json({ message: 'Este establecimiento no tiene propietario asignado' });
    }

    if (reservation.establishment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (reservation.status !== 'confirmed') {
      return res.status(400).json({ message: 'Solo se pueden finalizar reservas confirmadas' });
    }

    // Generar cupón 5%
    const coupon = await Coupon.create({
      client:          reservation.client._id,
      establishment:   reservation.establishment._id,
      reservation:     reservation._id,
      discountPercent: 5,
    });

    reservation.status = 'completed';
    reservation.coupon = coupon._id;
    await reservation.save();

    // WS al cliente — cupón activado
    notifyClient(reservation.client._id.toString(), {
      type:              'coupon_activated',
      couponId:          coupon._id.toString(),
      code:              coupon.code,
      discountPercent:   coupon.discountPercent,
      expiresAt:         coupon.expiresAt,
      establishmentName: reservation.establishment.name,
      message:           `¡Tienes un cupón del ${coupon.discountPercent}% para tu próxima visita en ${reservation.establishment.name}!`,
    });

    res.json({ message: 'Reserva finalizada y cupón enviado al cliente', reservation, coupon });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  PATCH /api/reservations/:id/cancel-host
//  FLUJO 2 — Hostelero cancela reserva confirmada (sin cupón, sin email)
// ─────────────────────────────────────────────
export const cancelReservationHost = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('establishment', 'owner name');

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (!reservation.establishment.owner) {
      return res.status(403).json({ message: 'Este establecimiento no tiene propietario asignado' });
    }

    if (reservation.establishment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (reservation.status !== 'confirmed') {
      return res.status(400).json({ message: 'Solo se pueden cancelar reservas confirmadas' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({ message: 'Reserva cancelada', reservation });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  PATCH /api/reservations/:id/cancel
//  Cliente cancela su propia reserva (pending o confirmed)
// ─────────────────────────────────────────────
export const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('establishment', 'owner name');

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (reservation.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (!['pending', 'confirmed'].includes(reservation.status)) {
      return res.status(400).json({ message: 'Esta reserva no se puede cancelar' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    if (reservation.establishment.owner) {
      notifyEstablishment(reservation.establishment.owner.toString(), {
        type:          'reservation_cancelled',
        reservationId: reservation._id.toString(),
        message:       'Una reserva ha sido cancelada por el cliente',
      });
    }

    res.json({ message: 'Reserva cancelada', reservation });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  GET /api/reservations/my
// ─────────────────────────────────────────────
export const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ client: req.user._id })
      .populate('establishment', 'name address mainImage')
      .sort({ date: -1 });
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  GET /api/reservations/establishment/:id
// ─────────────────────────────────────────────
export const getEstablishmentReservations = async (req, res, next) => {
  try {
    const establishment = await Establishment.findById(req.params.id).select('owner');

    if (!establishment) {
      return res.status(404).json({ message: 'Establecimiento no encontrado' });
    }

    if (!establishment.owner) {
      return res.status(403).json({ message: 'Este establecimiento no tiene propietario asignado' });
    }

    if (establishment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const reservations = await Reservation.find({ establishment: req.params.id })
      .populate('client', 'name email phone')
      .sort({ date: -1 });

    res.json(reservations);
  } catch (err) {
    next(err);
  }
};