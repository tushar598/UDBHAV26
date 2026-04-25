import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: "local",
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Login User (with cookie)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user signed up via OAuth and has no password
    if (!user.password) {
      return res.status(400).json({
        message: `This account uses ${user.authProvider} login. Please sign in with ${user.authProvider}.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Create JWT Token — include role so AuthContext can route correctly on refresh
    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ Send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      name: user.name,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ OAuth Callback Handler — creates JWT and redirects to client
export const oauthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`
      );
    }

    // Create JWT Token — include role so AuthContext can route correctly on refresh
    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // lax for OAuth redirects
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to client
    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/resume-upload`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=server_error`
    );
  }
};

// ✅ Get Profile (enhanced with all fields)
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password -githubAccessToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || "",
      authProvider: user.authProvider || "local",
      role: user.role || "user",
      location: user.location || "",
      skills: user.skills || [],
      desiredPost: user.desiredPost || [],
      desiredLocation: user.desiredLocation || [],
      githubUsername: user.githubUsername || "",
      githubRepos: user.githubRepos || [],
      leetcodeUsername: user.leetcodeUsername || "",
      skillLevel: user.skillLevel || "",
      skillLevelAnalysis: user.skillLevelAnalysis || "",
      createdAt: user.createAt,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Lightweight "who am I" — reads role from JWT, zero DB calls
export const getMe = (req, res) => {
  res.status(200).json({ id: req.userId, role: req.userRole });
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
