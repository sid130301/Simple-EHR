import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { notFound } from "../../utils/errors.js";
import { recordAudit } from "../../utils/audit.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";

const visitInclude = {
  patient: {
    select: { id: true, name: true, age: true, gender: true, contact: true }
  },
  clinician: {
    select: { id: true, name: true, role: true }
  }
};

function paramId(req: Request) {
  return (req.params as { id: string }).id;
}

export async function listVisits(req: Request, res: Response) {
  const { page, limit, patientId } = req.query as unknown as {
    page: number;
    limit: number;
    patientId?: string;
  };
  const { skip, take } = getPagination(page, limit);
  const where = patientId ? { patientId } : {};

  const [items, total] = await Promise.all([
    prisma.opdVisit.findMany({
      where,
      orderBy: { date: "desc" },
      include: visitInclude,
      skip,
      take
    }),
    prisma.opdVisit.count({ where })
  ]);

  res.json({ items, meta: paginationMeta(total, page, limit) });
}

export async function createVisit(req: Request, res: Response) {
  const visit = await prisma.opdVisit.create({
    data: {
      ...req.body,
      clinicianId: req.user?.id
    },
    include: visitInclude
  });

  await recordAudit(req, "CREATE", "OpdVisit", visit.id, { patientId: visit.patientId });
  res.status(201).json(visit);
}

export async function getVisit(req: Request, res: Response) {
  const id = paramId(req);
  const visit = await prisma.opdVisit.findUnique({
    where: { id },
    include: visitInclude
  });

  if (!visit) {
    throw notFound("OPD visit");
  }

  await recordAudit(req, "READ", "OpdVisit", visit.id, { patientId: visit.patientId });
  res.json(visit);
}

export async function updateVisit(req: Request, res: Response) {
  const id = paramId(req);
  const visit = await prisma.opdVisit.update({
    where: { id },
    data: req.body,
    include: visitInclude
  });

  await recordAudit(req, "UPDATE", "OpdVisit", visit.id, { fields: Object.keys(req.body) });
  res.json(visit);
}

export async function deleteVisit(req: Request, res: Response) {
  const id = paramId(req);
  await prisma.opdVisit.delete({ where: { id } });
  await recordAudit(req, "DELETE", "OpdVisit", id);
  res.status(204).send();
}
