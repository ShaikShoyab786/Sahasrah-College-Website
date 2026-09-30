import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import * as Z from "@workspace/api-zod";
import { DEFAULT_KNOWLEDGE_HUB_EXAM_UPDATES_PAGE } from "../lib/knowledge-hub-exam-updates-content";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

type ExamUpdateRow = {
  id: string;
  title: string;
  exam: string;
  updateType: string;
  label: string;
  summary: string;
  fullNotice: string;
  publishedAt: Date | string | null;
  officialUrl: string;
  keywords: unknown;
  status: "draft" | "published" | "archived";
  isPinned: boolean;
  displayOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function dateIso(value: Date | string | null) {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function asRecord(row: ExamUpdateRow) {
  return {
    id: row.id,
    title: row.title,
    exam: row.exam,
    updateType: row.updateType,
    label: row.label,
    summary: row.summary,
    fullNotice: row.fullNotice,
    publishedAt: dateIso(row.publishedAt),
    officialUrl: row.officialUrl,
    keywords: Array.isArray(row.keywords)
      ? row.keywords.filter((keyword): keyword is string => typeof keyword === "string")
      : [],
    status: row.status,
    isPinned: row.isPinned,
    displayOrder: row.displayOrder,
    createdAt: dateIso(row.createdAt) ?? new Date(0).toISOString(),
    updatedAt: dateIso(row.updatedAt) ?? new Date(0).toISOString(),
  };
}

function isSafeImageUrl(value: string | null) {
  if (value === null) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.split("/").includes("..")) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isSafeCtaDestination(value: string) {
  if (value.startsWith("/")) {
    return !value.startsWith("//") && !value.includes("\\") && !/\s/.test(value);
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function validOfficialUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function publicationError(input: Z.KnowledgeHubExamUpdateInput) {
  if (input.officialUrl.trim() && !validOfficialUrl(input.officialUrl.trim())) {
    return "Official source links must be valid HTTPS URLs.";
  }
  if (input.status === "published") {
    if (!input.publishedAt) return "Add the publication date before publishing.";
    if (!input.officialUrl.trim() || !validOfficialUrl(input.officialUrl.trim())) {
      return "Add a valid HTTPS official-source URL before publishing.";
    }
  }
  return null;
}

async function pageSettings() {
  const rows = await prisma.$queryRawUnsafe<Array<{ content: unknown }>>(
    `SELECT "content" FROM "KnowledgeHubExamUpdatesPageSettings" WHERE "id" = 'singleton'`,
  );
  const stored = rows[0]?.content;
  return stored && typeof stored === "object" && !Array.isArray(stored)
    ? { ...DEFAULT_KNOWLEDGE_HUB_EXAM_UPDATES_PAGE, ...stored }
    : DEFAULT_KNOWLEDGE_HUB_EXAM_UPDATES_PAGE;
}

const publicWhere = `
  "status" = 'published'
  AND ($1::text = '' OR lower("exam") = lower($1::text))
  AND ($2::text = '' OR concat_ws(' ', "title", "summary", "fullNotice", "exam", "updateType", "label", "keywords"::text) ILIKE '%' || $2::text || '%')
`;

router.get("/knowledge-hub/exam-updates/page", async (req, res): Promise<void> => {
  try {
    res.json(Z.GetKnowledgeHubExamUpdatesPageResponse.parse(await pageSettings()));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read Exam Updates page settings");
    res.status(500).json({ error: "Unable to load Exam Updates page settings." });
  }
});

router.get("/knowledge-hub/exam-updates", async (req, res): Promise<void> => {
  const parsed = Z.GetKnowledgeHubExamUpdatesQueryParams.safeParse({
    search: typeof req.query.search === "string" ? req.query.search.trim() : "",
    exam: typeof req.query.exam === "string" ? req.query.exam.trim() : "",
    offset: req.query.offset === undefined ? 0 : Number(req.query.offset),
    limit: req.query.limit === undefined ? 100 : Number(req.query.limit),
  });
  if (!parsed.success) {
    res.status(400).json({ error: "Check the exam update search and filter." });
    return;
  }

  try {
    const { exam = "", search = "", offset, limit } = parsed.data;
    const [rows, counts] = await Promise.all([
      prisma.$queryRawUnsafe<ExamUpdateRow[]>(
        `SELECT * FROM "KnowledgeHubExamUpdate" WHERE ${publicWhere}
         ORDER BY "publishedAt" DESC NULLS LAST, "id" ASC
         OFFSET $3::integer LIMIT $4::integer`,
        exam,
        search,
        offset,
        limit,
      ),
      prisma.$queryRawUnsafe<Array<{ total: bigint }>>(
        `SELECT COUNT(*)::bigint AS total FROM "KnowledgeHubExamUpdate" WHERE ${publicWhere}`,
        exam,
        search,
      ),
    ]);
    const items = rows.map(asRecord);
    res.json(Z.GetKnowledgeHubExamUpdatesResponse.parse({
      items,
      total: Number(counts[0]?.total ?? 0),
      offset,
      limit,
      hasMore: offset + items.length < Number(counts[0]?.total ?? 0),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to search Exam Updates");
    res.status(500).json({ error: "Unable to load published exam updates." });
  }
});

router.get("/admin/knowledge-hub/exam-updates", requireAdmin, async (req, res): Promise<void> => {
  try {
    const [settings, rows] = await Promise.all([
      pageSettings(),
      prisma.$queryRawUnsafe<ExamUpdateRow[]>(
        `SELECT * FROM "KnowledgeHubExamUpdate"
         ORDER BY "isPinned" DESC, "displayOrder" ASC, "updatedAt" DESC`,
      ),
    ]);
    res.json(Z.GetAdminKnowledgeHubExamUpdatesResponse.parse({
      settings,
      updates: rows.map(asRecord),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read Exam Updates administration content");
    res.status(500).json({ error: "Unable to load Exam Updates management content." });
  }
});

router.put("/admin/knowledge-hub/exam-updates/page", requireAdmin, async (req, res): Promise<void> => {
  const parsed = Z.UpdateAdminKnowledgeHubExamUpdatesPageBody.safeParse(req.body);
  if (!parsed.success || !isSafeImageUrl(parsed.data?.heroBackgroundImageUrl ?? null) || !isSafeImageUrl(parsed.data?.ctaBackgroundImageUrl ?? null)) {
    res.status(400).json({ error: "Check the page settings and image URLs." });
    return;
  }
  if (
    !parsed.data.ctaHeading.trim() ||
    !parsed.data.ctaDescription.trim() ||
    !parsed.data.ctaButtonLabel.trim() ||
    !isSafeCtaDestination(parsed.data.ctaButtonHref.trim())
  ) {
    res.status(400).json({ error: "Add CTA text and a valid site path or HTTPS button destination." });
    return;
  }
  const uniqueFilters = [...new Set(parsed.data.examFilters.map((filter) => filter.trim()).filter(Boolean))];
  if (!uniqueFilters.length || uniqueFilters.length !== parsed.data.examFilters.length) {
    res.status(400).json({ error: "Exam filters must be non-empty and unique." });
    return;
  }
  const settings = {
    ...parsed.data,
    examFilters: uniqueFilters,
    ctaHeading: parsed.data.ctaHeading.trim(),
    ctaDescription: parsed.data.ctaDescription.trim(),
    ctaButtonLabel: parsed.data.ctaButtonLabel.trim(),
    ctaButtonHref: parsed.data.ctaButtonHref.trim(),
    ctaBackgroundImageUrl: parsed.data.ctaBackgroundImageUrl?.trim() || null,
  };
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "KnowledgeHubExamUpdatesPageSettings" ("id", "content", "createdAt", "updatedAt")
       VALUES ('singleton', $1::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT ("id") DO UPDATE SET "content" = EXCLUDED."content", "updatedAt" = CURRENT_TIMESTAMP`,
      JSON.stringify(settings),
    );
    res.json(Z.UpdateAdminKnowledgeHubExamUpdatesPageResponse.parse(settings));
  } catch (error) {
    req.log.error({ err: error }, "Unable to save Exam Updates page settings");
    res.status(500).json({ error: "Unable to save Exam Updates page settings." });
  }
});

async function saveUpdate(input: Z.KnowledgeHubExamUpdateInput, id: string | null) {
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
  const values = [
    id ?? randomUUID(),
    input.title.trim(),
    input.exam.trim(),
    input.updateType.trim(),
    input.label.trim(),
    input.summary.trim(),
    input.fullNotice.trim(),
    publishedAt,
    input.officialUrl.trim(),
    JSON.stringify(input.keywords.map((keyword) => keyword.trim()).filter(Boolean)),
    input.status,
    input.isPinned,
    input.displayOrder,
  ];
  const statement = id
    ? `UPDATE "KnowledgeHubExamUpdate" SET
         "title" = $2, "exam" = $3, "updateType" = $4, "label" = $5, "summary" = $6,
         "fullNotice" = $7, "publishedAt" = $8, "officialUrl" = $9, "keywords" = $10::jsonb,
         "status" = $11, "isPinned" = $12, "displayOrder" = $13, "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $1 RETURNING *`
    : `INSERT INTO "KnowledgeHubExamUpdate"
         ("id", "title", "exam", "updateType", "label", "summary", "fullNotice", "publishedAt",
          "officialUrl", "keywords", "status", "isPinned", "displayOrder", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`;
  const rows = await prisma.$queryRawUnsafe<ExamUpdateRow[]>(statement, ...values);
  return rows[0] ?? null;
}

router.post("/admin/knowledge-hub/exam-updates", requireAdmin, async (req, res): Promise<void> => {
  const parsed = Z.CreateAdminKnowledgeHubExamUpdateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the exam update fields." });
    return;
  }
  const invalidPublication = publicationError(parsed.data);
  if (invalidPublication) {
    res.status(400).json({ error: invalidPublication });
    return;
  }
  try {
    const row = await saveUpdate(parsed.data, null);
    res.status(201).json(Z.CreateAdminKnowledgeHubExamUpdateResponse.parse(row ? asRecord(row) : null));
  } catch (error) {
    req.log.error({ err: error }, "Unable to create Exam Update");
    res.status(500).json({ error: "Unable to save this exam update." });
  }
});

router.put("/admin/knowledge-hub/exam-updates/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = Z.UpdateAdminKnowledgeHubExamUpdateParams.safeParse(req.params);
  const parsed = Z.UpdateAdminKnowledgeHubExamUpdateBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Check the exam update fields." });
    return;
  }
  const invalidPublication = publicationError(parsed.data);
  if (invalidPublication) {
    res.status(400).json({ error: invalidPublication });
    return;
  }
  try {
    const row = await saveUpdate(parsed.data, params.data.id);
    if (!row) {
      res.status(404).json({ error: "Exam update not found." });
      return;
    }
    res.json(Z.UpdateAdminKnowledgeHubExamUpdateResponse.parse(asRecord(row)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update Exam Update");
    res.status(500).json({ error: "Unable to save this exam update." });
  }
});

router.delete("/admin/knowledge-hub/exam-updates/:id", requireAdmin, async (req, res): Promise<void> => {
  const parsed = Z.DeleteAdminKnowledgeHubExamUpdateParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid exam update." });
    return;
  }
  try {
    const count = await prisma.$executeRawUnsafe(
      `DELETE FROM "KnowledgeHubExamUpdate" WHERE "id" = $1`,
      parsed.data.id,
    );
    if (count === 0) {
      res.status(404).json({ error: "Exam update not found." });
      return;
    }
    res.status(204).end();
  } catch (error) {
    req.log.error({ err: error }, "Unable to delete Exam Update");
    res.status(500).json({ error: "Unable to delete this exam update." });
  }
});

export default router;