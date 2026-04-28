import { Router } from "express";
import { z } from "zod";
import {
  EmergencyCreateSchema,
  EmergencyStatusUpdateSchema,
  EmergencyUpdateSchema,
  PaginationQuerySchema
} from "@ehr/shared";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  createEmergencyCase,
  deleteEmergencyCase,
  listEmergencyCases,
  updateEmergencyCase,
  updateEmergencyStatus
} from "./emergency.service.js";

const IdParamSchema = z.object({ id: z.string().uuid() });

export const emergencyRouter = Router();

emergencyRouter.use(authenticate);
emergencyRouter.get("/", validate(PaginationQuerySchema, "query"), asyncHandler(listEmergencyCases));
emergencyRouter.post("/", requireRole("DOCTOR", "NURSE", "ADMIN"), validate(EmergencyCreateSchema), asyncHandler(createEmergencyCase));
emergencyRouter.put("/:id", requireRole("DOCTOR", "NURSE", "ADMIN"), validate(IdParamSchema, "params"), validate(EmergencyUpdateSchema), asyncHandler(updateEmergencyCase));
emergencyRouter.patch("/:id/status", requireRole("DOCTOR", "NURSE", "ADMIN"), validate(IdParamSchema, "params"), validate(EmergencyStatusUpdateSchema), asyncHandler(updateEmergencyStatus));
emergencyRouter.delete("/:id", requireRole("ADMIN"), validate(IdParamSchema, "params"), asyncHandler(deleteEmergencyCase));
