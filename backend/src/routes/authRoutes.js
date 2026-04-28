// src/routes/authRoutes.js
import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  login,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

export const authRouter = express.Router();

authRouter.post("/login",    login);
authRouter.post("/register", register);

// ── Verificación de email ─────────────────────────────────────────────────────
authRouter.get("/verify-email/:token", verifyEmail);

// ── Recuperación de contraseña ────────────────────────────────────────────────
authRouter.post("/forgot-password",        forgotPassword);
authRouter.patch("/reset-password/:token", resetPassword);

// ── Usuario autenticado ───────────────────────────────────────────────────────
authRouter.get("/me", verifyToken, (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});