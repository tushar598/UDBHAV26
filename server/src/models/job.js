import mongoose from "mongoose";


const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  company: { type: String },
  location: { type: String },
  platform: { type: String },
  link: { type: String },
  discription: { type: String },
  skillsRequired: { type: [String] },
  salary: { type: String },
  postedAt: { type: Date },
  scrapedAt: { type: Date, default: Date.now },
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
