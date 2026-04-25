import jwt from "jsonwebtoken";
import Company from "../models/company.js";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ message: "Unauthorized - No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role || "user"; // default to "user" for backward compatibility
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * Middleware to require a specific role.
 * Use after verifyToken.
 * Example: requireRole("company")
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.userRole !== role) {
      return res.status(403).json({
        message: `Access denied. Requires '${role}' role.`,
      });
    }
    next();
  };
};
