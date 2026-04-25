import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
} from "../controller/notificationController.js";

const router = express.Router();

// ✅ Get notifications (paginated)
router.get("/", verifyToken, getNotifications);

// ✅ Get unread count
router.get("/unread-count", verifyToken, getUnreadCount);

// ✅ Mark notifications as read
router.post("/mark-read", verifyToken, markAsRead);

export default router;
