import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import parseRoutes from "./routes/parserRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import cronWorker from "./workers/cronWorker.js";

const app = express();

// ✅ 1. Enable CORS first
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ 2. Parse JSON
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. Log Requests
app.use((req, res, next) => {
  console.log("---- Incoming Request ----");
  console.log(`${req.method} ${req.path}`);
  next();
});

// ✅ 4. Routes
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/parser", parseRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/internship", internshipRoutes);

app.get("/__health", (req, res) => res.json({ ok: true }));

// ✅ 5. Cron Worker
cronWorker();

export default app;
