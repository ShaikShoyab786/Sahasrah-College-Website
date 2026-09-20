import { Router, type IRouter } from "express";
import {
  UpdateHomepageHeroBody,
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
    const hero = await prisma.homepageHero.findFirst({
      where: { id: "singleton", isPublished: true },
    });
    if (!hero) {
      res.status(404).json({ error: "Homepage hero is not available." });
      return;
    }
    res.json(hero);
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage hero");
    res.status(500).json({ error: "Unable to load homepage hero." });
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
  try {
    const hero = await prisma.homepageHero.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });
    res.json(hero);
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage hero");
    res.status(500).json({ error: "Unable to save homepage hero." });
  }
});

export default router;