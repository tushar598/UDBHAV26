import { request, response } from "express";
import Resume from "../models/resume.js";

export const uploadResume = async (req, res) => {
  try {
    // 🧩 Check if a file is uploaded
    if (!req.file) {
      console.log("⚠️ No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // 🔍 Check if a resume already exists for this user
    const existingResume = await Resume.findOne({ userId });

    if (existingResume) {
      console.log(`🗑️ Existing resume found for user ${userId}, deleting...`);
      await Resume.deleteOne({ userId });
      console.log("✅ Old resume deleted successfully");
    }

    // 🆕 Create and save new resume
    const newResume = new Resume({
      userId,
      fileName: originalname,
      fileType: mimetype,
      fileSize: size,
      fileData: buffer, // stored as Buffer (works great with multer)
    });

    await newResume.save();

    console.log("✅ Resume uploaded and saved successfully in DB");
    return res.status(201).json({
      message: existingResume
        ? "Resume replaced successfully"
        : "Resume uploaded successfully",
    });
  } catch (error) {
    console.error("❌ Error uploading resume:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getUserResume = async (req = request, res = response) => {
  try {
    const userId = req.params.userId;
    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // ✅ Common response headers
    res.set({
      "Content-Type": resume.fileType || "application/pdf",
      "Content-Disposition": `inline; filename="${
        resume.fileName || "resume.pdf"
      }"`,
    });

    // ✅ Handle both Base64 and raw Buffer cases safely
    if (typeof resume.fileData === "string") {
      // If Base64 string stored in DB → convert to binary buffer before sending
      const buffer = Buffer.from(resume.fileData, "base64");
      return res.status(200).send(buffer);
    } else if (resume.fileData instanceof Buffer) {
      // If already stored as binary (Buffer)
      return res.status(200).send(resume.fileData);
    } else {
      // Unexpected type fallback
      return res.status(500).json({ message: "Invalid resume data format" });
    }
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
