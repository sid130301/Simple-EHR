import { Router } from "express";
import { z } from "zod";
import { OpdQuerySchema, OpdVisitCreateSchema, OpdVisitUpdateSchema } from "@ehr/shared";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { createVisit, deleteVisit, getVisit, listVisits, updateVisit } from "./opd.service.js";

const IdParamSchema = z.object({ id: z.string().uuid() });

export const opdRouter = Router();

opdRouter.use(authenticate);
opdRouter.get("/", validate(OpdQuerySchema, "query"), asyncHandler(listVisits));
opdRouter.post("/", requireRole("DOCTOR", "NURSE", "ADMIN"), validate(OpdVisitCreateSchema), asyncHandler(createVisit));
opdRouter.get("/:id", validate(IdParamSchema, "params"), asyncHandler(getVisit));
opdRouter.put("/:id", requireRole("DOCTOR", "NURSE", "ADMIN"), validate(IdParamSchema, "params"), validate(OpdVisitUpdateSchema), asyncHandler(updateVisit));
opdRouter.delete("/:id", requireRole("DOCTOR", "ADMIN"), validate(IdParamSchema, "params"), asyncHandler(deleteVisit));
