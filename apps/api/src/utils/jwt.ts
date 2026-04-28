import jwt from "jsonwebtoken";
import type { Role } from "@ehr/shared";
import { env } from "../config/env.js";

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
