import type { Request } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function recordAudit(
  req: Request,
  action: string,
  entity: string,
  entityId?: string | null,
  metadata?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      actorId: req.user?.id,
      action,
      entity,
      entityId: entityId ?? null,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      metadata: metadata as Prisma.InputJsonValue
    }
  });
}
