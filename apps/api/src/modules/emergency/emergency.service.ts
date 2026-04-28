import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { recordAudit } from "../../utils/audit.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";

const emergencyInclude = {
  patient: {
    select: { id: true, name: true, contact: true }
  },
  createdBy: {
    select: { id: true, name: true, role: true }
  }
};

function paramId(req: Request) {
  return (req.params as { id: string }).id;
}

export async function listEmergencyCases(req: Request, res: Response) {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const { skip, take } = getPagination(page, limit);

  const [items, total] = await Promise.all([
    prisma.emergencyCase.findMany({
      orderBy: [{ triage: "desc" }, { updatedAt: "desc" }],
      include: emergencyInclude,
      skip,
      take
    }),
    prisma.emergencyCase.count()
  ]);

  res.json({ items, meta: paginationMeta(total, page, limit) });
}

export async function createEmergencyCase(req: Request, res: Response) {
  const { patientId, patientName, age, gender, contact, chiefComplaint, triage } = req.body;

  const patient =
    patientId ||
    (
      await prisma.patient.create({
        data: {
          name: patientName,
          age: age ?? 0,
          gender: gender ?? "OTHER",
          contact: contact ?? "Emergency intake pending",
          address: "",
          medicalHistory: chiefComplaint ?? "",
          createdById: req.user?.id
        }
      })
    ).id;

  const emergencyCase = await prisma.emergencyCase.create({
    data: {
      patientId: patient,
      patientName,
      age,
      gender,
      contact,
      chiefComplaint,
      triage,
      createdById: req.user?.id
    },
    include: emergencyInclude
  });

  await recordAudit(req, "CREATE", "EmergencyCase", emergencyCase.id, { triage });
  res.status(201).json(emergencyCase);
}

export async function updateEmergencyCase(req: Request, res: Response) {
  const id = paramId(req);
  const emergencyCase = await prisma.emergencyCase.update({
    where: { id },
    data: req.body,
    include: emergencyInclude
  });

  await recordAudit(req, "UPDATE", "EmergencyCase", emergencyCase.id, { fields: Object.keys(req.body) });
  res.json(emergencyCase);
}

export async function updateEmergencyStatus(req: Request, res: Response) {
  const id = paramId(req);
  const emergencyCase = await prisma.emergencyCase.update({
    where: { id },
    data: req.body,
    include: emergencyInclude
  });

  await recordAudit(req, "STATUS_UPDATE", "EmergencyCase", emergencyCase.id, {
    status: emergencyCase.status,
    triage: emergencyCase.triage
  });
  res.json(emergencyCase);
}

export async function deleteEmergencyCase(req: Request, res: Response) {
  const id = paramId(req);
  await prisma.emergencyCase.delete({ where: { id } });
  await recordAudit(req, "DELETE", "EmergencyCase", id);
  res.status(204).send();
}
