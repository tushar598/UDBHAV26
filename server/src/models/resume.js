import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number },

  fileData: { type: Buffer, required: true },

  parsedSkills: [{ type: String }],
  parsedExperience: { type: String },
  parsedEducation: { type: String },

  uploadedAt: { type: Date, default: Date.now },
});

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
