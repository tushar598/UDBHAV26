import express from "express";
import multer from "multer";
import { uploadResume, getUserResume } from "../controller/resumeController.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/:userId", getUserResume);

export default router;
