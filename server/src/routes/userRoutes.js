import express from "express";
import passport from "../config/passportConfig.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  loginUser,
  registerUser,
  logoutUser,
  getProfile,
  oauthCallback,
  getMe,
} from "../controller/userController.js";

const router = express.Router();

// ✅ Standard Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", verifyToken, getProfile);
router.get("/me", verifyToken, getMe); // Lightweight role check from JWT

// ✅ Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=google_failed`,
    session: false,
  }),
  oauthCallback
);

// ✅ GitHub OAuth
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email", "repo"] })
);
router.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=github_failed`,
    session: false,
  }),
  oauthCallback
);

export default router;
