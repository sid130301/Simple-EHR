import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";

export async function listAuditLogs(req: Request, res: Response) {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const { skip, take } = getPagination(page, limit);

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    }),
    prisma.auditLog.count()
  ]);

  res.json({ items, meta: paginationMeta(total, page, limit) });
}
