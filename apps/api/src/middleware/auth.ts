import type { NextFunction, Request, Response } from "express";
import type { Role } from "@ehr/shared";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/errors.js";
import { verifyToken } from "../utils/jwt.js";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.get("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new AppError(401, "Authentication token is required");
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      throw new AppError(401, "User is no longer active");
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role
    };

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, "Invalid or expired token"));
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, "You do not have permission to perform this action"));
    }

    return next();
  };
}
