/**
 * Seed script to create a default company account.
 *
 * Run with: node src/scripts/seedCompany.js
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Company from "../models/company.js";

dotenv.config();

const seedCompany = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const email = "company@careerconnect.com";

        // Check if already seeded
        const existing = await Company.findOne({ email });
        if (existing) {
            console.log("⚠️ Company account already exists. Skipping seed.");
            await mongoose.disconnect();
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("Company@123", 10);

        const company = await Company.create({
            companyName: "TechHire Solutions",
            email,
            password: hashedPassword,
            industry: "Information Technology",
            website: "https://techhire.example.com",
            description:
                "A leading tech recruitment company connecting talented developers with top companies worldwide.",
            location: "Bangalore, India",
            logo: "",
        });

        console.log("✅ Company account created successfully!");
        console.log(`   Email: ${email}`);
        console.log(`   Password: Company@123`);
        console.log(`   Company ID: ${company._id}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seedCompany();
