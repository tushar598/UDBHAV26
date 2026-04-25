import express from "express";
import { parseResume } from "../controller/parserController.js";

const router = express.Router();

router.post("/parse/:userId", parseResume);

export default router;
