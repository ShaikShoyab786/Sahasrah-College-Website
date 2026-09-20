import { Router, type IRouter } from "express";
import { LoginAdminBody } from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionTtl,
  hashSessionToken,
  verifyPassword,
} from "../lib/security";
import { getAuthenticatedAdmin, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res) => {
  const parsed = LoginAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid email and password." });
    return;
  }

  try {
    const email = parsed.data.email.trim().toLowerCase();
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await verifyPassword(parsed.data.password, admin.passwordHash))) {
      res.status(401).json({ error: "The email or password is incorrect." });
      return;
    }

    const rawToken = createSessionToken();
    await prisma.adminSession.create({
      data: {
        tokenHash: hashSessionToken(rawToken),
        adminId: admin.id,
        expiresAt: new Date(Date.now() + getSessionTtl()),
      },
    });

    res.cookie(getSessionCookieName(), rawToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: getSessionTtl(),
      path: "/",
    });
    res.json({
      authenticated: true,
      email: admin.email,
      displayName: admin.displayName,
    });
  } catch (error) {
    req.log.error({ err: error }, "Admin login failed");
    res.status(503).json({ error: "Admin authentication is not configured yet." });
  }
});

router.post("/auth/logout", async (req, res) => {
  const token = req.cookies?.[getSessionCookieName()];
  if (token) {
    await prisma.adminSession
      .deleteMany({ where: { tokenHash: hashSessionToken(token) } })
      .catch(() => undefined);
  }
  res.clearCookie(getSessionCookieName(), { path: "/" });
  res.json({ message: "You have been signed out." });
});

router.get("/auth/me", requireAdmin, async (req, res) => {
  const admin = await getAuthenticatedAdmin(req);
  if (!admin) {
    res.status(401).json({ error: "Authentication is required." });
    return;
  }
  res.json({
    authenticated: true,
    email: admin.email,
    displayName: admin.displayName,
  });
});

export default router;