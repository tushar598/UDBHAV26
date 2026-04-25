import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
    getConversations,
    getMessages,
    sendMessage,
} from "../controller/chatController.js";

const router = express.Router();

// ✅ Get all conversations
router.get("/conversations", verifyToken, getConversations);

// ✅ Get messages for a conversation
router.get("/messages/:conversationId", verifyToken, getMessages);

// ✅ Send a message
router.post("/send", verifyToken, sendMessage);

export default router;
