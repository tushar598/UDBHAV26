import Company from "../models/company.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Company Login
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: company._id, role: "company" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Company login successful",
      companyId: company._id,
      companyName: company.companyName,
      role: "company",
    });
  } catch (error) {
    console.error("Error in company login:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get Company Profile
export const getCompanyProfile = async (req, res) => {
  try {
    const companyId = req.userId; // set by verifyToken
    const company = await Company.findById(companyId).select("-password");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({
      id: company._id,
      companyName: company.companyName,
      email: company.email,
      logo: company.logo,
      industry: company.industry,
      website: company.website,
      description: company.description,
      location: company.location,
      role: "company",
      createdAt: company.createdAt,
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ List Developers (paginated, abstract data)
export const listDevelopers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { role: { $ne: "company" }, isPublicProfile: true };

    // Optional skill filter
    if (req.query.skills) {
      const skillsArr = req.query.skills.split(",").map((s) => s.trim());
      filter.skills = { $in: skillsArr };
    }

    // Optional location filter
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: "i" };
    }

    // Optional skill level filter
    if (req.query.skillLevel) {
      filter.skillLevel = req.query.skillLevel;
    }

    const total = await User.countDocuments(filter);
    const developers = await User.find(filter)
      .select(
        "name profilePhoto skills skillLevel location githubUsername leetcodeUsername createAt"
      )
      .sort({ createAt: -1 })
      .skip(skip)
      .limit(limit);

    const abstractList = developers.map((dev) => ({
      id: dev._id,
      name: dev.name,
      profilePhoto: dev.profilePhoto || "",
      skills: (dev.skills || []).slice(0, 5), // top 5 skills only
      skillLevel: dev.skillLevel || "",
      location: dev.location || "",
      githubUsername: dev.githubUsername || "",
      leetcodeUsername: dev.leetcodeUsername || "",
      joinedAt: dev.createAt,
    }));

    res.status(200).json({
      message: "Developers fetched successfully",
      total,
      page,
      totalPages: Math.ceil(total / limit),
      developers: abstractList,
    });
  } catch (error) {
    console.error("Error listing developers:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Search Developers
export const searchDevelopers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(q.trim(), "i");

    const developers = await User.find({
      role: { $ne: "company" },
      isPublicProfile: true,
      $or: [
        { name: searchRegex },
        { skills: searchRegex },
        { location: searchRegex },
        { githubUsername: searchRegex },
        { leetcodeUsername: searchRegex },
      ],
    })
      .select(
        "name profilePhoto skills skillLevel location githubUsername leetcodeUsername createAt"
      )
      .limit(50);

    const results = developers.map((dev) => ({
      id: dev._id,
      name: dev.name,
      profilePhoto: dev.profilePhoto || "",
      skills: (dev.skills || []).slice(0, 5),
      skillLevel: dev.skillLevel || "",
      location: dev.location || "",
      githubUsername: dev.githubUsername || "",
      leetcodeUsername: dev.leetcodeUsername || "",
      joinedAt: dev.createAt,
    }));

    res.status(200).json({
      message: "Search results",
      total: results.length,
      developers: results,
    });
  } catch (error) {
    console.error("Error searching developers:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ View Developer Profile (full public profile)
export const viewDeveloperProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "-password -githubAccessToken"
    );

    if (!user) {
      return res.status(404).json({ message: "Developer not found" });
    }

    if (!user.isPublicProfile) {
      return res.status(403).json({ message: "This profile is private" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || "",
      location: user.location || "",
      skills: user.skills || [],
      skillLevel: user.skillLevel || "",
      skillLevelAnalysis: user.skillLevelAnalysis || "",
      githubUsername: user.githubUsername || "",
      githubRepos: user.githubRepos || [],
      leetcodeUsername: user.leetcodeUsername || "",
      desiredPost: user.desiredPost || [],
      desiredLocation: user.desiredLocation || [],
      createdAt: user.createAt,
    });
  } catch (error) {
    console.error("Error viewing developer profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
