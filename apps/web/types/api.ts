import type { EmergencyStatus, Gender, Role, Triage } from "@ehr/shared";

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  contact: string;
  address: string;
  medicalHistory: string;
  createdAt: string;
  updatedAt: string;
};

export type OpdVisit = {
  id: string;
  patientId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  followUpAt?: string | null;
  patient?: Pick<Patient, "id" | "name" | "age" | "gender" | "contact">;
  clinician?: Pick<ApiUser, "id" | "name" | "role"> | null;
};

export type EmergencyCase = {
  id: string;
  patientId?: string | null;
  patientName: string;
  age?: number | null;
  gender?: Gender | null;
  contact?: string | null;
  chiefComplaint?: string | null;
  triage: Triage;
  status: EmergencyStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: Pick<ApiUser, "id" | "name" | "role"> | null;
};

export type PageMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PageResult<T> = {
  items: T[];
  meta: PageMeta;
};

export type DashboardStats = {
  totalPatients: number;
  activeCases: number;
  emergencyCases: number;
  criticalEmergencyCases: number;
  todaysOpdVisits: number;
  pendingFollowUps: number;
};
