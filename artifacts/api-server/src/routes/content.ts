import { Router, type IRouter } from "express";
import {
  GetAdminHomepageAboutPreviewResponse,
  GetHomepageAboutPreviewResponse,
  UpdateHomepageHeroBody,
  UpdateHomepageAboutPreviewBody,
  UpdateHomepageAboutPreviewResponse,
  UpdateSiteSettingsBody,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/site-settings", async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!settings) {
      res.status(404).json({ error: "Site settings are not available." });
      return;
    }
    res.json(settings);
  } catch (error) {
    req.log.error({ err: error }, "Unable to read site settings");
    res.status(500).json({ error: "Unable to load site settings." });
  }
});

router.get("/homepage-hero", async (req, res) => {
  try {
    const slides = await prisma.homepageHero.findMany({
      orderBy: { displayOrder: "asc" },
      take: 3,
    });
    if (slides.length !== 3) {
      res.status(404).json({ error: "Homepage hero is not available." });
      return;
    }
    res.json(slides);
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage hero");
    res.status(500).json({ error: "Unable to load homepage hero." });
  }
});

router.get("/homepage-about-preview", async (req, res) => {
  try {
    const aboutPreview = await prisma.homepageAboutPreview.findUnique({ where: { id: "singleton" } });
    if (!aboutPreview || !aboutPreview.isVisible) {
      res.status(404).json({ error: "Homepage About Preview is not available." });
      return;
    }
    res.json(GetHomepageAboutPreviewResponse.parse(aboutPreview));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage About Preview");
    res.status(500).json({ error: "Unable to load homepage About Preview." });
  }
});

router.put("/admin/site-settings", requireAdmin, async (req, res) => {
  const parsed = UpdateSiteSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the site settings and try again." });
    return;
  }
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });
    res.json(settings);
  } catch (error) {
    req.log.error({ err: error }, "Unable to update site settings");
    res.status(500).json({ error: "Unable to save site settings." });
  }
});

router.put("/admin/homepage-hero", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageHeroBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the homepage hero content and try again." });
    return;
  }
  const displayOrders = parsed.data.map((slide) => slide.displayOrder);
  if (
    parsed.data.length !== 3 ||
    new Set(displayOrders).size !== 3 ||
    ![1, 2, 3].every((order) => displayOrders.includes(order))
  ) {
    res.status(400).json({ error: "Exactly three hero slides are required." });
    return;
  }
  try {
    const slides = await prisma.$transaction(
      parsed.data.map((slide) =>
        prisma.homepageHero.upsert({
          where: { displayOrder: slide.displayOrder },
          update: slide,
          create: { ...slide, isPublished: true },
        }),
      ),
    );
    res.json(slides.sort((a, b) => a.displayOrder - b.displayOrder));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage hero");
    res.status(500).json({ error: "Unable to save homepage hero." });
  }
});

router.get("/admin/homepage-about-preview", requireAdmin, async (req, res) => {
  try {
    const aboutPreview = await prisma.homepageAboutPreview.findUnique({ where: { id: "singleton" } });
    if (!aboutPreview) {
      res.status(404).json({ error: "Homepage About Preview is not available." });
      return;
    }
    res.json(GetAdminHomepageAboutPreviewResponse.parse(aboutPreview));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage About Preview");
    res.status(500).json({ error: "Unable to load homepage About Preview." });
  }
});

router.put("/admin/homepage-about-preview", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageAboutPreviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the homepage About Preview content and try again." });
    return;
  }
  try {
    const aboutPreview = await prisma.homepageAboutPreview.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });
    res.json(UpdateHomepageAboutPreviewResponse.parse(aboutPreview));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage About Preview");
    res.status(500).json({ error: "Unable to save homepage About Preview." });
  }
});

export default router;