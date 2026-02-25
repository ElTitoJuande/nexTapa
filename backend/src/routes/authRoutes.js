import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { login } from "../controllers/authController.js";

export const authRouter = express.Router();

authRouter.post("/login", login);

authRouter.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});
