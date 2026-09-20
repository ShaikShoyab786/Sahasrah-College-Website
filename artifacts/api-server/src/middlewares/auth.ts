import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getSessionCookieName, hashSessionToken } from "../lib/security";

export async function getAuthenticatedAdmin(req: Request) {
  const token = req.cookies?.[getSessionCookieName()];
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { admin: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session.admin;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      res.status(401).json({ error: "Authentication is required." });
      return;
    }
    res.locals.admin = admin;
    next();
  } catch (error) {
    req.log.error({ err: error }, "Unable to validate admin session");
    res.status(500).json({ error: "Unable to validate the admin session." });
  }
}