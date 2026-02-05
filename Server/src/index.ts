import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";

import authRouter from "./routes/auth.js";
import { jobsRouter } from "./routes/jobs.js";
import { applicationsRouter } from "./routes/applications.js";
import notificationsRouter from "./routes/notification.js";
import meRoutes from "./routes/me.js";
import candidateDashboardRoutes from "./routes/candidateDashboard.js";
import { sidebarRouter } from "./routes/sidebar.js";
import { companyProfileRouter } from "./routes/companyProfile.js";
import documentsRouter from "./routes/documents.js";
import { pipelineRouter } from "./routes/pipeline.js";
import { candidatesRouter } from "./routes/candidates.js";
import { reviewsRouter } from "./routes/reviews.js";
import { onboardingRouter } from "./routes/onboarding.js";
import { aiJobDescriptionRouter } from "./routes/aiJobDescriptionRouter.js";

dotenv.config();


const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/documents", documentsRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(meRoutes);
app.use(candidateDashboardRoutes);

app.get("/health", (_: Request, res: Response) => res.json({ ok: true }));
app.get("/", (_req: Request, res: Response) =>
  res.json({ ok: true, name: "CognoHire API" })
);

app.use("/api/auth", authRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/sidebar", sidebarRouter);
app.use("/api/pipeline", pipelineRouter);
app.use("/api/candidates", candidatesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/company-profile", companyProfileRouter);
app.use("/api/onboarding", onboardingRouter);
app.use("/api/ai", aiJobDescriptionRouter);

const port = Number(process.env.PORT || 5000);

connectDB(process.env.MONGODB_URI!)
  .then(() => {
    app.listen(port, () =>
      console.log(`✅ API running on http://localhost:${port}`)
    );
  })
  .catch((e) => {
    console.error("❌ DB connection failed", e);
    process.exit(1);
  });
