import "dotenv/config";
import connectDB from "./src/config/db.js";
import Company from "./src/models/company.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    await connectDB();
    const hashedPassword = await bcrypt.hash("Company@123", 10);
    
    // Check if exists
    await Company.deleteMany({ email: "company@careerconnect.com" });
    
    await Company.create({
      companyName: "CareerConnect",
      email: "company@careerconnect.com",
      password: hashedPassword,
      industry: "Technology",
      location: "San Francisco, CA"
    });
    console.log("✅ Company seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding company:", err);
    process.exit(1);
  }
};

seed();
