import { Prisma } from "@prisma/client";
import { Readable } from "node:stream";
import { Router, type IRouter } from "express";
import * as Z from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { DEFAULT_KNOWLEDGE_HUB_RESOURCE_HUB_PAGE } from "../lib/knowledge-hub-resource-content";
import {
  ObjectNotFoundError,
  ObjectStorageService,
} from "../lib/objectStorage";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();
const storage = new ObjectStorageService();
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PATH = /^\/objects\/uploads\/[a-f0-9-]{36}$/;
const include = { category: true } as const;
const conflict = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
const missing = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
const validPath = (v: unknown): v is string =>
  typeof v === "string" && PATH.test(v);
function imageSignature(type: string, b: Buffer) {
  return type === "image/jpeg"
    ? b.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
    : type === "image/png"
      ? b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : type === "image/webp" &&
        b.toString("ascii", 0, 4) === "RIFF" &&
        b.toString("ascii", 8, 12) === "WEBP";
}
function assetUrl(path: string | null) {
  return path
    ? `/api/knowledge-hub/resources/assets/${path.split("/").pop()}`
    : null;
}
function adminAssetUrl(path: string | null) {
  return path
    ? `/api/admin/knowledge-hub/resources/assets/${path.split("/").pop()}`
    : null;
}
function pdfUrl(slug: string, download = false) {
  return `/api/knowledge-hub/resources/${slug}/${download ? "download" : "pdf"}`;
}
function summary(r: any) {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    categoryId: r.categoryId,
    categoryName: r.category.name,
    categorySlug: r.category.slug,
    description: r.description,
    resourceType: r.resourceType,
    subject: r.subject,
    exam: r.exam,
    classLevel: r.classLevel,
    academicYear: r.academicYear,
    language: r.language,
    tags: r.tags,
    coverImageUrl: assetUrl(r.coverImageObjectPath),
    coverImageAltText: r.coverImageAltText,
    pdfFileName: r.pdfFileName,
    pdfViewUrl: pdfUrl(r.slug),
    pdfDownloadUrl: pdfUrl(r.slug, true),
    displayOrder: r.displayOrder,
    publishedAt: r.publishedAt?.toISOString() ?? null,
    updatedAt: r.updatedAt.toISOString(),
  };
}
function record(r: any) {
  return {
    ...summary(r),
    pdfObjectPath: r.pdfObjectPath,
    coverImageObjectPath: r.coverImageObjectPath,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}
function safeHref(value: string) {
  if (value.startsWith("#")) return value.length > 1;
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.split("/").includes("..")
  )
    return true;
  try {
    const u = new URL(value);
    return (
      (u.protocol === "http:" || u.protocol === "https:") &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
}
function safeImagePath(value: string | null) {
  return value === null || validPath(value);
}
function safeFilename(value: string) {
  return (
    value
      .replace(/[\r\n"]/g, "")
      .replace(/[^\x20-\x7e]/g, "_")
      .slice(0, 180) || "resource.pdf"
  );
}
async function validateObject(path: string, kind: "pdf" | "cover") {
  if (!validPath(path)) return false;
  const file = await storage.getObjectEntityFile(path);
  const [metadata] = await file.getMetadata();
  const type = String(metadata.contentType ?? ""),
    size = Number(metadata.size ?? 0);
  const [head] = await file.download({ start: 0, end: 11 });
  if (kind === "pdf")
    return (
      type === "application/pdf" &&
      size >= 1 &&
      size <= 20 * 1024 * 1024 &&
      head.toString("ascii", 0, 5) === "%PDF-"
    );
  return (
    IMAGE_TYPES.has(type) &&
    size >= 1 &&
    size <= 5 * 1024 * 1024 &&
    imageSignature(type, head)
  );
}
async function cat(c: any) {
  const [resourceCount, publishedResourceCount] = await Promise.all([
    prisma.knowledgeHubResource.count({ where: { categoryId: c.id } }),
    prisma.knowledgeHubResource.count({
      where: { categoryId: c.id, status: "published" },
    }),
  ]);
  return { ...c, resourceCount, publishedResourceCount };
}
const publicWhere = {
  status: "published",
  category: { isVisible: true },
} as any;

router.get("/knowledge-hub/resources/page", async (req, res) => {
  try {
    const [settings, categories, count] = await Promise.all([
      prisma.knowledgeHubResourceHubSettings.findUnique({
        where: { id: "singleton" },
      }),
      prisma.knowledgeHubResourceCategory.findMany({
        where: { isVisible: true },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      }),
      prisma.knowledgeHubResource.count({ where: publicWhere }),
    ]);
    const cats = await Promise.all(categories.map(cat));
    const featured = settings?.featuredResourceId
      ? await prisma.knowledgeHubResource.findFirst({
          where: { ...publicWhere, id: settings.featuredResourceId },
          include,
        })
      : null;
    const s: any = settings ?? DEFAULT_KNOWLEDGE_HUB_RESOURCE_HUB_PAGE;
    const {
      heroBackgroundImageObjectPath: _heroPath,
      featuredResourceId: _featuredId,
      ...publicSettings
    } = s;
    res.json(
      Z.GetKnowledgeHubResourceHubPageResponse.parse({
        settings: {
          ...publicSettings,
          heroBackgroundImageUrl: assetUrl(s.heroBackgroundImageObjectPath),
        },
        featuredResource: featured ? summary(featured) : null,
        publishedResourceCount: count,
        publishedCategoryCount: cats.filter((c) => c.publishedResourceCount > 0)
          .length,
        categories: cats,
      }),
    );
  } catch (e) {
    req.log.error({ err: e }, "Unable to read Resource Hub page");
    res
      .status(500)
      .json({ error: "Unable to load Resource Hub page content." });
  }
});

router.get("/knowledge-hub/resources", async (req, res) => {
  const q = Z.GetKnowledgeHubResourcesQueryParams.safeParse({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    resourceType:
      typeof req.query.resourceType === "string"
        ? req.query.resourceType
        : undefined,
    category:
      typeof req.query.category === "string" ? req.query.category : undefined,
    subject:
      typeof req.query.subject === "string" ? req.query.subject : undefined,
    exam: typeof req.query.exam === "string" ? req.query.exam : undefined,
    academicYear:
      typeof req.query.academicYear === "string"
        ? req.query.academicYear
        : undefined,
    sort: typeof req.query.sort === "string" ? req.query.sort : "recent",
    offset: req.query.offset === undefined ? 0 : Number(req.query.offset),
    limit: req.query.limit === undefined ? 9 : Number(req.query.limit),
  });
  if (!q.success) {
    res
      .status(400)
      .json({
        error: "Check the resource search, filters, and page settings.",
      });
    return;
  }
  const d = q.data;
  const where: any = {
    ...publicWhere,
    ...(d.resourceType ? { resourceType: d.resourceType } : {}),
    ...(d.subject ? { subject: d.subject } : {}),
    ...(d.exam ? { exam: d.exam } : {}),
    ...(d.academicYear ? { academicYear: d.academicYear } : {}),
    ...(d.category ? { category: { isVisible: true, slug: d.category } } : {}),
  };
  if (d.search)
    where.OR = [
      ...[
        "title",
        "description",
        "subject",
        "exam",
        "classLevel",
        "academicYear",
        "language",
      ].map((k) => ({ [k]: { contains: d.search, mode: "insensitive" } })),
      { category: { name: { contains: d.search, mode: "insensitive" } } },
      { tags: { has: d.search } },
    ] as any[];
  const orderBy: any =
    d.sort === "title"
      ? [{ title: "asc" }, { id: "asc" }]
      : d.sort === "oldest"
        ? [{ publishedAt: "asc" }, { id: "asc" }]
        : d.sort === "displayOrder"
          ? [{ displayOrder: "asc" }, { id: "asc" }]
          : [{ publishedAt: "desc" }, { id: "asc" }];
  try {
    const [rows, total] = await Promise.all([
      prisma.knowledgeHubResource.findMany({
        where,
        include,
        orderBy,
        skip: d.offset,
        take: d.limit,
      }),
      prisma.knowledgeHubResource.count({ where }),
    ]);
    res.json(
      Z.GetKnowledgeHubResourcesResponse.parse({
        items: rows.map(summary),
        total,
        offset: d.offset,
        limit: d.limit,
        hasMore: d.offset + rows.length < total,
      }),
    );
  } catch (e) {
    req.log.error({ err: e }, "Unable to search resources");
    res.status(500).json({ error: "Unable to load resources." });
  }
});

async function serveAsset(req: any, res: any, admin: boolean) {
  const schema = admin
    ? Z.GetAdminKnowledgeHubResourceAssetParams
    : Z.GetKnowledgeHubResourceAssetParams;
  const p = schema.safeParse(req.params);
  if (!p.success) {
    res.status(404).json({ error: "Image not found." });
    return;
  }
  try {
    const path = `/objects/uploads/${p.data.assetId}`;
    const file = await storage.getObjectEntityFile(path);
    const association = await prisma.knowledgeHubResource.findFirst({
      where: {
        status: "published",
        category: { isVisible: true },
        coverImageObjectPath: path,
      },
      select: { id: true },
    });
    const settings = await prisma.knowledgeHubResourceHubSettings.findFirst({
      where: { id: "singleton", heroBackgroundImageObjectPath: path },
      select: { id: true },
    });
    if (
      !(admin || !!association || !!settings) ||
      !(await validateObject(path, "cover"))
    ) {
      res.status(404).json({ error: "Image not found." });
      return;
    }
    const out = await storage.downloadObject(file, 0);
    out.headers.forEach((v, k) => res.setHeader(k, v));
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    if (out.body)
      Readable.fromWeb(out.body as ReadableStream<Uint8Array>).pipe(res);
    else res.end();
  } catch (e) {
    if (!(e instanceof ObjectNotFoundError))
      req.log.error({ err: e }, "Unable to serve resource image");
    res.status(404).json({ error: "Image not found." });
  }
}
router.get("/knowledge-hub/resources/assets/:assetId", (req, res) =>
  serveAsset(req, res, false),
);
router.get(
  "/admin/knowledge-hub/resources/assets/:assetId",
  requireAdmin,
  (req, res) => serveAsset(req, res, true),
);

async function servePdf(req: any, res: any, download: boolean) {
  const schema = download
    ? Z.DownloadKnowledgeHubResourcePdfParams
    : Z.GetKnowledgeHubResourcePdfParams;
  const p = schema.safeParse(req.params);
  if (!p.success) {
    res.status(404).json({ error: "Resource not found." });
    return;
  }
  try {
    const r = await prisma.knowledgeHubResource.findFirst({
      where: { slug: p.data.slug, ...publicWhere },
    });
    if (!r) {
      res.status(404).json({ error: "Resource not found." });
      return;
    }
    const file = await storage.getObjectEntityFile(r.pdfObjectPath);
    if (
      !(await validateObject(r.pdfObjectPath, "pdf")) ||
      !/\.pdf$/i.test(r.pdfFileName)
    ) {
      res.status(404).json({ error: "Resource not found." });
      return;
    }
    const out = await storage.downloadObject(file, 0);
    const filename = safeFilename(r.pdfFileName);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader(
      "Content-Disposition",
      `${download ? "attachment" : "inline"}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
    if (out.body)
      Readable.fromWeb(out.body as ReadableStream<Uint8Array>).pipe(res);
    else res.end();
  } catch (e) {
    res.status(404).json({ error: "Resource not found." });
  }
}
router.get("/knowledge-hub/resources/:slug/pdf", (req, res) =>
  servePdf(req, res, false),
);
router.get("/knowledge-hub/resources/:slug/download", (req, res) =>
  servePdf(req, res, true),
);

router.get("/admin/knowledge-hub/resources", requireAdmin, async (req, res) => {
  try {
    const [s, c, r] = await Promise.all([
      prisma.knowledgeHubResourceHubSettings.findUnique({
        where: { id: "singleton" },
      }),
      prisma.knowledgeHubResourceCategory.findMany({
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      }),
      prisma.knowledgeHubResource.findMany({
        include,
        orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      }),
    ]);
    res.json(
      Z.GetAdminKnowledgeHubResourcesResponse.parse({
        settings: s ?? DEFAULT_KNOWLEDGE_HUB_RESOURCE_HUB_PAGE,
        categories: await Promise.all(c.map(cat)),
        resources: r.map(record),
      }),
    );
  } catch (e) {
    req.log.error({ err: e }, "Unable to read admin resources");
    res
      .status(500)
      .json({ error: "Unable to load Resource Hub management content." });
  }
});
router.put(
  "/admin/knowledge-hub/resources/page",
  requireAdmin,
  async (req, res) => {
    const p = Z.UpdateAdminKnowledgeHubResourceHubPageBody.safeParse(req.body);
    if (
      !p.success ||
      !safeHref(p.data.heroCtaHref) ||
      !safeImagePath(p.data.heroBackgroundImageObjectPath) ||
      (p.data.heroBackgroundImageObjectPath &&
        !p.data.heroBackgroundImageAltText.trim())
    ) {
      res
        .status(400)
        .json({
          error: "Check the Resource Hub page settings and image path.",
        });
      return;
    }
    try {
      if (
        p.data.heroBackgroundImageObjectPath &&
        !(await validateObject(p.data.heroBackgroundImageObjectPath, "cover"))
      ) {
        res.status(400).json({ error: "The hero image is invalid." });
        return;
      }
      if (p.data.featuredResourceId) {
        const f = await prisma.knowledgeHubResource.findFirst({
          where: {
            id: p.data.featuredResourceId,
            status: "published",
            category: { isVisible: true },
          },
          select: { id: true },
        });
        if (!f) {
          res
            .status(400)
            .json({
              error:
                "The featured resource must be published in a visible category.",
            });
          return;
        }
      }
      const v = await prisma.knowledgeHubResourceHubSettings.upsert({
        where: { id: "singleton" },
        update: p.data,
        create: { id: "singleton", ...p.data },
      });
      res.json(Z.UpdateAdminKnowledgeHubResourceHubPageResponse.parse(v));
    } catch (e) {
      if (e instanceof ObjectNotFoundError) {
        res.status(400).json({ error: "The hero image was not found." });
        return;
      }
      res
        .status(500)
        .json({ error: "Unable to save Resource Hub page settings." });
    }
  },
);
async function resourceMutation(req: any, res: any, update: boolean) {
  const ps: any = (
    update ? Z.UpdateAdminKnowledgeHubResourceParams : undefined
  )?.safeParse(req.params);
  const b: any = (
    update
      ? Z.UpdateAdminKnowledgeHubResourceBody
      : Z.CreateAdminKnowledgeHubResourceBody
  ).safeParse(req.body);
  if ((update && !ps?.success) || !b.success) {
    res
      .status(400)
      .json({ error: "Check the resource fields and uploaded files." });
    return;
  }
  const d: any = b.data;
  if (
    !validPath(d.pdfObjectPath) ||
    (d.coverImageObjectPath && !validPath(d.coverImageObjectPath)) ||
    !/\.pdf$/i.test(d.pdfFileName) ||
    (d.coverImageObjectPath && !d.coverImageAltText.trim())
  ) {
    res
      .status(400)
      .json({
        error:
          "Invalid uploaded object path, PDF filename, or cover image details.",
      });
    return;
  }
  try {
    const category = await prisma.knowledgeHubResourceCategory.findUnique({
      where: { id: d.categoryId },
      select: { isVisible: true },
    });
    if (!category) {
      res.status(400).json({ error: "Category not found." });
      return;
    }
    if (
      !(await validateObject(d.pdfObjectPath, "pdf")) ||
      (d.coverImageObjectPath &&
        !(await validateObject(d.coverImageObjectPath, "cover")))
    ) {
      res
        .status(400)
        .json({
          error: "Uploaded file metadata or content signature is invalid.",
        });
      return;
    }
    let prior: any = null;
    if (update) {
      prior = await prisma.knowledgeHubResource.findUnique({
        where: { id: ps.data.id },
        select: { status: true, publishedAt: true },
      });
    }
    const data = {
      ...d,
      publishedAt:
        d.status === "published"
          ? prior?.status === "published"
            ? prior.publishedAt
            : new Date()
          : null,
    };
    const r = update
      ? await prisma.$transaction(async (tx) => {
          const updated = await tx.knowledgeHubResource.update({
            where: { id: ps.data.id },
            data,
            include,
          });
          if (d.status !== "published" || !category.isVisible) {
            await tx.knowledgeHubResourceHubSettings.updateMany({
              where: { featuredResourceId: updated.id },
              data: { featuredResourceId: null },
            });
          }
          return updated;
        })
      : await prisma.knowledgeHubResource.create({ data, include });
    res
      .status(update ? 200 : 201)
      .json(
        (update
          ? Z.UpdateAdminKnowledgeHubResourceResponse
          : Z.CreateAdminKnowledgeHubResourceResponse
        ).parse(record(r)),
      );
  } catch (e) {
    if (missing(e)) {
      res.status(404).json({ error: "Resource not found." });
      return;
    }
    if (conflict(e)) {
      res
        .status(409)
        .json({ error: "A resource with that slug already exists." });
      return;
    }
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      res.status(400).json({ error: "Category not found." });
      return;
    }
    if (e instanceof ObjectNotFoundError) {
      res.status(400).json({ error: "Uploaded file not found." });
      return;
    }
    res.status(500).json({ error: "Unable to save this resource." });
  }
}
router.post("/admin/knowledge-hub/resources", requireAdmin, (req, res) =>
  resourceMutation(req, res, false),
);
router.put("/admin/knowledge-hub/resources/:id", requireAdmin, (req, res) =>
  resourceMutation(req, res, true),
);
router.delete(
  "/admin/knowledge-hub/resources/:id",
  requireAdmin,
  async (req, res) => {
    const p = Z.DeleteAdminKnowledgeHubResourceParams.safeParse(req.params);
    if (!p.success) {
      res.status(400).json({ error: "Invalid resource ID." });
      return;
    }
    try {
      await prisma.$transaction([
        prisma.knowledgeHubResourceHubSettings.updateMany({
          where: { featuredResourceId: p.data.id },
          data: { featuredResourceId: null },
        }),
        prisma.knowledgeHubResource.delete({ where: { id: p.data.id } }),
      ]);
      res.sendStatus(204);
    } catch (e) {
      if (missing(e)) {
        res.status(404).json({ error: "Resource not found." });
        return;
      }
      res.status(500).json({ error: "Unable to delete this resource." });
    }
  },
);

async function categoryMutation(req: any, res: any, update: boolean) {
  const p: any = update
    ? Z.UpdateAdminKnowledgeHubResourceCategoryParams.safeParse(req.params)
    : null;
  const b: any = (
    update
      ? Z.UpdateAdminKnowledgeHubResourceCategoryBody
      : Z.CreateAdminKnowledgeHubResourceCategoryBody
  ).safeParse(req.body);
  if ((update && !p?.success) || !b.success) {
    res.status(400).json({ error: "Check the category fields." });
    return;
  }
  try {
    const c = update
      ? await prisma.$transaction(async (tx) => {
          const updated = await tx.knowledgeHubResourceCategory.update({
            where: { id: p.data.id },
            data: b.data,
          });
          if (!b.data.isVisible) {
            const settings =
              await tx.knowledgeHubResourceHubSettings.findUnique({
                where: { id: "singleton" },
                select: { featuredResourceId: true },
              });
            if (settings?.featuredResourceId) {
              const featured = await tx.knowledgeHubResource.findFirst({
                where: {
                  id: settings.featuredResourceId,
                  categoryId: p.data.id,
                },
                select: { id: true },
              });
              if (featured) {
                await tx.knowledgeHubResourceHubSettings.updateMany({
                  where: { featuredResourceId: featured.id },
                  data: { featuredResourceId: null },
                });
              }
            }
          }
          return updated;
        })
      : await prisma.knowledgeHubResourceCategory.create({ data: b.data });
    res
      .status(update ? 200 : 201)
      .json(
        (update
          ? Z.UpdateAdminKnowledgeHubResourceCategoryResponse
          : Z.CreateAdminKnowledgeHubResourceCategoryResponse
        ).parse(await cat(c)),
      );
  } catch (e) {
    if (
      missing(e) ||
      (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003")
    ) {
      res.status(400).json({ error: "Category not found." });
      return;
    }
    if (conflict(e)) {
      res
        .status(409)
        .json({ error: "A category with that slug already exists." });
      return;
    }
    res.status(500).json({ error: "Unable to save this category." });
  }
}
router.post(
  "/admin/knowledge-hub/resources/categories",
  requireAdmin,
  (req, res) => categoryMutation(req, res, false),
);
router.put(
  "/admin/knowledge-hub/resources/categories/:id",
  requireAdmin,
  (req, res) => categoryMutation(req, res, true),
);
router.delete(
  "/admin/knowledge-hub/resources/categories/:id",
  requireAdmin,
  async (req, res) => {
    const p = Z.DeleteAdminKnowledgeHubResourceCategoryParams.safeParse(
      req.params,
    );
    if (!p.success) {
      res.status(400).json({ error: "Invalid category ID." });
      return;
    }
    try {
      if (
        await prisma.knowledgeHubResource.count({
          where: { categoryId: p.data.id },
        })
      ) {
        res
          .status(409)
          .json({
            error:
              "Move or delete this category's resources before removing it.",
          });
        return;
      }
      await prisma.knowledgeHubResourceCategory.delete({
        where: { id: p.data.id },
      });
      res.sendStatus(204);
    } catch (e) {
      if (missing(e)) {
        res.status(404).json({ error: "Category not found." });
        return;
      }
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2003"
      ) {
        res
          .status(409)
          .json({ error: "This category is still referenced by resources." });
        return;
      }
      res.status(500).json({ error: "Unable to delete this category." });
    }
  },
);

router.post(
  "/admin/knowledge-hub/resources/upload-url",
  requireAdmin,
  async (req, res) => {
    const p = Z.RequestAdminKnowledgeHubResourceUploadUrlBody.safeParse(
      req.body,
    );
    if (
      !p.success ||
      (p.data.kind === "pdf"
        ? p.data.contentType !== "application/pdf" ||
          !p.data.fileName.toLowerCase().endsWith(".pdf") ||
          p.data.size < 1 ||
          p.data.size > 20 * 1024 * 1024
        : !IMAGE_TYPES.has(p.data.contentType) ||
          p.data.size < 1 ||
          p.data.size > 5 * 1024 * 1024)
    ) {
      res
        .status(400)
        .json({ error: "Invalid upload type, filename, or size." });
      return;
    }
    try {
      const uploadURL = await storage.getObjectEntityUploadURL();
      const objectPath = storage.normalizeObjectEntityPath(uploadURL);
      if (!validPath(objectPath)) {
        res.status(500).json({ error: "Unable to prepare this upload." });
        return;
      }
      res.json(
        Z.RequestAdminKnowledgeHubResourceUploadUrlResponse.parse({
          kind: p.data.kind,
          uploadURL,
          objectPath,
        }),
      );
    } catch (e) {
      res.status(503).json({ error: "Uploads are temporarily unavailable." });
    }
  },
);
router.post(
  "/admin/knowledge-hub/resources/upload-complete",
  requireAdmin,
  async (req, res) => {
    const p = Z.CompleteAdminKnowledgeHubResourceUploadBody.safeParse(req.body);
    if (!p.success || !validPath(p.data.objectPath)) {
      res.status(400).json({ error: "Invalid uploaded object." });
      return;
    }
    try {
      const file = await storage.getObjectEntityFile(p.data.objectPath);
      const [m] = await file.getMetadata();
      const type = String(m.contentType ?? "");
      const size = Number(m.size ?? 0);
      const [head] = await file.download({ start: 0, end: 11 });
      const ok =
        p.data.kind === "pdf"
          ? type === "application/pdf" &&
            size >= 1 &&
            size <= 20 * 1024 * 1024 &&
            head.toString("ascii", 0, 5) === "%PDF-"
          : IMAGE_TYPES.has(type) &&
            size >= 1 &&
            size <= 5 * 1024 * 1024 &&
            imageSignature(type, head);
      if (!ok) {
        res
          .status(400)
          .json({
            error: "Uploaded file metadata or content signature is invalid.",
          });
        return;
      }
      await storage.trySetObjectEntityAclPolicy(p.data.objectPath, {
        owner: "knowledge-hub-resource",
        visibility: "private",
      });
      res.json(
        Z.CompleteAdminKnowledgeHubResourceUploadResponse.parse({
          kind: p.data.kind,
          objectPath: p.data.objectPath,
          imageUrl:
            p.data.kind === "cover" ? adminAssetUrl(p.data.objectPath) : null,
        }),
      );
    } catch (e) {
      if (e instanceof ObjectNotFoundError) {
        res.status(404).json({ error: "Uploaded object not found." });
        return;
      }
      res.status(500).json({ error: "Unable to validate this upload." });
    }
  },
);

export default router;
