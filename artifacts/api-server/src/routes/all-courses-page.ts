import { Prisma } from "@prisma/client";
import { Router, type IRouter } from "express";
import {
  GetAdminAllCoursesPageResponse,
  GetAllCoursesPageResponse,
  UpdateAllCoursesPageBody,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

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

function hasUniqueIdsAndOrders(items: Array<{ id: string; displayOrder: number }>) {
  return new Set(items.map((item) => item.id)).size === items.length
    && new Set(items.map((item) => item.displayOrder)).size === items.length;
}

function hasUniqueIds(items: Array<{ id: string }>) {
  return new Set(items.map((item) => item.id)).size === items.length;
}

router.get("/all-courses-page", async (_req, res): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  const settings = await prisma.allCoursesPageSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    res.status(503).json({ error: "All Courses page content is not available." });
    return;
  }
  res.json(GetAllCoursesPageResponse.parse(settings.content));
});

router.get("/admin/all-courses-page", requireAdmin, async (_req, res): Promise<void> => {
  const settings = await prisma.allCoursesPageSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    res.status(503).json({ error: "All Courses page content is not available." });
    return;
  }
  res.json(GetAdminAllCoursesPageResponse.parse(settings.content));
});

router.put("/admin/all-courses-page", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAllCoursesPageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const content = parsed.data;
  const courses = await prisma.course.findMany({ select: { slug: true } });
  const currentSlugs = new Set(courses.map((course) => course.slug));
  const placements = content.coursePlacements;
  const visibleSlugs = new Set(placements.filter((item) => item.isVisible).map((item) => item.courseSlug));
  const placementSlugs = new Set<string>(placements.map((item) => item.courseSlug));
  const hasAllCurrentCourses = placements.length === courses.length
    && [...currentSlugs].every((slug) => placementSlugs.has(slug));
  const valid = isSafeImageUrl(content.heroBackgroundImageUrl)
    && hasAllCurrentCourses
    && placementSlugs.size === placements.length
    && new Set(placements.map((item) => item.displayOrder)).size === placements.length
    && visibleSlugs.size > 0
    && visibleSlugs.has(content.featuredCourseSlug)
    && hasUniqueIdsAndOrders(content.batches)
    && hasUniqueIdsAndOrders(content.schedule)
    && hasUniqueIds(content.heroFeatures)
    && hasUniqueIds(content.ctaBenefits);
  if (!valid) {
    res.status(400).json({ error: "Check the course selection, feature items, and page content before saving." });
    return;
  }

  const jsonContent = content as Prisma.InputJsonValue;
  const settings = await prisma.allCoursesPageSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", content: jsonContent },
    update: { content: jsonContent },
  });
  res.json(GetAllCoursesPageResponse.parse(settings.content));
});

export default router;