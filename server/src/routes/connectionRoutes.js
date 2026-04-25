import express from "express";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";
import {
    sendConnectionRequest,
    respondToConnection,
    getConnections,
} from "../controller/connectionController.js";

const router = express.Router();

// ✅ Send connection request (company only)
router.post(
    "/request",
    verifyToken,
    requireRole("company"),
    sendConnectionRequest
);

// ✅ Respond to connection (user only)
router.post("/respond", verifyToken, respondToConnection);

// ✅ Get connections (both roles)
router.get("/", verifyToken, getConnections);

export default router;
