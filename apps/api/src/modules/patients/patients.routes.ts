import { Router } from "express";
import { z } from "zod";
import { PatientCreateSchema, PatientQuerySchema, PatientUpdateSchema } from "@ehr/shared";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  createPatient,
  deletePatient,
  exportPatientPdf,
  getPatient,
  getPatientOpdHistory,
  listPatients,
  updatePatient
} from "./patients.service.js";

const IdParamSchema = z.object({ id: z.string().uuid() });

export const patientsRouter = Router();

patientsRouter.use(authenticate);
patientsRouter.get("/", validate(PatientQuerySchema, "query"), asyncHandler(listPatients));
patientsRouter.post("/", requireRole("DOCTOR", "NURSE", "ADMIN"), validate(PatientCreateSchema), asyncHandler(createPatient));
patientsRouter.get("/:id", validate(IdParamSchema, "params"), asyncHandler(getPatient));
patientsRouter.put("/:id", requireRole("DOCTOR", "NURSE", "ADMIN"), validate(IdParamSchema, "params"), validate(PatientUpdateSchema), asyncHandler(updatePatient));
patientsRouter.delete("/:id", requireRole("DOCTOR", "ADMIN"), validate(IdParamSchema, "params"), asyncHandler(deletePatient));
patientsRouter.get("/:id/opd-history", validate(IdParamSchema, "params"), asyncHandler(getPatientOpdHistory));
patientsRouter.get("/:id/export/pdf", validate(IdParamSchema, "params"), asyncHandler(exportPatientPdf));
