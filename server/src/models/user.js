import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for OAuth users
  location: { type: String, required: false },
  desiredPost: { type: [String] },
  desiredLocation: { type: [String] },
  skills: { type: [String] },

  // Role: "user" (default) or "company"
  role: {
    type: String,
    enum: ["user", "company"],
    default: "user",
  },

  // Profile visibility for companies
  isPublicProfile: { type: Boolean, default: true },

  // OAuth fields
  profilePhoto: { type: String, default: "" },
  authProvider: {
    type: String,
    enum: ["local", "google", "github"],
    default: "local",
  },
  providerId: { type: String, default: "" },

  // GitHub integration
  githubUsername: { type: String, default: "" },
  githubAccessToken: { type: String, default: "" },
  githubRepos: [
    {
      name: { type: String },
      fullName: { type: String },
      description: { type: String },
      url: { type: String },
      language: { type: String },
      techStack: { type: [String] },
      frameworks: { type: [String] },
      stars: { type: Number },
      forks: { type: Number },
    },
  ],

  // LeetCode integration
  leetcodeUsername: { type: String, default: "" },

  // Skill level assessment
  skillLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", ""],
    default: "",
  },
  skillLevelAnalysis: { type: String, default: "" }, // AI reasoning

  createAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

export default User;
