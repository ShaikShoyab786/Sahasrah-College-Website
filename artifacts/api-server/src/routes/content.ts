import { Router, type IRouter } from "express";
import {
  GetAboutChairmanMessageResponse,
  GetAboutHeroResponse,
  GetAboutStoryResponse,
  GetAdminAboutChairmanMessageResponse,
  GetAdminAboutHeroResponse,
  GetAdminAboutStoryResponse,
  GetAdminHomepageAboutPreviewResponse,
  GetHomepageAboutPreviewResponse,
  UpdateAboutChairmanMessageBody,
  UpdateAboutChairmanMessageResponse,
  UpdateAboutHeroBody,
  UpdateAboutHeroResponse,
  UpdateAboutStoryBody,
  UpdateAboutStoryResponse,
  UpdateHomepageHeroBody,
  UpdateHomepageAboutPreviewBody,
  UpdateHomepageAboutPreviewResponse,
  UpdateSiteSettingsBody,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

async function readAboutHero() {
  return prisma.aboutHero.findUnique({
    where: { id: "singleton" },
    include: { stats: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readAboutStory() {
  return prisma.aboutStory.findUnique({
    where: { id: "singleton" },
    include: { timelineItems: { orderBy: { displayOrder: "asc" } } },
  });
}

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

router.get("/about-hero", async (req, res) => {
  try {
    const aboutHero = await readAboutHero();
    if (!aboutHero || !aboutHero.isVisible) {
      res.status(404).json({ error: "About hero is not available." });
      return;
    }
    res.json(GetAboutHeroResponse.parse(aboutHero));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read About hero");
    res.status(500).json({ error: "Unable to load About hero." });
  }
});

router.get("/about-story", async (req, res) => {
  try {
    const aboutStory = await readAboutStory();
    if (!aboutStory || !aboutStory.isVisible) {
      res.status(404).json({ error: "About story is not available." });
      return;
    }
    res.json(GetAboutStoryResponse.parse(aboutStory));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read About story");
    res.status(500).json({ error: "Unable to load About story." });
  }
});

router.get("/about-chairman-message", async (req, res) => {
  try {
    const message = await prisma.aboutChairmanMessage.findUnique({ where: { id: "singleton" } });
    if (!message || !message.isVisible) {
      res.status(404).json({ error: "Chairman message is not available." });
      return;
    }
    res.json(GetAboutChairmanMessageResponse.parse(message));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read About chairman message");
    res.status(500).json({ error: "Unable to load About chairman message." });
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

router.get("/admin/about-hero", requireAdmin, async (req, res) => {
  try {
    const aboutHero = await readAboutHero();
    if (!aboutHero) {
      res.status(404).json({ error: "About hero is not available." });
      return;
    }
    res.json(GetAdminAboutHeroResponse.parse(aboutHero));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin About hero");
    res.status(500).json({ error: "Unable to load About hero." });
  }
});

router.put("/admin/about-hero", requireAdmin, async (req, res) => {
  const parsed = UpdateAboutHeroBody.safeParse(req.body);
  if (!parsed.success || new Set(parsed.data?.stats.map((stat) => stat.displayOrder)).size !== 4) {
    res.status(400).json({ error: "Check the About hero content and use four unique statistics." });
    return;
  }
  try {
    const { stats, ...heroData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.aboutHero.upsert({
        where: { id: "singleton" },
        update: heroData,
        create: { id: "singleton", ...heroData },
      });
      await tx.aboutHeroStat.deleteMany({ where: { aboutHeroId: "singleton" } });
      await tx.aboutHeroStat.createMany({
        data: stats.map((stat) => ({ ...stat, aboutHeroId: "singleton" })),
      });
    });
    const aboutHero = await readAboutHero();
    res.json(UpdateAboutHeroResponse.parse(aboutHero));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update About hero");
    res.status(500).json({ error: "Unable to save About hero." });
  }
});

router.get("/admin/about-story", requireAdmin, async (req, res) => {
  try {
    const aboutStory = await readAboutStory();
    if (!aboutStory) {
      res.status(404).json({ error: "About story is not available." });
      return;
    }
    res.json(GetAdminAboutStoryResponse.parse(aboutStory));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin About story");
    res.status(500).json({ error: "Unable to load About story." });
  }
});

router.put("/admin/about-story", requireAdmin, async (req, res) => {
  const parsed = UpdateAboutStoryBody.safeParse(req.body);
  if (!parsed.success || new Set(parsed.data?.timelineItems.map((item) => item.displayOrder)).size !== parsed.data?.timelineItems.length) {
    res.status(400).json({ error: "Check the About story content and use unique timeline orders." });
    return;
  }
  try {
    const { timelineItems, ...storyData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.aboutStory.upsert({
        where: { id: "singleton" },
        update: storyData,
        create: { id: "singleton", ...storyData },
      });
      await tx.aboutTimelineItem.deleteMany({ where: { aboutStoryId: "singleton" } });
      await tx.aboutTimelineItem.createMany({
        data: timelineItems.map((item) => ({ ...item, aboutStoryId: "singleton" })),
      });
    });
    const aboutStory = await readAboutStory();
    res.json(UpdateAboutStoryResponse.parse(aboutStory));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update About story");
    res.status(500).json({ error: "Unable to save About story." });
  }
});

router.get("/admin/about-chairman-message", requireAdmin, async (req, res) => {
  try {
    const message = await prisma.aboutChairmanMessage.findUnique({ where: { id: "singleton" } });
    if (!message) {
      res.status(404).json({ error: "Chairman message is not available." });
      return;
    }
    res.json(GetAdminAboutChairmanMessageResponse.parse(message));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin About chairman message");
    res.status(500).json({ error: "Unable to load About chairman message." });
  }
});

router.put("/admin/about-chairman-message", requireAdmin, async (req, res) => {
  const parsed = UpdateAboutChairmanMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the chairman message content and try again." });
    return;
  }
  try {
    const message = await prisma.aboutChairmanMessage.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });
    res.json(UpdateAboutChairmanMessageResponse.parse(message));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update About chairman message");
    res.status(500).json({ error: "Unable to save About chairman message." });
  }
});

export default router;