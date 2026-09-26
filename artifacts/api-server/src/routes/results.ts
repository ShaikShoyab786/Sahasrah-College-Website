import { Router, type IRouter } from "express";
import { Prisma } from "@prisma/client";
import {
  GetAdminResultsLibraryResponse,
  GetResultsPageResponse,
  UpdateAdminResultsLibraryBody,
  UpdateAdminResultsLibraryResponse,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

type ResultsLibraryPayload = ReturnType<typeof UpdateAdminResultsLibraryBody.parse>;
type ResultPayload = ResultsLibraryPayload["results"][number];
type StatisticPayload = ResultsLibraryPayload["statistics"][number];

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidImageReference(value: string | null) {
  return value === null || value.startsWith("/api/uploads/") || isHttpUrl(value);
}

function isValidContactDestination(value: string) {
  return /^\/contact(?:[?#][^\s]*)?$/.test(value);
}

function publicStory(result: { isPublished: boolean; storyIsPublished: boolean; story: string | null }) {
  return result.isPublished && result.storyIsPublished ? result.story?.trim() || null : null;
}

function resultData(result: ResultPayload): Prisma.HomepageResultUncheckedCreateInput {
  return {
    homepageResultsId: "singleton",
    studentImageUrl: result.studentImageUrl,
    studentImageAltText: result.studentImageAltText.trim(),
    studentName: result.studentName.trim(),
    examCourse: result.examCourse.trim(),
    score: result.score.trim(),
    achievement: result.achievement.trim(),
    resultLabel: result.resultLabel.trim(),
    examName: result.examName?.trim() || null,
    category: result.category,
    year: result.year?.trim() || null,
    institution: result.institution?.trim() || null,
    course: result.course?.trim() || null,
    story: result.story?.trim() || null,
    storyIsPublished: result.storyIsPublished ?? false,
    storyOrder: result.storyOrder ?? 1,
    accentColor: result.accentColor?.trim() || null,
    displayOrder: result.displayOrder,
    isActive: result.isPublished,
    isPublished: result.isPublished,
    showInHomePreview: result.showInHomePreview,
    homePreviewOrder: result.homePreviewOrder,
  };
}

function statisticData(statistic: StatisticPayload): Prisma.HomepageResultStatisticUncheckedCreateInput {
  return {
    homepageResultsId: "singleton",
    label: statistic.label.trim(),
    value: statistic.value.trim(),
    supportingText: statistic.supportingText?.trim() || null,
    displayOrder: statistic.displayOrder,
    isPublished: statistic.isPublished,
    showInHomePreview: statistic.showInHomePreview,
    homePreviewOrder: statistic.homePreviewOrder,
  };
}

async function readAdminLibrary() {
  const [settings, sharedResults] = await Promise.all([
    prisma.resultsPageSettings.findUnique({ where: { id: "singleton" } }),
    prisma.homepageResults.findUnique({
      where: { id: "singleton" },
      include: {
        results: { orderBy: [{ displayOrder: "asc" }, { id: "asc" }] },
        statistics: { orderBy: [{ displayOrder: "asc" }, { id: "asc" }] },
      },
    }),
  ]);

  return {
    settings,
    results: sharedResults?.results ?? [],
    statistics: sharedResults?.statistics ?? [],
  };
}

router.get("/results", async (req, res): Promise<void> => {
  try {
    const [settings, sharedResults] = await Promise.all([
      prisma.resultsPageSettings.findUnique({ where: { id: "singleton" } }),
      prisma.homepageResults.findUnique({
        where: { id: "singleton" },
        include: {
          results: { orderBy: [{ displayOrder: "asc" }, { id: "asc" }] },
          statistics: { orderBy: [{ displayOrder: "asc" }, { id: "asc" }] },
        },
      }),
    ]);

    if (!settings || !settings.isVisible) {
      res.status(404).json({ error: "Results page is not available." });
      return;
    }

    res.json(GetResultsPageResponse.parse({
      settings,
      results: (sharedResults?.results ?? [])
        .filter((result) => result.isPublished)
        .map((result) => ({ ...result, story: publicStory(result) })),
      statistics: (sharedResults?.statistics ?? []).filter((statistic) => statistic.isPublished),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read the Results page");
    res.status(500).json({ error: "Unable to load Results page content." });
  }
});

router.get("/admin/results", requireAdmin, async (req, res): Promise<void> => {
  try {
    const library = await readAdminLibrary();
    if (!library.settings) {
      res.status(404).json({ error: "Results page settings are not available." });
      return;
    }
    res.json(GetAdminResultsLibraryResponse.parse(library));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read the Results library");
    res.status(500).json({ error: "Unable to load Results library." });
  }
});

router.put("/admin/results", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminResultsLibraryBody.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.slice(0, 5).map((issue) => {
      const path = issue.path
        .map((part) => typeof part === "number" ? `item ${part + 1}` : String(part))
        .join(".");
      return `${path || "request"}: ${issue.message}`;
    });
    req.log.warn(
      { validationIssues: parsed.error.issues.map(({ path, code }) => ({ path, code })) },
      "Invalid Results library input",
    );
    res.status(400).json({
      error: details.length
        ? `Results library validation failed. ${details.join("; ")}.`
        : "Results library validation failed. Check the settings and records.",
    });
    return;
  }

  const { settings, results, statistics } = parsed.data;
  const resultIds = results.flatMap((result) => result.id ? [result.id] : []);
  const statisticIds = statistics.flatMap((statistic) => statistic.id ? [statistic.id] : []);
  const featuredResultOrders = results.filter((result) => result.showInHomePreview).map((result) => result.homePreviewOrder);
  const featuredStatisticOrders = statistics.filter((statistic) => statistic.showInHomePreview).map((statistic) => statistic.homePreviewOrder);
  const validationErrors: string[] = [];
  if (new Set(resultIds).size !== resultIds.length) validationErrors.push("Reload before saving duplicate result records.");
  if (new Set(results.map((result) => result.displayOrder)).size !== results.length) validationErrors.push("Each result needs a unique Results page order.");
  if (new Set(featuredResultOrders).size !== featuredResultOrders.length) validationErrors.push("Featured results need unique Home preview orders.");
  results.forEach((result, index) => {
    const label = `Result ${index + 1}`;
    if (!result.studentName.trim()) validationErrors.push(`${label}: enter a student name.`);
    if (!result.achievement.trim()) validationErrors.push(`${label}: enter an achievement.`);
    if (result.storyIsPublished && !result.story?.trim()) validationErrors.push(`${label}: enter a student story before publishing it.`);
    if (!isValidImageReference(result.studentImageUrl)) validationErrors.push(`${label}: use an HTTP(S) image URL or a stored image path.`);
    if (result.studentImageUrl !== null && !result.studentImageAltText.trim()) validationErrors.push(`${label}: enter image alt text.`);
  });
  if (new Set(statisticIds).size !== statisticIds.length) validationErrors.push("Reload before saving duplicate statistics.");
  if (new Set(statistics.map((statistic) => statistic.displayOrder)).size !== statistics.length) validationErrors.push("Each statistic needs a unique Results page order.");
  if (new Set(featuredStatisticOrders).size !== featuredStatisticOrders.length) validationErrors.push("Featured statistics need unique Home preview orders.");
  statistics.forEach((statistic, index) => {
    if (!statistic.label.trim()) validationErrors.push(`Statistic ${index + 1}: enter a label.`);
    if (!statistic.value.trim()) validationErrors.push(`Statistic ${index + 1}: enter a value.`);
  });

  if (validationErrors.length > 0) {
    req.log.warn({ validationErrors }, "Results library failed business validation");
    res.status(400).json({ error: validationErrors.join(" ") });
    return;
  }

  const normalizedSettings = {
    eyebrow: settings.eyebrow.trim(),
    heading: settings.heading.trim(),
    description: settings.description.trim(),
    configuredYear: settings.configuredYear?.trim() || null,
    isVisible: settings.isVisible,
    ctaHeading: settings.ctaHeading.trim(),
    ctaDescription: settings.ctaDescription.trim(),
    ctaPrimaryLabel: settings.ctaPrimaryLabel.trim(),
    ctaSecondaryLabel: settings.ctaSecondaryLabel.trim(),
    ctaPrimaryHref: settings.ctaPrimaryHref.trim(),
    ctaSecondaryHref: settings.ctaSecondaryHref.trim(),
    ctaIsVisible: settings.ctaIsVisible,
  };

  if (!normalizedSettings.eyebrow || !normalizedSettings.heading || !normalizedSettings.description) {
    res.status(400).json({ error: "Results page eyebrow, heading, and description are required." });
    return;
  }
  if (
    !normalizedSettings.ctaHeading ||
    !normalizedSettings.ctaDescription ||
    !normalizedSettings.ctaPrimaryLabel ||
    !normalizedSettings.ctaSecondaryLabel
  ) {
    res.status(400).json({ error: "Results page CTA heading, description, and button labels are required." });
    return;
  }
  if (
    !isValidContactDestination(normalizedSettings.ctaPrimaryHref) ||
    !isValidContactDestination(normalizedSettings.ctaSecondaryHref)
  ) {
    res.status(400).json({ error: "Results page CTA destinations must point to /contact, with an optional query or hash." });
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.homepageResults.upsert({
        where: { id: "singleton" },
        update: {},
        create: {
          id: "singleton",
          eyebrow: "Pride of Sahasrah",
          heading: "Our Results, Our Pride",
          description: "Explore approved student achievements from Sahsrah Junior College.",
          viewAllButtonLabel: "View All Achievements",
          viewAllButtonLink: "/results",
          isVisible: true,
          sortOrder: 6,
        },
      });
      await tx.resultsPageSettings.upsert({
        where: { id: "singleton" },
        update: normalizedSettings,
        create: { id: "singleton", ...normalizedSettings },
      });

      const currentResults = await tx.homepageResult.findMany({
        where: { homepageResultsId: "singleton" },
        select: { id: true },
      });
      const currentStatistics = await tx.homepageResultStatistic.findMany({
        where: { homepageResultsId: "singleton" },
        select: { id: true },
      });
      const currentResultIds = new Set(currentResults.map((result) => result.id));
      const currentStatisticIds = new Set(currentStatistics.map((statistic) => statistic.id));

      if (
        resultIds.some((id) => !currentResultIds.has(id)) ||
        statisticIds.some((id) => !currentStatisticIds.has(id))
      ) {
        throw new Error("The Results library changed in another session. Reload before saving.");
      }

      for (const [index, result] of currentResults.entries()) {
        await tx.homepageResult.update({
          where: { id: result.id },
          data: { displayOrder: -index - 1 },
        });
      }
      for (const [index, statistic] of currentStatistics.entries()) {
        await tx.homepageResultStatistic.update({
          where: { id: statistic.id },
          data: { displayOrder: -index - 1 },
        });
      }

      const keptResultIds = new Set(resultIds);
      const keptStatisticIds = new Set(statisticIds);
      await tx.homepageResult.deleteMany({
        where: {
          homepageResultsId: "singleton",
          ...(keptResultIds.size ? { id: { notIn: [...keptResultIds] } } : {}),
        },
      });
      await tx.homepageResultStatistic.deleteMany({
        where: {
          homepageResultsId: "singleton",
          ...(keptStatisticIds.size ? { id: { notIn: [...keptStatisticIds] } } : {}),
        },
      });

      for (const result of results) {
        const data = resultData(result);
        if (result.id) {
          await tx.homepageResult.update({ where: { id: result.id }, data });
        } else {
          await tx.homepageResult.create({ data });
        }
      }
      for (const statistic of statistics) {
        const data = statisticData(statistic);
        if (statistic.id) {
          await tx.homepageResultStatistic.update({ where: { id: statistic.id }, data });
        } else {
          await tx.homepageResultStatistic.create({ data });
        }
      }
    });

    const library = await readAdminLibrary();
    res.json(UpdateAdminResultsLibraryResponse.parse(library));
  } catch (error) {
    if (error instanceof Error && error.message.includes("changed in another session")) {
      res.status(409).json({ error: error.message });
      return;
    }
    req.log.error({ err: error }, "Unable to update the Results library");
    res.status(500).json({ error: "Unable to save the Results library." });
  }
});

export default router;