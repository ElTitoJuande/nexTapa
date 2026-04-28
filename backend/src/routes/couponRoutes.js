// src/routes/couponRoutes.js
import { Router } from 'express';
import { getMyCoupons, useCoupon } from '../controllers/couponController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

export const couponRouter = Router();

// ── Cliente — solo requiere estar autenticado ─────────────────────────────────
couponRouter.get('/my',         verifyToken, getMyCoupons);
couponRouter.delete('/:id/use', verifyToken, useCoupon);