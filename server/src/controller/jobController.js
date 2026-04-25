import User from "../models/user.js";
import Job from "../models/job.js";
import { scrapeJobs } from "../services/scraper/jobScraper.js";

// 🧠 Fetch, refresh, and save jobs for a specific user
export const fetchAndSaveJobs = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Validate user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { desiredPost, desiredLocation } = user;
    if (!desiredPost?.length || !desiredLocation?.length) {
      return res.status(400).json({
        message: "User desired post or desired location is missing",
      });
    }

    // 2️⃣ Delete existing jobs for this user (if any)
    const deleted = await Job.deleteMany({ userId });
    console.log(
      `🗑️ Deleted ${deleted.deletedCount} old jobs for user: ${userId}`
    );

    // 3️⃣ Scrape new jobs
    const scrapedJobs = await scrapeJobs(desiredPost, desiredLocation);

    // 4️⃣ Map scraped jobs with user info
    const jobDocs = scrapedJobs.map((job) => ({
      ...job,
      userId,
      source: "Indeed",
      dateFetched: new Date(),
    }));

    // 5️⃣ Save new jobs
    await Job.insertMany(jobDocs);
    console.log(`✅ Saved ${jobDocs.length} new jobs for user: ${userId}`);

    return res.status(200).json({
      message: "Old jobs replaced with new scraped jobs successfully",
      total: jobDocs.length,
      jobs: jobDocs,
    });
  } catch (error) {
    console.error("❌ Error refreshing jobs:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// 🧩 Fetch jobs stored for the user
export const getJobs = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch jobs related to this user
    const jobs = await Job.find({ userId }).sort({ dateFetched: -1 });

    if (!jobs.length) {
      return res.status(404).json({ message: "No jobs found for this user" });
    }

    return res.status(200).json({
      message: "Jobs fetched successfully",
      total: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching user jobs:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
