import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
    connectGithub,
    fetchGithubRepos,
    analyzeReposWithGemini,
    fetchGithubContributions,
    fetchPublicContributions,
} from "../controller/githubController.js";

const router = express.Router();

// ✅ Connect GitHub username (for non-GitHub-OAuth users)
router.post("/connect", verifyToken, connectGithub);

// ✅ Fetch repos from GitHub
router.get("/repos", verifyToken, fetchGithubRepos);

// ✅ Analyze selected repos with Gemini AI
router.post("/analyze", verifyToken, analyzeReposWithGemini);

// ✅ Fetch GitHub contribution activity (heatmap data)
router.get("/contributions", verifyToken, fetchGithubContributions);

// ✅ Public contributions — company viewing any developer's heatmap by username
router.get("/contributions/public/:username", verifyToken, fetchPublicContributions);

export default router;

