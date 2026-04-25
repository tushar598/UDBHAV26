import express from "express";
import {
  fetchAndSaveInternships,
  getInternships,
} from "../controller/internshipController.js";

const router = express.Router();

router.get("/scrape/:userId", fetchAndSaveInternships);
router.get("/get/:userId", getInternships);

export default router;
