// src/routes/establishmentRoutes.js
import { Router } from 'express';
import {
  getEstablishments,
  getEstablishmentById,
  getMine,
  getPending,
  createEstablishment,
  deleteEstablishment,
  deactivateEstablishment,
  reactivateEstablishment,
  updateEstablishment,
  getEstablishmentBySlug,
  getNearbyEstablishments,
  updateSocialLinks,
  verifyEstablishment,
  rejectEstablishment,
} from '../controllers/establishmentController.js';
import { verifyToken, restrictTo } from '../middlewares/authMiddleware.js';

export const establishmentRouter = Router();

// ── Rutas estáticas — SIEMPRE antes de /:id ───────────────────────────────────
establishmentRouter.get('/',           getEstablishments);
establishmentRouter.get('/mine',       verifyToken, restrictTo('hostelero'), getMine);
establishmentRouter.get('/pending',    verifyToken, restrictTo('admin'),     getPending);
establishmentRouter.get('/slug/:slug', getEstablishmentBySlug);
establishmentRouter.get('/nearby',     getNearbyEstablishments);

// ── Rutas dinámicas con :id ───────────────────────────────────────────────────
establishmentRouter.get('/:id',                getEstablishmentById);
establishmentRouter.post('/',                  createEstablishment);
establishmentRouter.delete('/:id',             deleteEstablishment);
establishmentRouter.patch('/:id/reactivate',   reactivateEstablishment);
establishmentRouter.patch('/:id/deactivate',   deactivateEstablishment);
establishmentRouter.patch('/:id/social-links', updateSocialLinks);
establishmentRouter.patch('/:id/verify',       verifyToken, restrictTo('admin'), verifyEstablishment);
establishmentRouter.patch('/:id/reject',       verifyToken, restrictTo('admin'), rejectEstablishment);
establishmentRouter.patch('/:id',              updateEstablishment);