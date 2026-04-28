// src/routes/reservationRoutes.js
import { Router } from 'express';
import {
  createReservation,
  confirmReservation,
  rejectReservation,
  completeReservation,
  cancelReservationHost,
  cancelReservation,
  getMyReservations,
  getEstablishmentReservations
} from '../controllers/reservationController.js';
import { verifyToken, restrictTo } from '../middlewares/authMiddleware.js';

export const reservationRouter = Router();

// ── Cliente ───────────────────────────────────────────────────────────────────
reservationRouter.post('/',              verifyToken, restrictTo('cliente'),    createReservation);
reservationRouter.get('/my',             verifyToken, restrictTo('cliente'),    getMyReservations);
reservationRouter.patch('/:id/cancel',   verifyToken, restrictTo('cliente'),    cancelReservation);

// ── Hostelero ─────────────────────────────────────────────────────────────────
// FLUJO 1 — Gestión de reservas pendientes
reservationRouter.get('/establishment/:id',    verifyToken, restrictTo('hostelero'), getEstablishmentReservations);
reservationRouter.patch('/:id/confirm',        verifyToken, restrictTo('hostelero'), confirmReservation);
reservationRouter.patch('/:id/reject',         verifyToken, restrictTo('hostelero'), rejectReservation);

// FLUJO 2 — Gestión de reservas confirmadas
reservationRouter.patch('/:id/complete',       verifyToken, restrictTo('hostelero'), completeReservation);
reservationRouter.patch('/:id/cancel-host',    verifyToken, restrictTo('hostelero'), cancelReservationHost);