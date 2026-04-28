import express from "express";
import { verifyToken, restrictTo } from "../middlewares/authMiddleware.js";
import { getAdminStats } from "../controllers/adminStatsController.js";
import {
  getAllReviews,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.use(verifyToken, restrictTo("admin"));

router.get("/stats", getAdminStats);
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

export default router;
