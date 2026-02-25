import { Router } from "express";
import { verifyToken, restrictTo } from "../middlewares/authMiddleware.js";
import {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  reactivateUser,
  updateUser,
} from "../controllers/userController.js";

export const userRouter = Router();

userRouter.get("/", verifyToken, restrictTo("admin"), getUsers);
userRouter.get("/:id", verifyToken, getUserById);
userRouter.post("/", createUser);
userRouter.delete("/:id", verifyToken, deleteUser);
userRouter.patch("/:id/reactivate", verifyToken, restrictTo("admin"), reactivateUser);
userRouter.put("/:id", verifyToken, updateUser);
