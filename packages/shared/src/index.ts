import { z } from "zod";

export const RoleSchema = z.enum(["DOCTOR", "NURSE", "ADMIN"]);
export const StaffSignupRoleSchema = z.enum(["DOCTOR", "NURSE"]);
export const GenderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);
export const TriageSchema = z.enum(["LOW", "MEDIUM", "CRITICAL"]);
export const EmergencyStatusSchema = z.enum([
  "WAITING",
  "IN_TRIAGE",
  "IN_TREATMENT",
  "OBSERVATION",
  "DISCHARGED"
]);

export const EmailPasswordSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const SignupSchema = EmailPasswordSchema.extend({
  name: z.string().trim().min(2),
  role: StaffSignupRoleSchema.default("NURSE")
});

export const GoogleAuthSchema = z.object({
  idToken: z.string().min(10),
  role: StaffSignupRoleSchema.default("NURSE")
});

export const PatientCreateSchema = z.object({
  name: z.string().trim().min(2),
  age: z.coerce.number().int().min(0).max(130),
  gender: GenderSchema,
  contact: z.string().trim().min(4).max(40),
  address: z.string().trim().max(500).default(""),
  medicalHistory: z.string().trim().max(4000).default("")
});

export const PatientUpdateSchema = PatientCreateSchema.partial();

export const PatientQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional(),
  gender: GenderSchema.optional()
});

export const OpdVisitCreateSchema = z.object({
  patientId: z.string().uuid(),
  date: z.coerce.date(),
  symptoms: z.string().trim().min(2).max(2000),
  diagnosis: z.string().trim().min(2).max(2000),
  prescription: z.string().trim().min(2).max(3000),
  followUpAt: z.coerce.date().optional().nullable()
});

export const OpdVisitUpdateSchema = OpdVisitCreateSchema.partial().omit({ patientId: true });

export const OpdQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  patientId: z.string().uuid().optional()
});

export const EmergencyCreateSchema = z.object({
  patientId: z.string().uuid().optional(),
  patientName: z.string().trim().min(2),
  age: z.coerce.number().int().min(0).max(130).optional().nullable(),
  gender: GenderSchema.optional().nullable(),
  contact: z.string().trim().max(40).optional().nullable(),
  chiefComplaint: z.string().trim().max(1200).optional().nullable(),
  triage: TriageSchema.default("MEDIUM")
});

export const EmergencyUpdateSchema = EmergencyCreateSchema.partial();

export const EmergencyStatusUpdateSchema = z.object({
  status: EmergencyStatusSchema,
  triage: TriageSchema.optional()
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export type Role = z.infer<typeof RoleSchema>;
export type StaffSignupRole = z.infer<typeof StaffSignupRoleSchema>;
export type Gender = z.infer<typeof GenderSchema>;
export type Triage = z.infer<typeof TriageSchema>;
export type EmergencyStatus = z.infer<typeof EmergencyStatusSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof EmailPasswordSchema>;
export type GoogleAuthInput = z.infer<typeof GoogleAuthSchema>;
export type PatientCreateInput = z.infer<typeof PatientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;
export type PatientQueryInput = z.infer<typeof PatientQuerySchema>;
export type OpdVisitCreateInput = z.infer<typeof OpdVisitCreateSchema>;
export type OpdVisitUpdateInput = z.infer<typeof OpdVisitUpdateSchema>;
export type EmergencyCreateInput = z.infer<typeof EmergencyCreateSchema>;
export type EmergencyUpdateInput = z.infer<typeof EmergencyUpdateSchema>;
export type EmergencyStatusUpdateInput = z.infer<typeof EmergencyStatusUpdateSchema>;
