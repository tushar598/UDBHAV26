import User from "../models/user.js";
import Internship from "../models/internship.js";
import { scrapeInternships } from "../services/scraper/internshipScraper.js";

export async function fetchAndSaveInternships(req, res) {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const { desiredPost, desiredLocation } = user;
    if (!desiredPost?.length || !desiredLocation?.length) {
      return res
        .status(400)
        .json({ message: "User desired post or location missing" });
    }

    // 🗑️ Delete old internships
    const deleted = await Internship.deleteMany({ userId });
    console.log(
      `🗑️ Deleted ${deleted.deletedCount} old internships for user: ${userId}`
    );

    // 🧠 Scrape internships
    const internships = await scrapeInternships(desiredPost, desiredLocation);

    // 🌐 Normalize links & sanitize empty fields
    const internshipDocs = internships.map((i) => {
      let link = i.link || "";
      if (link.startsWith("/")) {
        link = `https://internshala.com${link}`;
      } else if (!link.startsWith("http")) {
        link = `https://internshala.com/internships`;
      }

      return {
        ...i,
        link, // ✅ fixed
        location: i.location || "Not specified",
        duration: i.duration || "Not specified",
        stipend: i.stipend || "Not specified",
        description: i.description || "Not available",
        userId,
        source: "Internshala",
        dateFetched: new Date(),
      };
    });

    // 💾 Save to DB
    await Internship.insertMany(internshipDocs);
    console.log(
      `✅ Saved ${internshipDocs.length} new internships for user: ${userId}`
    );

    return res.status(200).json({
      message: "Internships scraped successfully",
      internships: internshipDocs,
    });
  } catch (error) {
    console.error("❌ Error in fetchAndSaveInternships:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

/**
 * 📦 Get internships already stored for a user
 */
export async function getInternships(req, res) {
  try {
    const { userId } = req.params;

    // 1️⃣ Validate user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Fetch internships for that user
    const internships = await Internship.find({ userId }).sort({
      dateFetched: -1,
    });

    if (!internships.length) {
      return res
        .status(404)
        .json({ message: "No internships found for this user" });
    }

    // 3️⃣ Return internships
    res.status(200).json({
      message: "Internships fetched successfully",
      total: internships.length,
      internships,
    });
  } catch (error) {
    console.error("❌ Error fetching internships:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}
