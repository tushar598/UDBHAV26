import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "./config/passportConfig.js";
import parseRoutes from "./routes/parserRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import leetcodeRoutes from "./routes/leetcodeRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import cronWorker from "./workers/cronWorker.js";

const app = express();

// ✅ 1. Enable CORS first
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ 2. Parse JSON
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. Initialize Passport
app.use(passport.initialize());

// ✅ 4. Log Requests
app.use((req, res, next) => {
  console.log("---- Incoming Request ----");
  console.log(`${req.method} ${req.path}`);
  next();
});

// ✅ 5. Routes
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/parser", parseRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/internship", internshipRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/chat", chatRoutes);

app.get("/__health", (req, res) => res.json({ ok: true }));

// ✅ 6. Cron Worker
cronWorker();

export default app;
