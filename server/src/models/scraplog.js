import mongoose from "mongoose";

const scrapLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  platform: { type: String },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  totalJobs: { type: Number, default: 0 },
  totalInternships: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  error: { type: String },
});

const ScrapLog = mongoose.model("ScrapLog", scrapLogSchema);

export default ScrapLog;
