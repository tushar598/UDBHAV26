import express from "express";
import { verifyToken, requireRole } from "../middlewares/authMiddleware.js";
import {
    loginCompany,
    getCompanyProfile,
    listDevelopers,
    searchDevelopers,
    viewDeveloperProfile,
} from "../controller/companyController.js";

const router = express.Router();

// ✅ Company Auth
router.post("/login", loginCompany);

// ✅ Company Profile (requires company role)
router.get("/profile", verifyToken, requireRole("company"), getCompanyProfile);

// ✅ Developer Listing (requires company role)
router.get("/developers", verifyToken, requireRole("company"), listDevelopers);

// ✅ Developer Search (requires company role)
router.get(
    "/developers/search",
    verifyToken,
    requireRole("company"),
    searchDevelopers
);

// ✅ View Developer Profile (requires company role)
router.get(
    "/developers/:userId/profile",
    verifyToken,
    requireRole("company"),
    viewDeveloperProfile
);

export default router;
