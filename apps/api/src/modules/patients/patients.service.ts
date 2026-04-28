import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";
import { notFound } from "../../utils/errors.js";
import { recordAudit } from "../../utils/audit.js";
import { createPatientPdf } from "../../utils/pdf.js";

function paramId(req: Request) {
  return (req.params as { id: string }).id;
}

export async function listPatients(req: Request, res: Response) {
  const { page, limit, search, gender } = req.query as unknown as {
    page: number;
    limit: number;
    search?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
  };
  const { skip, take } = getPagination(page, limit);

  const where: Prisma.PatientWhereInput = {
    ...(gender ? { gender } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { contact: { contains: search, mode: "insensitive" } },
            { medicalHistory: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take
    }),
    prisma.patient.count({ where })
  ]);

  await recordAudit(req, "LIST", "Patient", null, { search, page, limit });
  res.json({ items, meta: paginationMeta(total, page, limit) });
}

export async function createPatient(req: Request, res: Response) {
  const patient = await prisma.patient.create({
    data: {
      ...req.body,
      createdById: req.user?.id
    }
  });

  await recordAudit(req, "CREATE", "Patient", patient.id, { name: patient.name });
  res.status(201).json(patient);
}

export async function getPatient(req: Request, res: Response) {
  const id = paramId(req);
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      opdVisits: {
        orderBy: { date: "desc" },
        take: 5
      },
      emergencyCases: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  });

  if (!patient) {
    throw notFound("Patient");
  }

  await recordAudit(req, "READ", "Patient", patient.id);
  res.json(patient);
}

export async function updatePatient(req: Request, res: Response) {
  const id = paramId(req);
  const patient = await prisma.patient.update({
    where: { id },
    data: req.body
  });

  await recordAudit(req, "UPDATE", "Patient", patient.id, { fields: Object.keys(req.body) });
  res.json(patient);
}

export async function deletePatient(req: Request, res: Response) {
  const id = paramId(req);
  await prisma.patient.delete({
    where: { id }
  });

  await recordAudit(req, "DELETE", "Patient", id);
  res.status(204).send();
}

export async function getPatientOpdHistory(req: Request, res: Response) {
  const id = paramId(req);
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, name: true }
  });

  if (!patient) {
    throw notFound("Patient");
  }

  const visits = await prisma.opdVisit.findMany({
    where: { patientId: id },
    orderBy: { date: "desc" },
    include: {
      clinician: {
        select: { id: true, name: true, role: true }
      }
    }
  });

  await recordAudit(req, "READ_OPD_HISTORY", "Patient", id);
  res.json({ patient, visits });
}

export async function exportPatientPdf(req: Request, res: Response) {
  const id = paramId(req);
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      opdVisits: {
        orderBy: { date: "desc" }
      }
    }
  });

  if (!patient) {
    throw notFound("Patient");
  }

  const pdf = await createPatientPdf(patient);
  await recordAudit(req, "EXPORT_PDF", "Patient", patient.id);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${patient.name.replace(/\s+/g, "-")}-summary.pdf"`);
  res.send(pdf);
}
