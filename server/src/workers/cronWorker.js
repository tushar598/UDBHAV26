import cron from "node-cron";
import User from "../models/user.js";
import Internship from "../models/internship.js";
import { scrapeInternships } from "../services/scraper/internshipScrapper.js";

// Run every 24 hours — Internshala only
const cronWorker = () => {
    cron.schedule("0 0 * * *", async () => {
        const users = await User.find({ role: { $ne: "company" } });
        for (const user of users) {
            if (user.skills?.length && user.location) {
                try {
                    const internships = await scrapeInternships(
                        user.desiredPost?.length ? user.desiredPost : user.skills,
                        user.desiredLocation?.length
                            ? user.desiredLocation
                            : [user.location]
                    );
                    await Internship.insertMany(
                        internships.map((i) => ({
                            ...i,
                            userId: user._id,
                            dateFetched: new Date(),
                        }))
                    );
                    console.log(
                        `✅ Scraped ${internships.length} internships for user: ${user._id}`
                    );
                } catch (err) {
                    console.error(
                        `❌ Cron scraping failed for user ${user._id}:`,
                        err.message
                    );
                }
            }
        }
        console.log("✅ Daily Internshala scraping completed");
    });
};

export default cronWorker;
