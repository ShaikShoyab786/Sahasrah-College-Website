import { Prisma } from "@prisma/client";
import { Router, type IRouter } from "express";
import {
  GetAdminKnowledgeHubMegaMenuResponse,
  GetKnowledgeHubMegaMenuResponse,
  UpdateKnowledgeHubMegaMenuBody,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();
const categories = new Set(["articles", "video-hub", "study-resources", "exam-updates"]);

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

function isSafeTrendingUrl(value: string | null) {
  if (value === null) return true;
  if (value.startsWith("/knowledge-hub") && !value.startsWith("//") && !value.split("/").includes("..")) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  } catch {
    return false;
  }
}

function hasUniqueIdsAndOrders(items: Array<{ id: string; displayOrder: number }>) {
  return new Set(items.map((item) => item.id)).size === items.length
    && new Set(items.map((item) => item.displayOrder)).size === items.length;
}

function isValidContent(content: {
  cards: Array<{ id: string; category: string; displayOrder: number; isVisible: boolean }>;
  panel: { imageUrl: string | null; imageAltText: string };
  trendingItems: Array<{ id: string; displayOrder: number; href: string | null }>;
}) {
  const cardCategories = new Set(content.cards.map((card) => card.category));
  const hasEveryCategory = cardCategories.size === categories.size
    && [...categories].every((category) => cardCategories.has(category));

  return hasEveryCategory
    && hasUniqueIdsAndOrders(content.cards)
    && content.cards.every((card) => categories.has(card.category))
    && isSafeImageUrl(content.panel.imageUrl)
    && (content.panel.imageUrl === null || content.panel.imageAltText.trim().length > 0)
    && hasUniqueIdsAndOrders(content.trendingItems)
    && content.trendingItems.every((item) => isSafeTrendingUrl(item.href));
}

router.get("/knowledge-hub-mega-menu", async (_req, res): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  const settings = await prisma.knowledgeHubMegaMenuSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    res.status(503).json({ error: "Knowledge Hub mega menu content is not available." });
    return;
  }
  res.json(GetKnowledgeHubMegaMenuResponse.parse(settings.content));
});

router.get("/admin/knowledge-hub-mega-menu", requireAdmin, async (_req, res): Promise<void> => {
  const settings = await prisma.knowledgeHubMegaMenuSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    res.status(503).json({ error: "Knowledge Hub mega menu content is not available." });
    return;
  }
  res.json(GetAdminKnowledgeHubMegaMenuResponse.parse(settings.content));
});

router.put("/admin/knowledge-hub-mega-menu", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateKnowledgeHubMegaMenuBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!isValidContent(parsed.data)) {
    res.status(400).json({ error: "Check the four categories, image text, trending links, and item order before saving." });
    return;
  }

  const content = parsed.data as Prisma.InputJsonValue;
  const settings = await prisma.knowledgeHubMegaMenuSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", content },
    update: { content },
  });
  res.json(GetKnowledgeHubMegaMenuResponse.parse(settings.content));
});

export default router;