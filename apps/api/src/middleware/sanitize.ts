import type { NextFunction, Request, Response } from "express";
import xss from "xss";

function clean(value: unknown): unknown {
  if (typeof value === "string") {
    return xss(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map(clean);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clean(nested)]));
  }

  return value;
}

export function sanitizeRequest(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    req.body = clean(req.body);
  }

  if (req.query) {
    req.query = clean(req.query) as typeof req.query;
  }

  next();
}
