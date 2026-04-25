import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  fetchLeetcodeProfile,
  connectLeetcode,
} from "../controller/leetcodeController.js";

const router = express.Router();

// ✅ Save LeetCode username
router.post("/connect", verifyToken, connectLeetcode);

// ✅ Fetch LeetCode profile (public)
router.get("/profile/:username", fetchLeetcodeProfile);

export default router;
