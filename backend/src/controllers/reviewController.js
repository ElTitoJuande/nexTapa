import Review from "../models/Review.model.js";
import Establishment from "../models/Establishment.model.js";
import Item from "../models/Item.model.js";

// ── Helpers ─────────────────────────────────────────────────────────────────

import mongoose from "mongoose";

const getAvgRating = async (field, id) => {
  const result = await Review.aggregate([
    { $match: { [field]: new mongoose.Types.ObjectId(id) } }, // 👈
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  return result[0]
    ? { avg: Math.round(result[0].avg * 10) / 10, count: result[0].count }
    : { avg: null, count: 0 };
};

// ── POST /api/reviews ────────────────────────────────────────────────────────

export const createReview = async (req, res) => {
  try {
    const { establishmentId, itemId, rating } = req.body;
    const userId = req.user._id;

    if (!establishmentId && !itemId)
      return res
        .status(400)
        .json({ message: "Debes indicar un establecimiento o una tapa" });
    if (establishmentId && itemId)
      return res
        .status(400)
        .json({ message: "Solo puedes valorar un elemento a la vez" });

    // Verificar que el target existe
    if (establishmentId) {
      const exists = await Establishment.exists({
        _id: establishmentId,
        active: true,
      });
      if (!exists)
        return res
          .status(404)
          .json({ message: "Establecimiento no encontrado" });
    }
    if (itemId) {
      const exists = await Item.exists({ _id: itemId });
      if (!exists)
        return res.status(404).json({ message: "Tapa no encontrada" });
    }

    const review = await Review.create({
      user: userId,
      establishment: establishmentId || null,
      item: itemId || null,
      rating,
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Ya has valorado este elemento" });
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/reviews/:id ─────────────────────────────────────────────────────

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ message: "Valoración no encontrada" });

    if (review.user.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "No puedes editar esta valoración" });

    const { rating } = req.body;
    review.rating = rating;
    await review.save();

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/reviews/:id ──────────────────────────────────────────────────

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ message: "Valoración no encontrada" });

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
      return res
        .status(403)
        .json({ message: "No puedes eliminar esta valoración" });

    await review.deleteOne();
    res.json({ message: "Valoración eliminada" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/reviews?targetType=establishment&target=:id ─────────────────────
// Público — devuelve reviews de un elemento concreto + su media

export const getReviews = async (req, res) => {
  try {
    const { targetType, target } = req.query;
    if (!targetType || !target)
      return res
        .status(400)
        .json({ message: "Faltan parámetros targetType y target" });

    const field = targetType === "establishment" ? "establishment" : "item";

    const [reviews, stats] = await Promise.all([
      Review.find({ [field]: target })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .lean(),
      getAvgRating(field, target), // reutilizamos el helper de arriba
    ]);

    // Convertir el ObjectId de target a mongoose para el $match
    // (getAvgRating espera un ObjectId — lo pasamos como string, mongo lo castea bien)

    res.json({ reviews, ...stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/reviews/my ──────────────────────────────────────────────────────
// Historial del usuario autenticado

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("establishment", "name slug")
      .populate({
        path: "item",
        select: "name slug establishment",
        populate: { path: "establishment", select: "name slug" }, // 👈
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ── GET /api/admin/reviews ───────────────────────────────────────────────────
// Panel admin — todas las valoraciones
export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const skip = (page - 1) * limit;

    // ✅ filtro por userId si viene en la query
    const filter = userId ? { user: userId } : {};

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email")
        .populate("establishment", "name slug")
        .populate("item", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      reviews,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
