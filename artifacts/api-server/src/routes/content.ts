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
  GetAdminHomepageAchievementRibbonResponse,
  GetAdminHomepageKnowledgeHubResponse,
  GetAdminHomepageAdmissionsFaqResponse,
  GetAdminHomepageFinalCtaResponse,
  GetAdminHomepageResultsResponse,
  GetAdminHomepageLiveUpdatesResponse,
  GetAdminHomepagePreviewCopyResponse,
  GetAdminHomepageStatisticsResponse,
  GetAdminHomepageTestimonialsResponse,
  GetHomepageAchievementRibbonResponse,
  GetHomepageAboutPreviewResponse,
  GetHomepageFavoriteTopicsResponse,
  GetHomepageKnowledgeHubResponse,
  GetHomepageAdmissionsFaqResponse,
  GetHomepageFinalCtaResponse,
  GetHomepageLiveUpdatesResponse,
  GetHomepagePreviewCopyResponse,
  GetHomepageResultsResponse,
  GetHomepageStatisticsResponse,
  GetHomepageTestimonialsResponse,
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
  UpdateHomepageAchievementRibbonBody,
  UpdateHomepageAchievementRibbonResponse,
  UpdateHomepageKnowledgeHubBody,
  UpdateHomepageKnowledgeHubResponse,
  UpdateHomepageAdmissionsFaqBody,
  UpdateHomepageAdmissionsFaqResponse,
  UpdateHomepageFinalCtaBody,
  UpdateHomepageFinalCtaResponse,
  UpdateHomepageLiveUpdatesBody,
  UpdateHomepageResultsBody,
  UpdateHomepageResultsResponse,
  UpdateHomepageLiveUpdatesResponse,
  UpdateHomepagePreviewCopyBody,
  UpdateHomepagePreviewCopyResponse,
  UpdateHomepageStatisticsBody,
  UpdateHomepageStatisticsResponse,
  UpdateHomepageTestimonialsBody,
  UpdateHomepageTestimonialsResponse,
  UpdateSiteSettingsBody,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { homepagePreviewCopyDefaults } from "../lib/homepage-preview-copy-defaults";
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
  return prisma.homepageStatistics.findUnique({ where: { id: "singleton" } });
}

async function readHomepageFavoriteTopics() {
  return prisma.homepageFavoriteTopics.findUnique({
    where: { id: "singleton" },
    include: { topics: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readHomepageResults() {
  return prisma.homepageResults.findUnique({
    where: { id: "singleton" },
    include: {
      results: { orderBy: { displayOrder: "asc" } },
      statistics: { orderBy: { displayOrder: "asc" } },
    },
  });
}

async function readHomepageAchievementRibbon() {
  return prisma.homepageAchievementRibbon.findUnique({
    where: { id: "singleton" },
    include: { phrases: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readHomepageTestimonials() {
  return prisma.homepageTestimonials.findUnique({
    where: { id: "singleton" },
    include: { testimonials: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readHomepageKnowledgeHub() {
  return prisma.homepageKnowledgeHub.findUnique({
    where: { id: "singleton" },
    include: { resources: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readHomepageAdmissionsFaq() {
  return prisma.homepageAdmissionsFaq.findUnique({
    where: { id: "singleton" },
    include: { questions: { orderBy: { displayOrder: "asc" } } },
  });
}

async function readHomepageFinalCta() {
  return prisma.homepageFinalCta.findUnique({ where: { id: "singleton" } });
}

async function readHomepagePreviewCopy() {
  return prisma.homepagePreviewCopy.findUnique({ where: { id: "singleton" } });
}

function hasUniqueDisplayOrders(items: Array<{ displayOrder: number }>) {
  return new Set(items.map((item) => item.displayOrder)).size === items.length;
}

function isValidImageReference(value: string | null) {
  return value === null || value.startsWith("/api/uploads/") || value.startsWith("https://") || value.startsWith("http://");
}

function isValidContentLink(value: string) {
  return value.startsWith("/") || value.startsWith("#") || value.startsWith("https://") || value.startsWith("http://");
}

function isValidPhoneNumber(value: string | null | undefined) {
  return Boolean(value && value.replace(/\D/g, "").length >= 7);
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

router.get("/homepage-preview-copy", async (req, res) => {
  try {
    const content = await readHomepagePreviewCopy();
    if (!content) {
      res.status(500).json({ error: "Homepage preview headings are not available." });
      return;
    }
    res.json(GetHomepagePreviewCopyResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage preview headings");
    res.status(500).json({ error: "Unable to load homepage preview headings." });
  }
});

router.get("/homepage-statistics", async (req, res) => {
  try {
    const content = await readHomepageStatistics();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Homepage statistics are not available." });
      return;
    }
    res.json(GetHomepageStatisticsResponse.parse(content));
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

router.get("/homepage-results", async (req, res) => {
  try {
    const content = await readHomepageResults();
    if (!content) {
      res.status(404).json({ error: "Homepage results are not available." });
      return;
    }
    res.json(GetHomepageResultsResponse.parse({
      ...content,
      eyebrow: content.eyebrow || "Pride of Sahasrah",
      viewAllButtonLink: "/results",
      results: content.results.filter((result) => result.isPublished && result.showInHomePreview),
      statistics: content.statistics.filter((statistic) => statistic.isPublished && statistic.showInHomePreview),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage results");
    res.status(500).json({ error: "Unable to load homepage results." });
  }
});

router.get("/homepage-achievement-ribbon", async (req, res) => {
  try {
    const content = await readHomepageAchievementRibbon();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Homepage achievement ribbon is not available." });
      return;
    }
    res.json(GetHomepageAchievementRibbonResponse.parse({
      ...content,
      phrases: content.phrases.filter((phrase) => phrase.isActive),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage achievement ribbon");
    res.status(500).json({ error: "Unable to load homepage achievement ribbon." });
  }
});

router.get("/homepage-testimonials", async (req, res) => {
  try {
    const content = await readHomepageTestimonials();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Homepage testimonials are not available." });
      return;
    }
    res.json(GetHomepageTestimonialsResponse.parse({
      ...content,
      testimonials: content.testimonials.filter((testimonial) => testimonial.isActive),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage testimonials");
    res.status(500).json({ error: "Unable to load homepage testimonials." });
  }
});

router.get("/homepage-knowledge-hub", async (req, res) => {
  try {
    const content = await readHomepageKnowledgeHub();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Homepage Knowledge Hub preview is not available." });
      return;
    }
    res.json(GetHomepageKnowledgeHubResponse.parse({
      ...content,
      resources: content.resources.filter((resource) => resource.isActive),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage Knowledge Hub preview");
    res.status(500).json({ error: "Unable to load homepage Knowledge Hub preview." });
  }
});

router.get("/homepage-admissions-faq", async (req, res) => {
  try {
    const content = await readHomepageAdmissionsFaq();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Homepage Admissions FAQ is not available." });
      return;
    }
    res.json(GetHomepageAdmissionsFaqResponse.parse({
      ...content,
      questions: content.questions.filter((question) => question.isVisible && question.question.trim() && question.answer.trim()),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage Admissions FAQ");
    res.status(500).json({ error: "Unable to load homepage Admissions FAQ." });
  }
});

router.get("/homepage-final-cta", async (req, res) => {
  try {
    const content = await readHomepageFinalCta();
    if (!content || !content.isVisible) {
      res.status(404).json({ error: "Homepage final admission CTA is not available." });
      return;
    }
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    res.json(GetHomepageFinalCtaResponse.parse({
      ...content,
      phoneNumber: isValidPhoneNumber(content.phoneNumber) ? content.phoneNumber.trim() : (isValidPhoneNumber(settings?.phone) ? settings?.phone ?? "" : ""),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage final admission CTA");
    res.status(500).json({ error: "Unable to load homepage final admission CTA." });
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

router.get("/admin/homepage-preview-copy", requireAdmin, async (req, res) => {
  try {
    const content = await readHomepagePreviewCopy();
    if (!content) {
      res.status(500).json({ error: "Homepage preview headings are not available." });
      return;
    }
    res.json(GetAdminHomepagePreviewCopyResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage preview headings");
    res.status(500).json({ error: "Unable to load homepage preview headings." });
  }
});

router.put("/admin/homepage-preview-copy", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepagePreviewCopyBody.safeParse(req.body);
  if (
    !parsed.success ||
    Object.keys(parsed.data).length === 0 ||
    Object.values(parsed.data).some((value) => typeof value !== "string" || !value.trim())
  ) {
    res.status(400).json({ error: "Provide at least one non-empty homepage preview heading field." });
    return;
  }

  const copyPatch = Object.fromEntries(
    Object.entries(parsed.data).map(([key, value]) => [key, value.trim()]),
  ) as typeof parsed.data;

  try {
    const content = await prisma.homepagePreviewCopy.upsert({
      where: { id: "singleton" },
      update: copyPatch,
      create: { id: "singleton", ...homepagePreviewCopyDefaults, ...copyPatch },
    });
    res.json(UpdateHomepagePreviewCopyResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage preview headings");
    res.status(500).json({ error: "Unable to save homepage preview headings." });
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
  if (!parsed.success) {
    res.status(400).json({ error: "Check the Home Statistics section copy." });
    return;
  }
  try {
    await prisma.homepageStatistics.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
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

router.get("/admin/homepage-results", requireAdmin, async (req, res) => {
  try {
    const content = await readHomepageResults();
    if (!content) {
      res.status(404).json({ error: "Homepage results are not available." });
      return;
    }
    res.json(GetAdminHomepageResultsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage results");
    res.status(500).json({ error: "Unable to load homepage results." });
  }
});

router.put("/admin/homepage-results", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageResultsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the Home Results section copy." });
    return;
  }
  try {
    await prisma.homepageResults.upsert({
      where: { id: "singleton" },
      update: { ...parsed.data, viewAllButtonLink: "/results" },
      create: {
        id: "singleton",
        ...parsed.data,
        viewAllButtonLink: "/results",
      },
    });
    const content = await readHomepageResults();
    res.json(UpdateHomepageResultsResponse.parse({ ...content, viewAllButtonLink: "/results" }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage results");
    res.status(500).json({ error: "Unable to save homepage results." });
  }
});

router.get("/admin/homepage-achievement-ribbon", requireAdmin, async (req, res) => {
  try {
    const content = await readHomepageAchievementRibbon();
    if (!content) {
      res.status(404).json({ error: "Homepage achievement ribbon is not available." });
      return;
    }
    res.json(GetAdminHomepageAchievementRibbonResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage achievement ribbon");
    res.status(500).json({ error: "Unable to load homepage achievement ribbon." });
  }
});

router.put("/admin/homepage-achievement-ribbon", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageAchievementRibbonBody.safeParse(req.body);
  if (!parsed.success || !hasUniqueDisplayOrders(parsed.data.phrases)) {
    res.status(400).json({ error: "Check ribbon phrases and use unique display orders." });
    return;
  }
  try {
    const { phrases, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.homepageAchievementRibbon.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.homepageAchievementRibbonPhrase.deleteMany({ where: { homepageAchievementRibbonId: "singleton" } });
      await tx.homepageAchievementRibbonPhrase.createMany({
        data: phrases.map((phrase) => ({ ...phrase, homepageAchievementRibbonId: "singleton" })),
      });
    });
    const content = await readHomepageAchievementRibbon();
    res.json(UpdateHomepageAchievementRibbonResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage achievement ribbon");
    res.status(500).json({ error: "Unable to save homepage achievement ribbon." });
  }
});

router.get("/admin/homepage-testimonials", requireAdmin, async (req, res) => {
  try {
    const content = await readHomepageTestimonials();
    if (!content) {
      res.status(404).json({ error: "Homepage testimonials are not available." });
      return;
    }
    res.json(GetAdminHomepageTestimonialsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage testimonials");
    res.status(500).json({ error: "Unable to load homepage testimonials." });
  }
});

router.put("/admin/homepage-testimonials", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageTestimonialsBody.safeParse(req.body);
  if (!parsed.success || !hasUniqueDisplayOrders(parsed.data.testimonials) || parsed.data.testimonials.some((testimonial) => !isValidImageReference(testimonial.avatarImageUrl))) {
    res.status(400).json({ error: "Check testimonial fields, image references, and unique display orders." });
    return;
  }
  try {
    const { testimonials, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.homepageTestimonials.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.homepageTestimonial.deleteMany({ where: { homepageTestimonialsId: "singleton" } });
      await tx.homepageTestimonial.createMany({
        data: testimonials.map((testimonial) => ({ ...testimonial, homepageTestimonialsId: "singleton" })),
      });
    });
    const content = await readHomepageTestimonials();
    res.json(UpdateHomepageTestimonialsResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage testimonials");
    res.status(500).json({ error: "Unable to save homepage testimonials." });
  }
});

router.get("/admin/homepage-knowledge-hub", requireAdmin, async (req, res) => {
  try {
    const content = await readHomepageKnowledgeHub();
    if (!content) {
      res.status(404).json({ error: "Homepage Knowledge Hub preview is not available." });
      return;
    }
    res.json(GetAdminHomepageKnowledgeHubResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage Knowledge Hub preview");
    res.status(500).json({ error: "Unable to load homepage Knowledge Hub preview." });
  }
});

router.put("/admin/homepage-knowledge-hub", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageKnowledgeHubBody.safeParse(req.body);
  if (
    !parsed.success ||
    !hasUniqueDisplayOrders(parsed.data.resources) ||
    parsed.data.resources.some((resource) => !isValidImageReference(resource.thumbnailUrl) || !isValidContentLink(resource.resourceUrl))
  ) {
    res.status(400).json({ error: "Check Knowledge Hub fields, resource links, image references, and unique display orders." });
    return;
  }
  try {
    const { resources, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.homepageKnowledgeHub.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.homepageKnowledgeResource.deleteMany({ where: { homepageKnowledgeHubId: "singleton" } });
      await tx.homepageKnowledgeResource.createMany({
        data: resources.map((resource) => ({ ...resource, homepageKnowledgeHubId: "singleton" })),
      });
    });
    res.json(UpdateHomepageKnowledgeHubResponse.parse(await readHomepageKnowledgeHub()));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage Knowledge Hub preview");
    res.status(500).json({ error: "Unable to save homepage Knowledge Hub preview." });
  }
});

router.get("/admin/homepage-admissions-faq", requireAdmin, async (req, res) => {
  try {
    const content = await readHomepageAdmissionsFaq();
    if (!content) {
      res.status(404).json({ error: "Homepage Admissions FAQ is not available." });
      return;
    }
    res.json(GetAdminHomepageAdmissionsFaqResponse.parse(content));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage Admissions FAQ");
    res.status(500).json({ error: "Unable to load homepage Admissions FAQ." });
  }
});

router.put("/admin/homepage-admissions-faq", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageAdmissionsFaqBody.safeParse(req.body);
  if (!parsed.success || !hasUniqueDisplayOrders(parsed.data.questions) || parsed.data.questions.some((question) => !question.question.trim() || !question.answer.trim())) {
    res.status(400).json({ error: "Check FAQ questions, answers, and unique display orders." });
    return;
  }
  try {
    const { questions, ...sectionData } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.homepageAdmissionsFaq.upsert({
        where: { id: "singleton" },
        update: sectionData,
        create: { id: "singleton", ...sectionData },
      });
      await tx.homepageAdmissionsFaqItem.deleteMany({ where: { homepageAdmissionsFaqId: "singleton" } });
      await tx.homepageAdmissionsFaqItem.createMany({
        data: questions.map((question) => ({ ...question, homepageAdmissionsFaqId: "singleton" })),
      });
    });
    res.json(UpdateHomepageAdmissionsFaqResponse.parse(await readHomepageAdmissionsFaq()));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage Admissions FAQ");
    res.status(500).json({ error: "Unable to save homepage Admissions FAQ." });
  }
});

router.get("/admin/homepage-final-cta", requireAdmin, async (req, res) => {
  try {
    const content = await readHomepageFinalCta();
    if (!content) {
      res.status(404).json({ error: "Homepage final admission CTA is not available." });
      return;
    }
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    res.json(GetAdminHomepageFinalCtaResponse.parse({
      ...content,
      phoneNumber: isValidPhoneNumber(content.phoneNumber) ? content.phoneNumber.trim() : (isValidPhoneNumber(settings?.phone) ? settings?.phone ?? "" : ""),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin homepage final admission CTA");
    res.status(500).json({ error: "Unable to load homepage final admission CTA." });
  }
});

router.put("/admin/homepage-final-cta", requireAdmin, async (req, res) => {
  const parsed = UpdateHomepageFinalCtaBody.safeParse(req.body);
  if (!parsed.success || !isValidImageReference(parsed.data.backgroundImage) || !isValidContentLink(parsed.data.applyButtonHref)) {
    res.status(400).json({ error: "Check final CTA fields, application link, and background image reference." });
    return;
  }
  try {
    const content = await prisma.homepageFinalCta.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    res.json(UpdateHomepageFinalCtaResponse.parse({
      ...content,
      phoneNumber: isValidPhoneNumber(content.phoneNumber) ? content.phoneNumber.trim() : (isValidPhoneNumber(settings?.phone) ? settings?.phone ?? "" : ""),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update homepage final admission CTA");
    res.status(500).json({ error: "Unable to save homepage final admission CTA." });
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