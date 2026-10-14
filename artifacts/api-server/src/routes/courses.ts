import { Prisma, type Course, type FacultyMember } from "@prisma/client";
import { Readable } from "node:stream";
import { Router, type IRouter, type Response } from "express";
import {
  DownloadCourseCurriculumParams,
  GetAdminCoursesResponse,
  GetCourseBySlugParams,
  GetCourseBySlugResponse,
  GetCoursesResponse,
  RequestCourseCurriculumUploadUrlBody,
  RequestCourseCurriculumUploadUrlParams,
  RequestCourseCurriculumUploadUrlResponse,
  UpdateAdminCourseBody,
  UpdateAdminCourseParams,
  UpdateAdminCourseResponse,
} from "@workspace/api-zod";
import { COURSE_SEEDS, COURSE_SUBJECTS, normalizeCourseHighlights, normalizeTeachingSubject, type CourseSlug, type CourseSyllabus } from "../lib/course-content";
import { prisma } from "../lib/prisma";
import { ObjectNotFoundError, ObjectStorageService } from "../lib/objectStorage";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();
const MAX_CURRICULUM_PDF_BYTES = 20 * 1024 * 1024;

function courseDownloadUrl(slug: string) {
  return `/api/courses/${slug}/curriculum.pdf`;
}

function toAdminCourse(course: Course) {
  const seed = COURSE_SEEDS.find((item) => item.slug === course.slug);
  return {
    slug: course.slug,
    name: course.name,
    displayOrder: course.displayOrder,
    durationLabel: course.durationLabel,
    modeLabel: course.modeLabel,
    heroBackgroundImageUrl: course.heroBackgroundImageUrl,
    heroBackgroundOverlay: course.heroBackgroundOverlay,
    heroEyebrow: course.heroEyebrow,
    heroTitle: course.heroTitle,
    heroDescription: course.heroDescription,
    primaryActionLabel: course.primaryActionLabel,
    primaryActionUrl: course.primaryActionUrl,
    secondaryActionLabel: course.secondaryActionLabel,
    secondaryActionUrl: course.secondaryActionUrl,
    highlightsEyebrow: course.highlightsEyebrow || seed?.highlightsEyebrow || "Quick Overview",
    highlightsHeading: course.highlightsHeading || "Quick Course Highlights",
    highlightsIntroduction: course.highlightsIntroduction || seed?.highlightsIntroduction || "",
    highlights: normalizeCourseHighlights(course.highlights, seed?.highlights ?? []),
    overviewText: course.overviewText,
    programGoals: course.programGoals,
    idealProfileTitle: course.idealProfileTitle,
    idealProfileDescription: course.idealProfileDescription,
    idealProfileIndicators: course.idealProfileIndicators,
    syllabus: course.syllabus,
    curriculumPdfObjectPath: course.curriculumPdfObjectPath,
    curriculumPdfFileName: course.curriculumPdfFileName,
    curriculumPdfIsSample: course.curriculumPdfObjectPath === null,
    curriculumDownloadUrl: courseDownloadUrl(course.slug),
    updatedAt: course.updatedAt.toISOString(),
  };
}

function isCourseSlug(value: string): value is CourseSlug {
  return Object.prototype.hasOwnProperty.call(COURSE_SUBJECTS, value);
}

function matchingMentors(members: FacultyMember[], slug: CourseSlug) {
  const subjectSet = new Set(COURSE_SUBJECTS[slug].map(normalizeTeachingSubject));
  const seen = new Set<string>();

  return members.flatMap((member) => {
    if (!member.showOnCourses || seen.has(member.id)) return [];
    const matches = member.teachingSubjects.some((subject) =>
      subjectSet.has(normalizeTeachingSubject(subject)),
    );
    if (!matches) return [];
    seen.add(member.id);
    return [{
      id: member.id,
      imageUrl: member.imageUrl,
      imageAltText: member.imageAltText,
      name: member.name,
      role: member.role,
      subject: member.subject,
      teachingSubjects: member.teachingSubjects,
      qualification: member.qualification,
      experience: member.experience,
      biography: member.biography,
    }];
  });
}

function toPublicCourse(course: Course, mentors: FacultyMember[], slug: CourseSlug) {
  const {
    curriculumPdfObjectPath: _privateObjectPath,
    ...publicContent
  } = toAdminCourse(course);

  return {
    ...publicContent,
    mentors: matchingMentors(mentors, slug),
  };
}

function isSafeActionUrl(value: string) {
  if (/^#[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(value)) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isSafeCourseImageUrl(value: string | null) {
  if (value === null) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.split("/").includes("..")) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  } catch {
    return false;
  }
}

function hasValidCourseHighlightOrder(highlights: Array<{ displayOrder: number }>) {
  return highlights.length === 4 &&
    new Set(highlights.map((highlight) => highlight.displayOrder)).size === 4 &&
    highlights.every((highlight) => Number.isInteger(highlight.displayOrder) && highlight.displayOrder >= 1 && highlight.displayOrder <= 4);
}

function isSafeObjectPath(value: string | null) {
  return value === null ||
    (value.startsWith("/objects/uploads/") &&
      !value.includes("..") &&
      /^[a-zA-Z0-9/_-]+$/.test(value));
}

function sanitizePdfFileName(value: string, fallback: string) {
  const basename = value.split(/[\\/]/).pop() ?? "";
  const safeName = basename
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._ -]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return safeName.toLowerCase().endsWith(".pdf") ? safeName : fallback;
}

function escapePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfLine(value: string, maxLength = 86) {
  const words = escapePdfText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function buildSampleCurriculumPdf(course: Course) {
  const syllabus = Array.isArray(course.syllabus)
    ? (course.syllabus as Prisma.JsonArray).flatMap((entry): CourseSyllabus[] => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
      const subject = entry.subject;
      const topics = entry.topics;
      if (typeof subject !== "string" || !Array.isArray(topics)) return [];
      return [{
        subject,
        topics: topics.filter((topic): topic is string => typeof topic === "string"),
      }];
    })
    : [];

  const textRows: Array<{ text: string; fontSize: number }> = [];
  const add = (text: string, fontSize = 11) => {
    wrapPdfLine(text).forEach((line) => textRows.push({ text: line, fontSize }));
  };

  add("Sahsrah Junior College", 18);
  add(course.name, 15);
  add("SAMPLE CURRICULUM - REPLACE WITH APPROVED PDF", 11);
  add("This replaceable sample is not an official or verified curriculum.", 10);
  add("");
  add("Subject breakdown and topic keywords", 12);
  add("");
  for (const subject of syllabus) {
    add(subject.subject, 12);
    for (const topic of subject.topics) add(`- ${topic}`, 10);
    add("");
  }
  add("Please replace this sample with an approved curriculum PDF when available.", 10);

  const pages: typeof textRows[] = [];
  for (let index = 0; index < textRows.length; index += 36) {
    pages.push(textRows.slice(index, index + 36));
  }
  if (pages.length === 0) pages.push([]);

  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pages.map((_, index) => `${4 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  pages.forEach((pageLines, index) => {
    const pageObjectId = 4 + index * 2;
    const streamObjectId = pageObjectId + 1;
    let y = 756;
    const commands = pageLines.map((line) => {
      const command = `BT /F1 ${line.fontSize} Tf 48 ${y} Td (${line.text}) Tj ET`;
      y -= line.fontSize >= 15 ? 28 : 19;
      return command;
    }).join("\n");
    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamObjectId} 0 R >>`;
    objects[streamObjectId] =
      `<< /Length ${Buffer.byteLength(commands, "ascii")} >>\nstream\n${commands}\nendstream`;
  });

  let document = "%PDF-1.4\n";
  const offsets = [0];
  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    offsets[objectId] = Buffer.byteLength(document, "ascii");
    document += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(document, "ascii");
  document += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    document += `${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`;
  }
  document += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(document, "ascii");
}

function sendPdf(res: Response, pdf: Buffer, fileName: string) {
  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", String(pdf.length));
  res.setHeader("Cache-Control", "public, max-age=300");
  res.end(pdf);
}

router.get("/courses", async (req, res): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({ orderBy: [{ displayOrder: "asc" }, { slug: "asc" }] });
    res.json(GetCoursesResponse.parse(courses.map((course) => ({
      slug: course.slug,
      name: course.name,
      displayOrder: course.displayOrder,
      heroEyebrow: course.heroEyebrow,
      heroTitle: course.heroTitle,
      heroDescription: course.heroDescription,
    }))));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read course overview");
    res.status(500).json({ error: "Unable to load courses." });
  }
});

router.get("/courses/:slug/curriculum.pdf", async (req, res): Promise<void> => {
  const params = DownloadCourseCurriculumParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Course not found." });
    return;
  }

  try {
    const course = await prisma.course.findUnique({ where: { slug: params.data.slug } });
    if (!course) {
      res.status(404).json({ error: "Course not found." });
      return;
    }

    if (!course.curriculumPdfObjectPath) {
      sendPdf(
        res,
        buildSampleCurriculumPdf(course),
        `sample-${course.slug}-curriculum.pdf`,
      );
      return;
    }

    const file = await objectStorage.getObjectEntityFile(course.curriculumPdfObjectPath);
    const [header] = await file.download({ start: 0, end: 4 });
    if (header.subarray(0, 5).toString("ascii") !== "%PDF-") {
      req.log.error({ slug: course.slug }, "Stored course curriculum is not a valid PDF");
      res.status(404).json({ error: "The saved curriculum PDF is unavailable." });
      return;
    }
    const response = await objectStorage.downloadObject(file, 300);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${sanitizePdfFileName(course.curriculumPdfFileName ?? "", `${course.slug}-curriculum.pdf`)}"`,
    );
    res.setHeader("Cache-Control", "public, max-age=300");
    if (response.body) {
      Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.error({ err: error, slug: params.data.slug }, "Saved course curriculum PDF is missing");
      res.status(404).json({ error: "The saved curriculum PDF is unavailable." });
      return;
    }
    req.log.error({ err: error, slug: params.data.slug }, "Unable to download course curriculum");
    res.status(500).json({ error: "Unable to download this curriculum PDF." });
  }
});

router.get("/courses/:slug", async (req, res): Promise<void> => {
  const params = GetCourseBySlugParams.safeParse(req.params);
  if (!params.success || !isCourseSlug(params.data.slug)) {
    res.status(404).json({ error: "Course not found." });
    return;
  }

  try {
    const [course, mentors] = await Promise.all([
      prisma.course.findUnique({ where: { slug: params.data.slug } }),
      prisma.facultyMember.findMany({
        where: { showOnCourses: true },
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      }),
    ]);
    if (!course) {
      res.status(404).json({ error: "Course not found." });
      return;
    }
    res.json(GetCourseBySlugResponse.parse(toPublicCourse(course, mentors, params.data.slug)));
  } catch (error) {
    req.log.error({ err: error, slug: params.data.slug }, "Unable to read course detail");
    res.status(500).json({ error: "Unable to load this course." });
  }
});

router.get("/admin/courses", requireAdmin, async (req, res): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({ orderBy: [{ displayOrder: "asc" }, { slug: "asc" }] });
    res.json(GetAdminCoursesResponse.parse(courses.map(toAdminCourse)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin course content");
    res.status(500).json({ error: "Unable to load course content." });
  }
});

router.put("/admin/courses/:slug", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminCourseParams.safeParse(req.params);
  const parsed = UpdateAdminCourseBody.safeParse(req.body);
  if (
    !params.success ||
    !parsed.success ||
    !hasValidCourseHighlightOrder(parsed.data?.highlights ?? []) ||
    !isSafeActionUrl(parsed.data?.primaryActionUrl ?? "") ||
    !isSafeActionUrl(parsed.data?.secondaryActionUrl ?? "") ||
    !isSafeCourseImageUrl(parsed.data?.heroBackgroundImageUrl ?? null) ||
    !isSafeObjectPath(parsed.data?.curriculumPdfObjectPath ?? null) ||
    Boolean(parsed.data?.curriculumPdfObjectPath) !== Boolean(parsed.data?.curriculumPdfFileName) ||
    (parsed.data?.curriculumPdfFileName !== null &&
      parsed.data?.curriculumPdfFileName !== undefined &&
      !parsed.data.curriculumPdfFileName.toLowerCase().endsWith(".pdf"))
  ) {
    res.status(400).json({ error: "Check the course content, actions, and PDF details." });
    return;
  }

  try {
    const existingCourse = await prisma.course.findUnique({ where: { slug: params.data.slug } });
    if (!existingCourse) {
      res.status(404).json({ error: "Course not found." });
      return;
    }
    const newPdfPath = parsed.data.curriculumPdfObjectPath;
    if (newPdfPath && newPdfPath !== existingCourse.curriculumPdfObjectPath) {
      const file = await objectStorage.getObjectEntityFile(newPdfPath);
      const [header] = await file.download({ start: 0, end: 4 });
      if (header.subarray(0, 5).toString("ascii") !== "%PDF-") {
        res.status(400).json({ error: "The uploaded file is not a valid PDF." });
        return;
      }
    }

    const course = await prisma.course.update({
      where: { slug: params.data.slug },
      data: {
        heroEyebrow: parsed.data.heroEyebrow,
        heroTitle: parsed.data.heroTitle,
        heroDescription: parsed.data.heroDescription,
        durationLabel: parsed.data.durationLabel,
        modeLabel: parsed.data.modeLabel,
        heroBackgroundImageUrl: parsed.data.heroBackgroundImageUrl,
        heroBackgroundOverlay: parsed.data.heroBackgroundOverlay,
        primaryActionLabel: parsed.data.primaryActionLabel,
        primaryActionUrl: parsed.data.primaryActionUrl,
        secondaryActionLabel: parsed.data.secondaryActionLabel,
        secondaryActionUrl: parsed.data.secondaryActionUrl,
        highlightsEyebrow: parsed.data.highlightsEyebrow,
        highlightsHeading: parsed.data.highlightsHeading,
        highlightsIntroduction: parsed.data.highlightsIntroduction,
        highlights: [...parsed.data.highlights].sort((left, right) => left.displayOrder - right.displayOrder) as unknown as Prisma.InputJsonValue,
        overviewText: parsed.data.overviewText,
        programGoals: parsed.data.programGoals as unknown as Prisma.InputJsonValue,
        idealProfileTitle: parsed.data.idealProfileTitle,
        idealProfileDescription: parsed.data.idealProfileDescription,
        idealProfileIndicators: parsed.data.idealProfileIndicators as unknown as Prisma.InputJsonValue,
        syllabus: parsed.data.syllabus as unknown as Prisma.InputJsonValue,
        curriculumPdfObjectPath: parsed.data.curriculumPdfObjectPath,
        curriculumPdfFileName: parsed.data.curriculumPdfFileName,
      },
    });
    res.json(UpdateAdminCourseResponse.parse(toAdminCourse(course)));
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(400).json({ error: "The uploaded curriculum PDF is not available in storage." });
      return;
    }
    req.log.error({ err: error, slug: params.data.slug }, "Unable to save course content");
    res.status(500).json({ error: "Unable to save course content." });
  }
});

router.post("/admin/courses/:slug/curriculum/upload-url", requireAdmin, async (req, res): Promise<void> => {
  const params = RequestCourseCurriculumUploadUrlParams.safeParse(req.params);
  const parsed = RequestCourseCurriculumUploadUrlBody.safeParse(req.body);
  if (
    !params.success ||
    !parsed.success ||
    parsed.data?.contentType !== "application/pdf" ||
    !parsed.data?.fileName.toLowerCase().endsWith(".pdf") ||
    parsed.data?.size > MAX_CURRICULUM_PDF_BYTES
  ) {
    res.status(400).json({ error: "Choose a PDF file smaller than 20 MB." });
    return;
  }

  try {
    const course = await prisma.course.findUnique({ where: { slug: params.data.slug } });
    if (!course) {
      res.status(404).json({ error: "Course not found." });
      return;
    }
    const uploadURL = await objectStorage.getObjectEntityUploadURL();
    const objectPath = objectStorage.normalizeObjectEntityPath(uploadURL);
    if (!isSafeObjectPath(objectPath)) {
      req.log.error({ slug: course.slug }, "Object storage returned an invalid upload path");
      res.status(500).json({ error: "Unable to prepare this curriculum upload." });
      return;
    }
    res.json(RequestCourseCurriculumUploadUrlResponse.parse({ uploadURL, objectPath }));
  } catch (error) {
    req.log.error({ err: error, slug: params.data.slug }, "Unable to create curriculum upload URL");
    res.status(503).json({ error: "Curriculum uploads are temporarily unavailable." });
  }
});

export default router;