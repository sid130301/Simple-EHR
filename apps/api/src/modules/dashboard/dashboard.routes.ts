import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getStats } from "./dashboard.service.js";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", authenticate, asyncHandler(getStats));
