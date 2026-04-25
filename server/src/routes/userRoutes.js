import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  loginUser,
  registerUser,
  logoutUser,
  getProfile,
} from "../controller/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", verifyToken,getProfile);

export default router;
