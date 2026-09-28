import { Prisma } from "@prisma/client";
import { Router, type IRouter } from "express";
import {
  GetAdminCoursesMegaMenuResponse,
  GetCoursesMegaMenuResponse,
  UpdateCoursesMegaMenuBody,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

function isSafeActionUrl(value: string) {
  if (/^#[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(value)) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.split("/").includes("..")) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isSafeImageUrl(value: string | null) {
  if (value === null) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.split("/").includes("..")) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  } catch {
    return false;
  }
}

function hasUniqueOrderAndIds(items: Array<{ id: string; displayOrder: number }>) {
  const ids = new Set<string>();
  const orders = new Set<number>();
  for (const item of items) {
    if (ids.has(item.id) || orders.has(item.displayOrder)) return false;
    ids.add(item.id);
    orders.add(item.displayOrder);
  }
  return true;
}

function isValidMegaMenuContent(content: {
  sidebarLogoUrl: string | null;
  sidebarLogoAltText: string;
  sidebarImageUrl: string | null;
  sidebarImageAltText: string;
  standardCards: Array<{ id: string; displayOrder: number; imageUrl: string | null; imageAltText: string; href: string }>;
  integratedCard: { imageUrl: string | null; imageAltText: string };
  footerBenefits: Array<{ id: string; displayOrder: number }>;
  utilityLinks: Array<{ id: string; displayOrder: number; href: string }>;
  ctaButtons: Array<{ id: string; displayOrder: number; href: string }>;
}) {
  const images = [
    content.sidebarLogoUrl,
    content.sidebarImageUrl,
    ...content.standardCards.map((card) => card.imageUrl),
    content.integratedCard.imageUrl,
  ];
  const imageAltTexts: Array<[string | null, string]> = [
    [content.sidebarLogoUrl, content.sidebarLogoAltText],
    [content.sidebarImageUrl, content.sidebarImageAltText],
    ...content.standardCards.map((card) => [card.imageUrl, card.imageAltText] as [string | null, string]),
    [content.integratedCard.imageUrl, content.integratedCard.imageAltText],
  ];
  const links = [
    ...content.standardCards.map((card) => card.href),
    ...content.utilityLinks.map((link) => link.href),
    ...content.ctaButtons.map((button) => button.href),
  ];

  return images.every(isSafeImageUrl)
    && imageAltTexts.every(([url, altText]) => url === null || altText.trim().length > 0)
    && links.every(isSafeActionUrl)
    && hasUniqueOrderAndIds(content.standardCards)
    && hasUniqueOrderAndIds(content.footerBenefits)
    && hasUniqueOrderAndIds(content.utilityLinks)
    && hasUniqueOrderAndIds(content.ctaButtons);
}

router.get("/courses-mega-menu", async (_req, res): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  const settings = await prisma.coursesMegaMenuSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    res.status(503).json({ error: "Courses mega menu content is not available." });
    return;
  }
  res.json(GetCoursesMegaMenuResponse.parse(settings.content));
});

router.get("/admin/courses-mega-menu", requireAdmin, async (_req, res): Promise<void> => {
  const settings = await prisma.coursesMegaMenuSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    res.status(503).json({ error: "Courses mega menu content is not available." });
    return;
  }
  res.json(GetAdminCoursesMegaMenuResponse.parse(settings.content));
});

router.put("/admin/courses-mega-menu", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateCoursesMegaMenuBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!isValidMegaMenuContent(parsed.data)) {
    res.status(400).json({ error: "Check menu destinations, image text, and item order before saving." });
    return;
  }

  const content = parsed.data as Prisma.InputJsonValue;
  const settings = await prisma.coursesMegaMenuSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", content },
    update: { content },
  });
  res.json(GetCoursesMegaMenuResponse.parse(settings.content));
});

export default router;