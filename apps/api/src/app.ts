import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { sanitizeRequest } from "./middleware/sanitize.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { patientsRouter } from "./modules/patients/patients.routes.js";
import { opdRouter } from "./modules/opd/opd.routes.js";
import { emergencyRouter } from "./modules/emergency/emergency.routes.js";
import { auditRouter } from "./modules/audit/audit.routes.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeRequest);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "healthnest-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/opd", opdRouter);
app.use("/api/emergency", emergencyRouter);
app.use("/api/audit", auditRouter);

app.use(notFoundHandler);
app.use(errorHandler);
