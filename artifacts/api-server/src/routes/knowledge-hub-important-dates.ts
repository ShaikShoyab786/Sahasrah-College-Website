import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import * as Z from "@workspace/api-zod";
import { DEFAULT_KNOWLEDGE_HUB_IMPORTANT_DATES_SETTINGS } from "../lib/knowledge-hub-important-dates-content";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

type MilestoneRow = {
  id: string;
  exam: string;
  cycleYear: string;
  title: string;
  milestoneType: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
  officialUrl: string | null;
  eventStatusOverride: "automatic" | "postponed" | "cancelled";
  status: "draft" | "published" | "archived";
  displayOrder: number;
  isDemo: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function timestamp(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function asMilestone(row: MilestoneRow) {
  return {
    id: row.id,
    exam: row.exam,
    cycleYear: row.cycleYear,
    title: row.title,
    milestoneType: row.milestoneType,
    startDate: row.startDate,
    endDate: row.endDate,
    description: row.description,
    officialUrl: row.officialUrl,
    eventStatusOverride: row.eventStatusOverride,
    status: row.status,
    displayOrder: row.displayOrder,
    isDemo: row.isDemo,
    createdAt: timestamp(row.createdAt),
    updatedAt: timestamp(row.updatedAt),
  };
}

async function importantDatesSettings() {
  const rows = await prisma.$queryRawUnsafe<Array<{ content: unknown }>>(
    `SELECT "content" FROM "KnowledgeHubExamUpdatesImportantDatesSettings" WHERE "id" = 'singleton'`,
  );
  const settings = rows[0]?.content;
  return settings && typeof settings === "object" && !Array.isArray(settings)
    ? settings
    : DEFAULT_KNOWLEDGE_HUB_IMPORTANT_DATES_SETTINGS;
}

const milestoneColumns = `
  "id", "exam", "cycleYear", "title", "milestoneType",
  to_char("startDate", 'YYYY-MM-DD') AS "startDate",
  to_char("endDate", 'YYYY-MM-DD') AS "endDate",
  "description", "officialUrl", "eventStatusOverride", "status",
  "displayOrder", "isDemo", "createdAt", "updatedAt"
`;

function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  return day <= daysInMonth;
}

function validOfficialUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function sourceIsAuthoritativeForExam(exam: string, value: string) {
  let hostname: string;
  try {
    hostname = new URL(value).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return false;
  }
  const isOrSubdomainOf = (domain: string) => hostname === domain || hostname.endsWith(`.${domain}`);
  if (exam === "JEE" || exam === "NEET") return isOrSubdomainOf("nta.ac.in");
  if (exam === "Intermediate") {
    return [
      "bie.ap.gov.in",
      "bieap.gov.in",
      "bie.apcfss.in",
      "bieap.apcfss.in",
    ].some(isOrSubdomainOf);
  }
  if (exam === "EAMCET") return isOrSubdomainOf("apsche.ap.gov.in");
  return ["gov.in", "nic.in", "ac.in", "edu.in"].some(isOrSubdomainOf);
}

function containsDemoMarker(input: Z.KnowledgeHubExamUpdatesImportantDatesMilestoneInput) {
  const marker = /\b(?:demo|sample|placeholder|example)\b|replace\s+with/iu;
  return [input.title, input.milestoneType, input.description, input.cycleYear].some((value) => marker.test(value));
}

function milestoneValidationError(input: Z.KnowledgeHubExamUpdatesImportantDatesMilestoneInput) {
  const startDate = input.startDate ?? null;
  const endDate = input.endDate ?? null;
  const officialUrl = input.officialUrl?.trim() || null;
  if (!input.cycleYear.trim() || !input.title.trim() || !input.milestoneType.trim()) {
    return "Cycle year, title, and milestone type must not be empty.";
  }
  if (startDate && !isRealDate(startDate)) return "Start date must be a real calendar date in YYYY-MM-DD format.";
  if (endDate && !isRealDate(endDate)) return "End date must be a real calendar date in YYYY-MM-DD format.";
  if (startDate && endDate && endDate < startDate) return "End date cannot be before the start date.";
  if (officialUrl && !validOfficialUrl(officialUrl)) return "Official source links must be valid HTTPS URLs without credentials.";
  if (input.status === "published") {
    if (input.isDemo) return "Demo milestones cannot be published.";
    if (containsDemoMarker(input)) {
      return "Remove demo, sample, example, or placeholder markers before publishing this milestone.";
    }
    if (!startDate) return "Add a valid start date before publishing.";
    if (!officialUrl) return "Add a valid HTTPS official-source URL before publishing.";
    if (!sourceIsAuthoritativeForExam(input.exam, officialUrl)) {
      const sourceGuidance: Record<string, string> = {
        JEE: "JEE sources must be on nta.ac.in.",
        NEET: "NEET sources must be on nta.ac.in.",
        Intermediate: "Intermediate sources must be on an official BIEAP domain.",
        EAMCET: "EAMCET sources must be on an APSCHE domain.",
        "Other Exams": "Other Exams sources must use an Indian government or academic domain (.gov.in, .nic.in, .ac.in, or .edu.in).",
      };
      return sourceGuidance[input.exam] ?? "Use an authoritative official source domain for this exam.";
    }
  }
  return null;
}

async function saveMilestone(
  input: Z.KnowledgeHubExamUpdatesImportantDatesMilestoneInput,
  id: string | null,
) {
  const values = [
    id ?? randomUUID(),
    input.exam,
    input.cycleYear.trim(),
    input.title.trim(),
    input.milestoneType.trim(),
    input.startDate ?? null,
    input.endDate ?? null,
    input.description.trim(),
    input.officialUrl?.trim() || null,
    input.eventStatusOverride,
    input.status,
    input.displayOrder,
    input.isDemo,
  ];
  const statement = id
    ? `UPDATE "KnowledgeHubExamUpdatesImportantDateMilestone" SET
         "exam" = $2, "cycleYear" = $3, "title" = $4, "milestoneType" = $5,
         "startDate" = $6::date, "endDate" = $7::date, "description" = $8,
         "officialUrl" = $9, "eventStatusOverride" = $10, "status" = $11,
         "displayOrder" = $12, "isDemo" = $13, "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $1 RETURNING ${milestoneColumns}`
    : `INSERT INTO "KnowledgeHubExamUpdatesImportantDateMilestone"
         ("id", "exam", "cycleYear", "title", "milestoneType", "startDate", "endDate",
          "description", "officialUrl", "eventStatusOverride", "status", "displayOrder", "isDemo",
          "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6::date, $7::date, $8, $9, $10, $11, $12, $13,
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING ${milestoneColumns}`;
  const rows = await prisma.$queryRawUnsafe<MilestoneRow[]>(statement, ...values);
  return rows[0] ?? null;
}

router.get("/knowledge-hub/exam-updates/important-dates", async (req, res): Promise<void> => {
  try {
    const settings = await importantDatesSettings();
    const parsedSettings = Z.GetKnowledgeHubExamUpdatesImportantDatesResponse.shape.settings.parse(settings);
    const rows = parsedSettings.visible
      ? await prisma.$queryRawUnsafe<MilestoneRow[]>(
          `SELECT ${milestoneColumns} FROM "KnowledgeHubExamUpdatesImportantDateMilestone"
           WHERE "status" = 'published' AND "isDemo" = false
           ORDER BY "exam" ASC, "cycleYear" ASC, "startDate" ASC NULLS LAST, "displayOrder" ASC`,
        )
      : [];
    res.json(Z.GetKnowledgeHubExamUpdatesImportantDatesResponse.parse({
      settings: parsedSettings,
      milestones: rows.map(asMilestone),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read public Important Dates");
    res.status(500).json({ error: "Unable to load Important Dates." });
  }
});

router.get("/admin/knowledge-hub/exam-updates/important-dates", requireAdmin, async (req, res): Promise<void> => {
  try {
    const [settings, rows] = await Promise.all([
      importantDatesSettings(),
      prisma.$queryRawUnsafe<MilestoneRow[]>(
        `SELECT ${milestoneColumns} FROM "KnowledgeHubExamUpdatesImportantDateMilestone"
         ORDER BY "displayOrder" ASC`,
      ),
    ]);
    res.json(Z.GetAdminKnowledgeHubExamUpdatesImportantDatesResponse.parse({
      settings,
      milestones: rows.map(asMilestone),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read Important Dates administration content");
    res.status(500).json({ error: "Unable to load Important Dates management content." });
  }
});

router.put(
  "/admin/knowledge-hub/exam-updates/important-dates/settings",
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = Z.UpdateAdminKnowledgeHubExamUpdatesImportantDatesSettingsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Check the Important Dates settings." });
      return;
    }
    const labels = Object.values(parsed.data.examLabels).map((label) => label.trim());
    if (labels.some((label) => !label)) {
      res.status(400).json({ error: "Exam labels must not be empty." });
      return;
    }
    if (!parsed.data.heading.trim()) {
      res.status(400).json({ error: "The Important Dates heading must not be empty." });
      return;
    }
    const settings = {
      ...parsed.data,
      heading: parsed.data.heading.trim(),
      description: parsed.data.description.trim(),
      examLabels: Object.fromEntries(
        Object.entries(parsed.data.examLabels).map(([exam, label]) => [exam, label.trim()]),
      ),
    };
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "KnowledgeHubExamUpdatesImportantDatesSettings" ("id", "content", "createdAt", "updatedAt")
         VALUES ('singleton', $1::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT ("id") DO UPDATE SET "content" = EXCLUDED."content", "updatedAt" = CURRENT_TIMESTAMP`,
        JSON.stringify(settings),
      );
      res.json(Z.UpdateAdminKnowledgeHubExamUpdatesImportantDatesSettingsResponse.parse(settings));
    } catch (error) {
      req.log.error({ err: error }, "Unable to save Important Dates settings");
      res.status(500).json({ error: "Unable to save Important Dates settings." });
    }
  },
);

router.post("/admin/knowledge-hub/exam-updates/important-dates", requireAdmin, async (req, res): Promise<void> => {
  const parsed = Z.CreateAdminKnowledgeHubExamUpdatesImportantDatesMilestoneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the milestone fields." });
    return;
  }
  const invalid = milestoneValidationError(parsed.data);
  if (invalid) {
    res.status(400).json({ error: invalid });
    return;
  }
  try {
    const row = await saveMilestone(parsed.data, null);
    res.status(201).json(Z.CreateAdminKnowledgeHubExamUpdatesImportantDatesMilestoneResponse.parse(row ? asMilestone(row) : null));
  } catch (error) {
    req.log.error({ err: error }, "Unable to create Important Dates milestone");
    res.status(500).json({ error: "Unable to save this milestone." });
  }
});

router.put(
  "/admin/knowledge-hub/exam-updates/important-dates/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = Z.UpdateAdminKnowledgeHubExamUpdatesImportantDatesMilestoneParams.safeParse(req.params);
    const parsed = Z.UpdateAdminKnowledgeHubExamUpdatesImportantDatesMilestoneBody.safeParse(req.body);
    if (!params.success || !parsed.success) {
      res.status(400).json({ error: "Check the milestone fields." });
      return;
    }
    const invalid = milestoneValidationError(parsed.data);
    if (invalid) {
      res.status(400).json({ error: invalid });
      return;
    }
    try {
      const row = await saveMilestone(parsed.data, params.data.id);
      if (!row) {
        res.status(404).json({ error: "Milestone not found." });
        return;
      }
      res.json(Z.UpdateAdminKnowledgeHubExamUpdatesImportantDatesMilestoneResponse.parse(asMilestone(row)));
    } catch (error) {
      req.log.error({ err: error }, "Unable to update Important Dates milestone");
      res.status(500).json({ error: "Unable to save this milestone." });
    }
  },
);

router.delete(
  "/admin/knowledge-hub/exam-updates/important-dates/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = Z.DeleteAdminKnowledgeHubExamUpdatesImportantDatesMilestoneParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid milestone." });
      return;
    }
    try {
      const count = await prisma.$executeRawUnsafe(
        `DELETE FROM "KnowledgeHubExamUpdatesImportantDateMilestone" WHERE "id" = $1`,
        parsed.data.id,
      );
      if (count === 0) {
        res.status(404).json({ error: "Milestone not found." });
        return;
      }
      res.status(204).end();
    } catch (error) {
      req.log.error({ err: error }, "Unable to delete Important Dates milestone");
      res.status(500).json({ error: "Unable to delete this milestone." });
    }
  },
);

export default router;