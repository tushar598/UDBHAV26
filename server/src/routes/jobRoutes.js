import express from "express";
import { fetchAndSaveJobs, getJobs } from "../controller/jobController.js";

const router = express.Router();

router.get("/fetch/:userId", fetchAndSaveJobs);
router.get("/get/:userId", getJobs);

export default router;
