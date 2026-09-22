import { Router, type IRouter } from "express";
import {
  GetAboutChairmanMessageResponse,
  GetAboutAchievementsResponse,
  GetAboutAdmissionCtaResponse,
  GetAboutCampusHighlightsResponse,
  GetAboutFaqResponse,
  GetAboutHeroResponse,
  GetAboutGuidingPrinciplesResponse,
  GetAboutLeadershipResponse,
  GetAboutStoryResponse,
  GetAboutWhyParentsChooseResponse,
  GetAdminAboutChairmanMessageResponse,
  GetAdminAboutAchievementsResponse,
  GetAdminAboutAdmissionCtaResponse,
  GetAdminAboutCampusHighlightsResponse,
  GetAdminAboutFaqResponse,
  GetAdminAboutHeroResponse,
  GetAdminAboutGuidingPrinciplesResponse,
  GetAdminAboutLeadershipResponse,
  GetAdminAboutStoryResponse,
  GetAdminAboutWhyParentsChooseResponse,
  GetAdminHomepageAboutPreviewResponse,
  GetAdminHomepageFavoriteTopicsResponse,
  GetAdminHomepageLiveUpdatesResponse,
  GetAdminHomepageStatisticsResponse,
  GetHomepageAboutPreviewResponse,
  GetHomepageFavoriteTopicsResponse,
  GetHomepageLiveUpdatesResponse,
  GetHomepageStatisticsResponse,
  UpdateAboutChairmanMessageBody,
  UpdateAboutChairmanMessageResponse,
  UpdateAboutAchievementsBody,
  UpdateAboutAchievementsResponse,
  UpdateAboutAdmissionCtaBody,
  UpdateAboutAdmissionCtaResponse,
  UpdateAboutCampusHighlightsBody,
  UpdateAboutCampusHighlightsResponse,
  UpdateAboutFaqBody,
  UpdateAboutFaqResponse,
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
  UpdateHomepageFavoriteTopicsBody,
  UpdateHomepageFavoriteTopicsResponse,
  UpdateHomepageLiveUpdatesBody,
  UpdateHomepageLiveUpdatesResponse,
  UpdateHomepageStatisticsBody,
  UpdateHomepageStatisticsResponse,
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

async function readAboutCampusHighlights() {
  return prisma.aboutCampusHighlights.findUnique({
    where: { id: "singleton" },
    include: { highlights: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readAboutAchievements() {
  return prisma.aboutAchievements.findUnique({
    where: { id: "singleton" },
    include: { statistics: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readAboutFaq() {
  return prisma.aboutFaq.findUnique({
    where: { id: "singleton" },
    include: { questions: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readAboutAdmissionCta() {
  return prisma.aboutAdmissionCta.findUnique({ where: { id: "singleton" } });
}

async function readHomepageStatistics() {
  return prisma.homepageStatistics.findUnique({
    where: { id: "singleton" },
    include: { statistics: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readHomepageFavoriteTopics() {
  return prisma.homepageFavoriteTopics.findUnique({
    where: { id: "singleton" },
    include: { topics: { orderBy: { displayOrder: "asc" } } },
  });
}

function hasUniqueDisplayOrders(items: Array<{ displayOrder: number }>) {
  return new Set(items.map((item) => item.displayOrder)).size === items.length;
}

function isValidImageReference(value: string | null) {
  return value === null || value.startsWith("/api/uploads/") || value.startsWith("https://") || value.startsWith("http://");
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

router.get("/homepage-live-updates", async (req, res) => {
  try {
    const updates = await prisma.homepageLiveUpdate.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { publishDate: "desc" }, { displayOrder: "asc" }],
      take: 3,
    });
    res.json(GetHomepageLiveUpdatesResponse.parse(updates));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage live updates");
    res.status(500).json({ error: "Unable to load homepage live updates." });
  }
});

router.get("/homepage-statistics", async (req, res) => {
  try {
    const content = await readHomepageStatistics();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Homepage statistics are not available." });
      return;
    }
    res.json(GetHomepageStatisticsResponse.parse({
      ...content,
      statistics: content.statistics.filter((statistic) => statistic.isActive),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage statistics");
    res.status(500).json({ error: "Unable to load homepage statistics." });
  }
});

router.get("/homepage-favorite-topics", async (req, res) => {
  try {
    const content = await readHomepageFavoriteTopics();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Homepage favorite topics are not available." });
      return;
    }
    res.json(GetHomepageFavoriteTopicsResponse.parse({
      ...content,
      topics: content.topics.filter((topic) => topic.isActive),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage favorite topics");
    res.status(500).json({ error: "Unable to load homepage favorite topics." });
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

router.get("/about-campus-highlights", async (req, res) => {
  try {
    const content = await readAboutCampusHighlights();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Campus highlights are not available." });
      return;
    }
    res.json(GetAboutCampusHighlightsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read About campus highlights");
    res.status(500).json({ error: "Unable to load About campus highlights." });
  }
});

router.get("/about-achievements", async (req, res) => {
  try {
    const content = await readAboutAchievements();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Achievement statistics are not available." });
      return;
    }
    res.json(GetAboutAchievementsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read About achievement statistics");
    res.status(500).json({ error: "Unable to load About achievement statistics." });
  }
});

router.get("/about-faq", async (req, res) => {
  try {
    const content = await readAboutFaq();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "About FAQs are not available." });
      return;
    }
    res.json(GetAboutFaqResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read About FAQs");
    res.status(500).json({ error: "Unable to load About FAQs." });
  }
});

router.get("/about-admission-cta", async (req, res) => {
  try {
    const content = await readAboutAdmissionCta();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "About admission CTA is not available." });
      return;
    }
    res.json(GetAboutAdmissionCtaResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read About admission CTA");
    res.status(500).json({ error: "Unable to load About admission CTA." });
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

router.get("/admin/homepage-live-updates", requireAdmin, async (req, res) => {
  try {
    const updates = await prisma.homepageLiveUpdate.findMany({ orderBy: { displayOrder: "asc" } });
    res.json(GetAdminHomepageLiveUpdatesResponse.parse(updates));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage live updates");
    res.status(500).json({ error: "Unable to load homepage live updates." });
  }
});

router.put("/admin/homepage-live-updates", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageLiveUpdatesBody.safeParse(req.body);
  if (
    !parsed.success ||
    !hasUniqueDisplayOrders(parsed.data) ||
    parsed.data.some((update) => !isValidImageReference(update.imageUrl))
  ) {
    res.status(400).json({ error: "Check update fields, image references, and unique display orders." });
    return;
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.homepageLiveUpdate.deleteMany();
      await tx.homepageLiveUpdate.createMany({ data: parsed.data });
    });
    const updates = await prisma.homepageLiveUpdate.findMany({ orderBy: { displayOrder: "asc" } });
    res.json(UpdateHomepageLiveUpdatesResponse.parse(updates));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage live updates");
    res.status(500).json({ error: "Unable to save homepage live updates." });
  }
});

router.get("/admin/homepage-statistics", requireAdmin, async (req, res) => {
  try {
    const content = await readHomepageStatistics();
    if (!content) {
      res.status(404).json({ error: "Homepage statistics are not available." });
      return;
    }
    res.json(GetAdminHomepageStatisticsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage statistics");
    res.status(500).json({ error: "Unable to load homepage statistics." });
  }
});

router.put("/admin/homepage-statistics", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageStatisticsBody.safeParse(req.body);
  if (!parsed.success || !hasUniqueDisplayOrders(parsed.data.statistics)) {
    res.status(400).json({ error: "Check statistic fields and use unique display orders." });
    return;
  }
  try {
    const { statistics, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.homepageStatistics.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.homepageStatistic.deleteMany({ where: { homepageStatisticsId: "singleton" } });
      await tx.homepageStatistic.createMany({
        data: statistics.map((statistic) => ({ ...statistic, homepageStatisticsId: "singleton" })),
      });
    });
    const content = await readHomepageStatistics();
    res.json(UpdateHomepageStatisticsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage statistics");
    res.status(500).json({ error: "Unable to save homepage statistics." });
  }
});

router.get("/admin/homepage-favorite-topics", requireAdmin, async (req, res) => {
  try {
    const content = await readHomepageFavoriteTopics();
    if (!content) {
      res.status(404).json({ error: "Homepage favorite topics are not available." });
      return;
    }
    res.json(GetAdminHomepageFavoriteTopicsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage favorite topics");
    res.status(500).json({ error: "Unable to load homepage favorite topics." });
  }
});

router.put("/admin/homepage-favorite-topics", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageFavoriteTopicsBody.safeParse(req.body);
  if (
    !parsed.success ||
    !hasUniqueDisplayOrders(parsed.data.topics) ||
    parsed.data.topics.some((topic) => !isValidImageReference(topic.imageUrl))
  ) {
    res.status(400).json({ error: "Check topic fields, image references, and unique display orders." });
    return;
  }
  try {
    const { topics, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.homepageFavoriteTopics.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.homepageFavoriteTopic.deleteMany({ where: { homepageFavoriteTopicsId: "singleton" } });
      await tx.homepageFavoriteTopic.createMany({
        data: topics.map((topic) => ({ ...topic, homepageFavoriteTopicsId: "singleton" })),
      });
    });
    const content = await readHomepageFavoriteTopics();
    res.json(UpdateHomepageFavoriteTopicsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage favorite topics");
    res.status(500).json({ error: "Unable to save homepage favorite topics." });
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

router.get("/admin/about-campus-highlights", requireAdmin, async (req, res) => {
  try {
    const content = await readAboutCampusHighlights();
    if (!content) {
      res.status(404).json({ error: "Campus highlights are not available." });
      return;
    }
    res.json(GetAdminAboutCampusHighlightsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin About campus highlights");
    res.status(500).json({ error: "Unable to load About campus highlights." });
  }
});

router.put("/admin/about-campus-highlights", requireAdmin, async (req, res) => {
  const parsed = UpdateAboutCampusHighlightsBody.safeParse(req.body);
  if (
    !parsed.success ||
    !hasUniqueDisplayOrders(parsed.data.highlights) ||
    parsed.data.highlights.some((highlight) => !isValidImageReference(highlight.imageUrl))
  ) {
    res.status(400).json({ error: "Check campus highlight fields, image references, and unique display orders." });
    return;
  }
  try {
    const { highlights, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.aboutCampusHighlights.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.aboutCampusHighlight.deleteMany({ where: { aboutCampusHighlightsId: "singleton" } });
      await tx.aboutCampusHighlight.createMany({
        data: highlights.map((highlight) => ({ ...highlight, aboutCampusHighlightsId: "singleton" })),
      });
    });
    const content = await readAboutCampusHighlights();
    res.json(UpdateAboutCampusHighlightsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update About campus highlights");
    res.status(500).json({ error: "Unable to save About campus highlights." });
  }
});

router.get("/admin/about-achievements", requireAdmin, async (req, res) => {
  try {
    const content = await readAboutAchievements();
    if (!content) {
      res.status(404).json({ error: "Achievement statistics are not available." });
      return;
    }
    res.json(GetAdminAboutAchievementsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin About achievement statistics");
    res.status(500).json({ error: "Unable to load About achievement statistics." });
  }
});

router.put("/admin/about-achievements", requireAdmin, async (req, res) => {
  const parsed = UpdateAboutAchievementsBody.safeParse(req.body);
  if (!parsed.success || !hasUniqueDisplayOrders(parsed.data.statistics)) {
    res.status(400).json({ error: "Check achievement statistic fields and use unique display orders." });
    return;
  }
  try {
    const { statistics, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.aboutAchievements.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.aboutAchievementStatistic.deleteMany({ where: { aboutAchievementsId: "singleton" } });
      await tx.aboutAchievementStatistic.createMany({
        data: statistics.map((statistic) => ({ ...statistic, aboutAchievementsId: "singleton" })),
      });
    });
    const content = await readAboutAchievements();
    res.json(UpdateAboutAchievementsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update About achievement statistics");
    res.status(500).json({ error: "Unable to save About achievement statistics." });
  }
});

router.get("/admin/about-faq", requireAdmin, async (req, res) => {
  try {
    const content = await readAboutFaq();
    if (!content) {
      res.status(404).json({ error: "About FAQs are not available." });
      return;
    }
    res.json(GetAdminAboutFaqResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin About FAQs");
    res.status(500).json({ error: "Unable to load About FAQs." });
  }
});

router.put("/admin/about-faq", requireAdmin, async (req, res) => {
  const parsed = UpdateAboutFaqBody.safeParse(req.body);
  if (!parsed.success || !hasUniqueDisplayOrders(parsed.data.questions)) {
    res.status(400).json({ error: "Check FAQ fields and use unique display orders." });
    return;
  }
  try {
    const { questions, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.aboutFaq.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.aboutFaqItem.deleteMany({ where: { aboutFaqId: "singleton" } });
      await tx.aboutFaqItem.createMany({
        data: questions.map((question) => ({ ...question, aboutFaqId: "singleton" })),
      });
    });
    const content = await readAboutFaq();
    res.json(UpdateAboutFaqResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update About FAQs");
    res.status(500).json({ error: "Unable to save About FAQs." });
  }
});

router.get("/admin/about-admission-cta", requireAdmin, async (req, res) => {
  try {
    const content = await readAboutAdmissionCta();
    if (!content) {
      res.status(404).json({ error: "About admission CTA is not available." });
      return;
    }
    res.json(GetAdminAboutAdmissionCtaResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin About admission CTA");
    res.status(500).json({ error: "Unable to load About admission CTA." });
  }
});

router.put("/admin/about-admission-cta", requireAdmin, async (req, res) => {
  const parsed = UpdateAboutAdmissionCtaBody.safeParse(req.body);
  if (!parsed.success || !isValidImageReference(parsed.data.backgroundImage)) {
    res.status(400).json({ error: "Check admission CTA fields and image reference." });
    return;
  }
  try {
    const content = await prisma.aboutAdmissionCta.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });
    res.json(UpdateAboutAdmissionCtaResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update About admission CTA");
    res.status(500).json({ error: "Unable to save About admission CTA." });
  }
});

export default router;