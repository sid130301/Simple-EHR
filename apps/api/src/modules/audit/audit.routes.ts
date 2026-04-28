import { Router } from "express";
import { PaginationQuerySchema } from "@ehr/shared";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { listAuditLogs } from "./audit.service.js";

export const auditRouter = Router();

auditRouter.get("/", authenticate, requireRole("ADMIN"), validate(PaginationQuerySchema, "query"), asyncHandler(listAuditLogs));
