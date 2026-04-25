import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    logo: { type: String, default: "" },
    industry: { type: String, default: "" },
    website: { type: String, default: "" },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    role: { type: String, default: "company", immutable: true },
    createdAt: { type: Date, default: Date.now },
});

const Company = mongoose.model("Company", companySchema);

export default Company;
