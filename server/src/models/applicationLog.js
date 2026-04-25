import mongoose from "mongoose";

const applicationLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    internshipTitle: { type: String, default: "" },
    company: { type: String, default: "" },
    link: { type: String, required: true },
    status: {
        type: String,
        enum: ["applied", "failed", "skipped"],
        default: "skipped",
    },
    reason: { type: String, default: "" },
    appliedAt: { type: Date, default: Date.now },
});

const ApplicationLog = mongoose.model("ApplicationLog", applicationLogSchema);

export default ApplicationLog;
