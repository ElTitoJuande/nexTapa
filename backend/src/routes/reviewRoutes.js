import express from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getReviews,
  getMyReviews,
} from "../controllers/reviewController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

export const reviewRouter = express.Router();

reviewRouter.get("/", getReviews); // público
reviewRouter.get("/my", verifyToken, getMyReviews);
reviewRouter.post("/", verifyToken, createReview);
reviewRouter.put("/:id", verifyToken, updateReview);
reviewRouter.delete("/:id", verifyToken, deleteReview);
