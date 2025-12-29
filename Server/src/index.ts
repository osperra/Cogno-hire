import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRouter from "./routes/auth.js";
import { jobsRouter } from "./routes/jobs.js";
import { applicationsRouter } from "./routes/applications.js";
import notificationsRouter from "./routes/notification.js";
import meRoutes from "./routes/me";


dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(meRoutes);


app.get("/", (_req, res) => res.json({ ok: true, name: "CognoHire API" }));

app.use("/api/auth", authRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/notifications", notificationsRouter);
import { sidebarRouter } from "./routes/sidebar.js";
app.use("/api/sidebar", sidebarRouter);


const port = Number(process.env.PORT || 5000);

connectDB(process.env.MONGODB_URI!)
  .then(() => {
    app.listen(port, () => console.log(`✅ API running on http://localhost:${port}`));
  })
  .catch((e) => {
    console.error("❌ DB connection failed", e);
    process.exit(1);
  });
