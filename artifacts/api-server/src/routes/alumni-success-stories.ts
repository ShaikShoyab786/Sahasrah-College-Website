import { Router, type IRouter } from "express";
import { Prisma } from "@prisma/client";
import {
  GetAdminAlumniSuccessStoriesResponse,
  UpdateAdminAlumniSuccessStoriesBody,
  UpdateAdminAlumniSuccessStoriesResponse,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

type StoryPayload = ReturnType<typeof UpdateAdminAlumniSuccessStoriesBody.parse>["alumniStories"][number];

class StaleAlumniStoriesRevisionError extends Error {}

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

function storyData(story: StoryPayload): Prisma.AlumniSuccessStoryUncheckedCreateInput {
  return {
    displayName: story.displayName.trim(),
    portraitUrl: story.portraitUrl?.trim() || null,
    portraitAltText: story.portraitAltText?.trim() || null,
    passingYear: story.passingYear?.trim() || null,
    course: story.course?.trim() || null,
    currentOutcome: story.currentOutcome?.trim() || null,
    story: story.story.trim(),
    isPublished: story.isPublished,
    displayOrder: story.displayOrder,
  };
}

async function readStories() {
  return prisma.$transaction(async (tx) => {
    const collection = await tx.alumniSuccessStoriesRevision.findUnique({
      where: { id: "singleton" },
      select: { revision: true },
    });
    const alumniStories = await tx.alumniSuccessStory.findMany({
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    });
    if (!collection) throw new Error("Alumni stories revision record is not initialized.");
    return { revision: collection.revision, alumniStories };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, maxWait: 10_000, timeout: 30_000 });
}

router.get("/admin/results/alumni-stories", requireAdmin, async (req, res): Promise<void> => {
  try {
    res.json(GetAdminAlumniSuccessStoriesResponse.parse(await readStories()));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read alumni success stories");
    res.status(500).json({ error: "Unable to load alumni success stories." });
  }
});

router.put("/admin/results/alumni-stories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminAlumniSuccessStoriesBody.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.slice(0, 5).map((issue) => {
      const path = issue.path
        .map((part) => typeof part === "number" ? `story ${part + 1}` : String(part))
        .join(".");
      return `${path || "request"}: ${issue.message}`;
    });
    req.log.warn(
      { validationIssues: parsed.error.issues.map(({ path, code }) => ({ path, code })) },
      "Invalid alumni success stories input",
    );
    res.status(400).json({ error: `Alumni stories validation failed. ${details.join("; ")}` });
    return;
  }

  const { alumniStories, expectedRevision } = parsed.data;
  const validationErrors: string[] = [];
  const ids = alumniStories.flatMap((story) => story.id ? [story.id] : []);
  const orders = alumniStories.map((story) => story.displayOrder);
  if (new Set(ids).size !== ids.length) validationErrors.push("Reload before saving duplicate alumni story records.");
  if (new Set(orders).size !== orders.length) validationErrors.push("Each alumni story needs a unique carousel order.");
  alumniStories.forEach((story, index) => {
    const label = `Alumni story ${index + 1}`;
    if (story.isPublished && !story.displayName.trim()) validationErrors.push(`${label}: enter a display name before publishing.`);
    if (story.isPublished && !story.story.trim()) validationErrors.push(`${label}: enter story text before publishing.`);
    if (!isValidImageReference(story.portraitUrl)) validationErrors.push(`${label}: use an HTTP(S) portrait URL or a stored image path.`);
    if (story.portraitUrl && !story.portraitAltText?.trim()) validationErrors.push(`${label}: enter portrait alt text.`);
    if (!story.portraitUrl && story.portraitAltText?.trim()) validationErrors.push(`${label}: remove portrait alt text when no portrait is provided.`);
  });

  if (validationErrors.length > 0) {
    req.log.warn({ validationErrors }, "Alumni stories failed business validation");
    res.status(400).json({ error: validationErrors.join(" ") });
    return;
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 AS locked FROM (SELECT pg_advisory_xact_lock(74130105)) AS lock`;
      const revisionUpdate = await tx.alumniSuccessStoriesRevision.updateMany({
        where: { id: "singleton", revision: expectedRevision },
        data: { revision: { increment: 1 } },
      });
      if (revisionUpdate.count !== 1) {
        throw new StaleAlumniStoriesRevisionError(
          "Alumni stories have changed since this library was loaded. Reload before saving.",
        );
      }

      const current = await tx.alumniSuccessStory.findMany({ select: { id: true } });
      const currentIds = new Set(current.map((story) => story.id));
      if (ids.some((id) => !currentIds.has(id))) {
        throw new StaleAlumniStoriesRevisionError(
          "Alumni stories have changed since this library was loaded. Reload before saving.",
        );
      }

      for (const [index, story] of current.entries()) {
        await tx.alumniSuccessStory.update({
          where: { id: story.id },
          data: { displayOrder: -100001 - index },
        });
      }

      const keptIds = new Set(ids);
      await tx.alumniSuccessStory.deleteMany({
        where: keptIds.size ? { id: { notIn: [...keptIds] } } : {},
      });

      for (const story of alumniStories) {
        const data = storyData(story);
        if (story.id) {
          await tx.alumniSuccessStory.update({ where: { id: story.id }, data });
        } else {
          await tx.alumniSuccessStory.create({ data });
        }
      }
      return readStoriesInTransaction(tx, expectedRevision + 1);
    }, { maxWait: 10_000, timeout: 30_000 });

    res.json(UpdateAdminAlumniSuccessStoriesResponse.parse(updated));
  } catch (error) {
    if (error instanceof StaleAlumniStoriesRevisionError) {
      res.status(409).json({ error: error.message });
      return;
    }
    req.log.error({ err: error }, "Unable to update alumni success stories");
    res.status(500).json({ error: "Unable to save alumni success stories." });
  }
});

async function readStoriesInTransaction(
  tx: Prisma.TransactionClient,
  revision: number,
) {
  const alumniStories = await tx.alumniSuccessStory.findMany({
    orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
  });
  return { revision, alumniStories };
}

export default router;