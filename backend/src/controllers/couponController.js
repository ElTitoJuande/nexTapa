// src/controllers/couponController.js
import Coupon from '../models/Coupon.model.js';

// ─────────────────────────────────────────────
//  GET /api/coupons/my
//  Cliente consulta sus cupones activos
// ─────────────────────────────────────────────
export const getMyCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      client: req.user._id,
      status: 'active',
    })
      .populate('establishment', 'name mainImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: coupons });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
//  DELETE /api/coupons/:id/use
//  Cliente usa y elimina su cupón
// ─────────────────────────────────────────────
export const useCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    if (coupon.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (coupon.status !== 'active') {
      return res.status(400).json({ message: 'Solo se pueden usar cupones activos' });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.json({ message: 'Cupón usado y eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};