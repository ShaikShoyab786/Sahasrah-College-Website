import { Router, type IRouter } from "express";
import {
  GetAboutChairmanMessageResponse,
  GetAboutHeroResponse,
  GetAboutGuidingPrinciplesResponse,
  GetAboutLeadershipResponse,
  GetAboutStoryResponse,
  GetAboutWhyParentsChooseResponse,
  GetAdminAboutChairmanMessageResponse,
  GetAdminAboutHeroResponse,
  GetAdminAboutGuidingPrinciplesResponse,
  GetAdminAboutLeadershipResponse,
  GetAdminAboutStoryResponse,
  GetAdminAboutWhyParentsChooseResponse,
  GetAdminHomepageAboutPreviewResponse,
  GetHomepageAboutPreviewResponse,
  UpdateAboutChairmanMessageBody,
  UpdateAboutChairmanMessageResponse,
  UpdateAboutHeroBody,
  UpdateAboutHeroResponse,
  UpdateAboutGuidingPrinciplesBody,
  UpdateAboutGuidingPrinciplesResponse,
  UpdateAboutLeadershipBody,
  UpdateAboutLeadershipResponse,
  UpdateAboutStoryBody,
  UpdateAboutStoryResponse,
  UpdateAboutWhyParentsChooseBody,
  UpdateAboutWhyParentsChooseResponse,
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

async function readAboutGuidingPrinciples() {
  return prisma.aboutGuidingPrinciples.findUnique({
    where: { id: "singleton" },
    include: { values: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readAboutWhyParentsChoose() {
  return prisma.aboutWhyParentsChoose.findUnique({
    where: { id: "singleton" },
    include: { benefits: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readAboutLeadership() {
  return prisma.aboutLeadership.findUnique({
    where: { id: "singleton" },
    include: { members: { orderBy: { displayOrder: "asc" } } },
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

router.get("/about-guiding-principles", async (req, res) => {
  try {
    const content = await readAboutGuidingPrinciples();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Guiding principles are not available." });
      return;
    }
    res.json(GetAboutGuidingPrinciplesResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read About guiding principles");
    res.status(500).json({ error: "Unable to load About guiding principles." });
  }
});

router.get("/about-why-parents-choose", async (req, res) => {
  try {
    const content = await readAboutWhyParentsChoose();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Parent-choice benefits are not available." });
      return;
    }
    res.json(GetAboutWhyParentsChooseResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read About parent-choice benefits");
    res.status(500).json({ error: "Unable to load About parent-choice benefits." });
  }
});

router.get("/about-leadership", async (req, res) => {
  try {
    const content = await readAboutLeadership();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "About leadership is not available." });
      return;
    }
    res.json(GetAboutLeadershipResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read About leadership");
    res.status(500).json({ error: "Unable to load About leadership." });
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

router.get("/admin/about-guiding-principles", requireAdmin, async (req, res) => {
  try {
    const content = await readAboutGuidingPrinciples();
    if (!content) {
      res.status(404).json({ error: "Guiding principles are not available." });
      return;
    }
    res.json(GetAdminAboutGuidingPrinciplesResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin About guiding principles");
    res.status(500).json({ error: "Unable to load About guiding principles." });
  }
});

router.put("/admin/about-guiding-principles", requireAdmin, async (req, res) => {
  const parsed = UpdateAboutGuidingPrinciplesBody.safeParse(req.body);
  if (!parsed.success || new Set(parsed.data?.values.map((value) => value.displayOrder)).size !== parsed.data?.values.length) {
    res.status(400).json({ error: "Check the guiding principles content and use unique value orders." });
    return;
  }
  try {
    const { values, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.aboutGuidingPrinciples.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.aboutGuidingPrincipleValue.deleteMany({ where: { aboutGuidingPrinciplesId: "singleton" } });
      await tx.aboutGuidingPrincipleValue.createMany({
        data: values.map((value) => ({ ...value, aboutGuidingPrinciplesId: "singleton" })),
      });
    });
    const content = await readAboutGuidingPrinciples();
    res.json(UpdateAboutGuidingPrinciplesResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update About guiding principles");
    res.status(500).json({ error: "Unable to save About guiding principles." });
  }
});

router.get("/admin/about-why-parents-choose", requireAdmin, async (req, res) => {
  try {
    const content = await readAboutWhyParentsChoose();
    if (!content) {
      res.status(404).json({ error: "Parent-choice benefits are not available." });
      return;
    }
    res.json(GetAdminAboutWhyParentsChooseResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin About parent-choice benefits");
    res.status(500).json({ error: "Unable to load About parent-choice benefits." });
  }
});

router.put("/admin/about-why-parents-choose", requireAdmin, async (req, res) => {
  const parsed = UpdateAboutWhyParentsChooseBody.safeParse(req.body);
  if (!parsed.success || new Set(parsed.data?.benefits.map((benefit) => benefit.displayOrder)).size !== parsed.data?.benefits.length) {
    res.status(400).json({ error: "Check the parent-choice content and use unique benefit orders." });
    return;
  }
  try {
    const { benefits, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.aboutWhyParentsChoose.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.aboutParentChoiceBenefit.deleteMany({ where: { aboutWhyParentsChooseId: "singleton" } });
      await tx.aboutParentChoiceBenefit.createMany({
        data: benefits.map((benefit) => ({ ...benefit, aboutWhyParentsChooseId: "singleton" })),
      });
    });
    const content = await readAboutWhyParentsChoose();
    res.json(UpdateAboutWhyParentsChooseResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update About parent-choice benefits");
    res.status(500).json({ error: "Unable to save About parent-choice benefits." });
  }
});

router.get("/admin/about-leadership", requireAdmin, async (req, res) => {
  try {
    const content = await readAboutLeadership();
    if (!content) {
      res.status(404).json({ error: "About leadership is not available." });
      return;
    }
    res.json(GetAdminAboutLeadershipResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin About leadership");
    res.status(500).json({ error: "Unable to load About leadership." });
  }
});

router.put("/admin/about-leadership", requireAdmin, async (req, res) => {
  const parsed = UpdateAboutLeadershipBody.safeParse(req.body);
  if (!parsed.success || new Set(parsed.data?.members.map((member) => member.displayOrder)).size !== parsed.data?.members.length) {
    res.status(400).json({ error: "Check the leadership content and use unique member orders." });
    return;
  }
  try {
    const { members, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.aboutLeadership.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.aboutLeadershipMember.deleteMany({ where: { aboutLeadershipId: "singleton" } });
      await tx.aboutLeadershipMember.createMany({
        data: members.map((member) => ({ ...member, aboutLeadershipId: "singleton" })),
      });
    });
    const content = await readAboutLeadership();
    res.json(UpdateAboutLeadershipResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update About leadership");
    res.status(500).json({ error: "Unable to save About leadership." });
  }
});

export default router;