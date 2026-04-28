import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Role as PrismaRole } from "@prisma/client";
import { getFirebaseApp } from "../../config/firebase.js";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/errors.js";
import { signToken } from "../../utils/jwt.js";
import { recordAudit } from "../../utils/audit.js";

function authResponse(user: { id: string; email: string; name: string; role: PrismaRole }) {
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
}

export async function signup(req: Request, res: Response) {
  const { email, password, name, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      role,
      passwordHash
    },
    select: { id: true, email: true, name: true, role: true }
  });

  await recordAudit(req, "SIGNUP", "User", user.id, { email: user.email, role: user.role });
  res.status(201).json(authResponse(user));
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user?.passwordHash) {
    throw new AppError(401, "Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, "Invalid email or password");
  }

  await recordAudit(req, "LOGIN", "User", user.id);
  res.json(authResponse(user));
}

export async function googleLogin(req: Request, res: Response) {
  const firebaseApp = getFirebaseApp();

  if (!firebaseApp) {
    throw new AppError(503, "Google OAuth is not configured on the API");
  }

  const { idToken, role } = req.body;
  const decoded = await firebaseApp.auth().verifyIdToken(idToken);

  if (!decoded.email) {
    throw new AppError(400, "Google account does not expose an email address");
  }

  const user = await prisma.user.upsert({
    where: { email: decoded.email.toLowerCase() },
    update: {
      name: decoded.name ?? decoded.email,
      googleUid: decoded.uid
    },
    create: {
      email: decoded.email.toLowerCase(),
      name: decoded.name ?? decoded.email,
      googleUid: decoded.uid,
      role
    },
    select: { id: true, email: true, name: true, role: true }
  });

  await recordAudit(req, "GOOGLE_LOGIN", "User", user.id);
  res.json(authResponse(user));
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}
