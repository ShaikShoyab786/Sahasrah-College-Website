import { Prisma } from "@prisma/client";
import { Readable } from "node:stream";
import { Router, type IRouter } from "express";
import {
  GetKnowledgeHubVideoHubPageResponse, GetKnowledgeHubVideoHubVideosQueryParams,
  GetKnowledgeHubVideoHubVideosResponse, GetKnowledgeHubVideoHubAssetParams,
  GetAdminKnowledgeHubVideoHubResponse, UpdateAdminKnowledgeHubVideoHubPageBody,
  UpdateAdminKnowledgeHubVideoHubPageResponse, CreateAdminKnowledgeHubVideoBody,
  CreateAdminKnowledgeHubVideoResponse, UpdateAdminKnowledgeHubVideoParams,
  UpdateAdminKnowledgeHubVideoBody, UpdateAdminKnowledgeHubVideoResponse,
  DeleteAdminKnowledgeHubVideoParams, CreateAdminKnowledgeHubVideoCategoryBody,
  CreateAdminKnowledgeHubVideoCategoryResponse, UpdateAdminKnowledgeHubVideoCategoryParams,
  UpdateAdminKnowledgeHubVideoCategoryBody, UpdateAdminKnowledgeHubVideoCategoryResponse,
  DeleteAdminKnowledgeHubVideoCategoryParams, RequestAdminKnowledgeHubVideoImageUploadUrlBody,
  RequestAdminKnowledgeHubVideoImageUploadUrlResponse, CompleteAdminKnowledgeHubVideoImageUploadBody,
  CompleteAdminKnowledgeHubVideoImageUploadResponse,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { DEFAULT_KNOWLEDGE_HUB_VIDEO_PAGE } from "../lib/knowledge-hub-video-content";
import { ObjectNotFoundError, ObjectStorageService } from "../lib/objectStorage";
import { ObjectPermission } from "../lib/objectAcl";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();
const storage = new ObjectStorageService();
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function conflict(error: unknown) { return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"; }
function missing(error: unknown) { return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"; }
function objectPath(value: string | null | undefined) {
  return value === null || value === undefined || (/^\/objects\/uploads\/[a-f0-9-]{36}$/.test(value) && !value.includes(".."));
}
function hasImageSignature(contentType: string, bytes: Buffer) {
  if (contentType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (contentType === "image/webp") return bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  return false;
}
function assetUrl(path: string | null) {
  if (!path) return null;
  const id = path.split("/").pop();
  return id ? `/api/knowledge-hub/video-hub/assets/${id}` : null;
}
function youtube(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port) return null;
    const pathParts = url.pathname.split("/").filter(Boolean);
    let id = "";
    if (url.hostname === "youtu.be" && pathParts.length === 1) id = pathParts[0];
    else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v") ?? "";
      else if (pathParts.length === 2 && ["shorts", "embed", "live", "v"].includes(pathParts[0])) id = pathParts[1];
    }
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return `https://www.youtube.com/watch?v=${id}`;
  } catch { return null; }
}
function summary(video: any) {
  return {
    id: video.id, title: video.title, slug: video.slug, categoryId: video.categoryId,
    categoryName: video.category.name, categorySlug: video.category.slug, categoryIcon: video.category.icon,
    description: video.description, instructor: video.instructor, duration: video.duration,
    youtubeUrl: video.youtubeUrl, thumbnailImageUrl: assetUrl(video.thumbnailObjectPath),
    thumbnailImageAltText: video.thumbnailImageAltText, displayOrder: video.displayOrder,
    publishedAt: video.publishedAt?.toISOString() ?? null,
  };
}
function record(video: any) {
  return { ...summary(video), thumbnailObjectPath: video.thumbnailObjectPath, status: video.status,
    createdAt: video.createdAt.toISOString(), updatedAt: video.updatedAt.toISOString() };
}
function category(value: any, count: number) {
  return { id: value.id, name: value.name, slug: value.slug, icon: value.icon,
    displayOrder: value.displayOrder, isVisible: value.isVisible, publishedVideoCount: count };
}
function pageSettings(value: any) {
  const content = value ? {
    heroEyebrow: value.heroEyebrow, heroTitle: value.heroTitle, heroAccentText: value.heroAccentText,
    heroDescription: value.heroDescription, heroCtaLabel: value.heroCtaLabel,
    heroBackgroundImageObjectPath: value.heroBackgroundImageObjectPath,
    heroBackgroundImageAltText: value.heroBackgroundImageAltText, highlights: value.highlights,
    featuredEyebrow: value.featuredEyebrow, libraryEyebrow: value.libraryEyebrow,
    libraryTitle: value.libraryTitle, libraryDescription: value.libraryDescription,
    searchPlaceholder: value.searchPlaceholder, emptyStateTitle: value.emptyStateTitle,
    emptyStateDescription: value.emptyStateDescription,
  } : DEFAULT_KNOWLEDGE_HUB_VIDEO_PAGE;
  return content;
}
const include = { category: true } as const;
async function categories(visibleOnly: boolean) {
  const [rows, counts] = await Promise.all([
    prisma.knowledgeHubVideoCategory.findMany({ where: visibleOnly ? { isVisible: true } : undefined, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }),
    prisma.knowledgeHubVideo.groupBy({ by: ["categoryId"], where: { status: "published" }, _count: { _all: true } }),
  ]);
  const map = new Map(counts.map((row) => [row.categoryId, row._count._all]));
  return rows.map((row) => category(row, map.get(row.id) ?? 0));
}
function parseQuery(req: any) {
  return GetKnowledgeHubVideoHubVideosQueryParams.safeParse({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    category: typeof req.query.category === "string" ? req.query.category : undefined,
    sort: typeof req.query.sort === "string" ? req.query.sort : "recent",
    offset: req.query.offset === undefined ? 0 : Number(req.query.offset),
    limit: req.query.limit === undefined ? 9 : Number(req.query.limit),
  });
}

router.get("/knowledge-hub/video-hub/page", async (req, res): Promise<void> => {
  try {
    const [settings, cats] = await Promise.all([
      prisma.knowledgeHubVideoHubSettings.findUnique({ where: { id: "singleton" } }),
      categories(true),
    ]);
    const where: Prisma.KnowledgeHubVideoWhereInput = { status: "published", category: { isVisible: true } };
    const [videos, count] = await Promise.all([
      prisma.knowledgeHubVideo.findMany({ where, include, orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }], take: 5 }),
      prisma.knowledgeHubVideo.count({ where }),
    ]);
    let featured = null;
    if (settings?.featuredVideoId) {
      const found = await prisma.knowledgeHubVideo.findFirst({ where: { id: settings.featuredVideoId, ...where }, include });
      if (found) featured = summary(found);
    }
    const related = videos.filter((v) => v.id !== featured?.id).slice(0, 4).map(summary);
    const { heroBackgroundImageObjectPath: _privateHeroImagePath, ...publicSettings } = pageSettings(settings);
    res.json(GetKnowledgeHubVideoHubPageResponse.parse({
      settings: { ...publicSettings, heroBackgroundImageUrl: assetUrl(settings?.heroBackgroundImageObjectPath ?? null) },
      featuredVideo: featured, relatedVideos: related, publishedVideoCount: count, categories: cats,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read Video Hub page");
    res.status(500).json({ error: "Unable to load Video Hub page content." });
  }
});

router.get("/knowledge-hub/video-hub/videos", async (req, res): Promise<void> => {
  const parsed = parseQuery(req);
  if (!parsed.success) { res.status(400).json({ error: "Check the video search, filter, and page settings." }); return; }
  const data = parsed.data;
  const where: Prisma.KnowledgeHubVideoWhereInput = { status: "published", category: data.category ? { isVisible: true, slug: data.category } : { isVisible: true },
    ...(data.search ? { OR: [{ title: { contains: data.search, mode: "insensitive" } }, { description: { contains: data.search, mode: "insensitive" } }, { instructor: { contains: data.search, mode: "insensitive" } }, { category: { name: { contains: data.search, mode: "insensitive" } } }] } : {}) };
  const orderBy: Prisma.KnowledgeHubVideoOrderByWithRelationInput[] = data.sort === "title" ? [{ title: "asc" }, { id: "asc" }] : data.sort === "oldest" ? [{ publishedAt: "asc" }, { id: "asc" }] : data.sort === "displayOrder" ? [{ displayOrder: "asc" }, { id: "asc" }] : [{ publishedAt: "desc" }, { id: "asc" }];
  try {
    const [videos, total] = await Promise.all([
      prisma.knowledgeHubVideo.findMany({ where, include, orderBy, skip: data.offset, take: data.limit }),
      prisma.knowledgeHubVideo.count({ where }),
    ]);
    res.json(GetKnowledgeHubVideoHubVideosResponse.parse({ items: videos.map(summary), total, offset: data.offset, limit: data.limit, hasMore: data.offset + videos.length < total }));
  } catch (error) { req.log.error({ err: error }, "Unable to search Video Hub"); res.status(500).json({ error: "Unable to load videos." }); }
});

router.get("/knowledge-hub/video-hub/assets/:assetId", async (req, res): Promise<void> => {
  const parsed = GetKnowledgeHubVideoHubAssetParams.safeParse(req.params);
  if (!parsed.success) { res.status(404).json({ error: "Image not found." }); return; }
  try {
    const file = await storage.getObjectEntityFile(`/objects/uploads/${parsed.data.assetId}`);
    if (!(await storage.canAccessObjectEntity({ objectFile: file, requestedPermission: ObjectPermission.READ }))) { res.status(404).json({ error: "Image not found." }); return; }
    const [metadata] = await file.getMetadata();
    if (!IMAGE_TYPES.has(String(metadata.contentType))) { res.status(404).json({ error: "Image not found." }); return; }
    const response = await storage.downloadObject(file, 3600);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res); else res.end();
  } catch (error) { if (!(error instanceof ObjectNotFoundError)) req.log.error({ err: error }, "Unable to serve Video Hub image"); res.status(404).json({ error: "Image not found." }); }
});

router.get("/admin/knowledge-hub/video-hub", requireAdmin, async (req, res): Promise<void> => {
  try {
    const [settings, cats, videos] = await Promise.all([
      prisma.knowledgeHubVideoHubSettings.findUnique({ where: { id: "singleton" } }),
      categories(false),
      prisma.knowledgeHubVideo.findMany({ include, orderBy: [{ updatedAt: "desc" }, { title: "asc" }] }),
    ]);
    res.json(GetAdminKnowledgeHubVideoHubResponse.parse({ settings: { ...pageSettings(settings), featuredVideoId: settings?.featuredVideoId ?? null }, categories: cats, videos: videos.map(record) }));
  } catch (error) { req.log.error({ err: error }, "Unable to read admin Video Hub"); res.status(500).json({ error: "Unable to load Video Hub management content." }); }
});

router.put("/admin/knowledge-hub/video-hub/page", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminKnowledgeHubVideoHubPageBody.safeParse(req.body);
  if (!parsed.success || !objectPath(parsed.data?.heroBackgroundImageObjectPath ?? null) || (parsed.data?.heroBackgroundImageObjectPath && !parsed.data.heroBackgroundImageAltText.trim())) { res.status(400).json({ error: "Check the Video Hub page content and image details." }); return; }
  if (parsed.data.featuredVideoId !== null) {
    const video = await prisma.knowledgeHubVideo.findFirst({ where: { id: parsed.data.featuredVideoId, status: "published", category: { isVisible: true } } });
    if (!video) { res.status(400).json({ error: "Choose a published video in a visible category as the featured session." }); return; }
  }
  try {
    const { featuredVideoId, ...content } = parsed.data;
    const saved = await prisma.knowledgeHubVideoHubSettings.upsert({ where: { id: "singleton" }, create: { id: "singleton", ...content, highlights: content.highlights as Prisma.InputJsonValue, featuredVideoId }, update: { ...content, highlights: content.highlights as Prisma.InputJsonValue, featuredVideoId } });
    res.json(UpdateAdminKnowledgeHubVideoHubPageResponse.parse({ ...pageSettings(saved), featuredVideoId: saved.featuredVideoId }));
  } catch (error) { req.log.error({ err: error }, "Unable to update Video Hub page"); res.status(500).json({ error: "Unable to save Video Hub page settings." }); }
});

function validateVideoBody(parsed: any) {
  if (!parsed.success || !youtube(parsed.data?.youtubeUrl ?? "") || !objectPath(parsed.data?.thumbnailObjectPath ?? null) || (parsed.data?.thumbnailObjectPath && !parsed.data.thumbnailImageAltText.trim())) return null;
  return { ...parsed.data, youtubeUrl: youtube(parsed.data.youtubeUrl)! };
}
async function ensureCategory(id: string) { return prisma.knowledgeHubVideoCategory.findUnique({ where: { id }, select: { id: true, isVisible: true } }); }

router.post("/admin/knowledge-hub/video-hub/videos", requireAdmin, async (req, res): Promise<void> => {
  const data = validateVideoBody(CreateAdminKnowledgeHubVideoBody.safeParse(req.body));
  if (!data) { res.status(400).json({ error: "Check the video fields, YouTube URL, and thumbnail." }); return; }
  if (!(await ensureCategory(data.categoryId))) { res.status(400).json({ error: "Choose an existing Video Hub category." }); return; }
  try {
    const video = await prisma.knowledgeHubVideo.create({ data: { ...data, publishedAt: data.status === "published" ? new Date() : null }, include });
    res.status(201).json(CreateAdminKnowledgeHubVideoResponse.parse(record(video)));
  } catch (error) { if (conflict(error)) { res.status(409).json({ error: "A video with this slug already exists." }); return; } req.log.error({ err: error }, "Unable to create Video Hub video"); res.status(500).json({ error: "Unable to create this video." }); }
});

router.put("/admin/knowledge-hub/video-hub/videos/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminKnowledgeHubVideoParams.safeParse(req.params);
  const data = validateVideoBody(UpdateAdminKnowledgeHubVideoBody.safeParse(req.body));
  if (!params.success || !data) { res.status(400).json({ error: "Check the video fields, YouTube URL, and thumbnail." }); return; }
  const [existing, cat] = await Promise.all([prisma.knowledgeHubVideo.findUnique({ where: { id: params.data.id } }), ensureCategory(data.categoryId)]);
  if (!existing) { res.status(404).json({ error: "Video not found." }); return; }
  if (!cat) { res.status(400).json({ error: "Choose an existing Video Hub category." }); return; }
  try {
    const video = await prisma.$transaction(async (tx) => {
       if (data.status !== "published" || !cat.isVisible) await tx.knowledgeHubVideoHubSettings.updateMany({ where: { featuredVideoId: params.data.id }, data: { featuredVideoId: null } });
      return tx.knowledgeHubVideo.update({ where: { id: params.data.id }, data: { ...data, publishedAt: data.status === "published" ? existing.publishedAt ?? new Date() : null }, include });
    });
    res.json(UpdateAdminKnowledgeHubVideoResponse.parse(record(video)));
  } catch (error) { if (conflict(error)) { res.status(409).json({ error: "A video with this slug already exists." }); return; } if (missing(error)) { res.status(404).json({ error: "Video not found." }); return; } req.log.error({ err: error }, "Unable to update Video Hub video"); res.status(500).json({ error: "Unable to save this video." }); }
});

router.delete("/admin/knowledge-hub/video-hub/videos/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdminKnowledgeHubVideoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid video ID." }); return; }
  try { await prisma.$transaction(async (tx) => { await tx.knowledgeHubVideoHubSettings.updateMany({ where: { featuredVideoId: params.data.id }, data: { featuredVideoId: null } }); await tx.knowledgeHubVideo.delete({ where: { id: params.data.id } }); }); res.sendStatus(204); }
  catch (error) { if (missing(error)) { res.status(404).json({ error: "Video not found." }); return; } req.log.error({ err: error }, "Unable to delete Video Hub video"); res.status(500).json({ error: "Unable to delete this video." }); }
});

router.post("/admin/knowledge-hub/video-hub/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdminKnowledgeHubVideoCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Check the category name, slug, icon, and display order." }); return; }
  try { const value = await prisma.knowledgeHubVideoCategory.create({ data: parsed.data }); res.status(201).json(CreateAdminKnowledgeHubVideoCategoryResponse.parse(category(value, 0))); }
  catch (error) { if (conflict(error)) { res.status(409).json({ error: "A category with this slug already exists." }); return; } req.log.error({ err: error }, "Unable to create Video Hub category"); res.status(500).json({ error: "Unable to create this category." }); }
});
router.put("/admin/knowledge-hub/video-hub/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminKnowledgeHubVideoCategoryParams.safeParse(req.params); const parsed = UpdateAdminKnowledgeHubVideoCategoryBody.safeParse(req.body);
  if (!params.success || !parsed.success) { res.status(400).json({ error: "Check the category name, slug, icon, and display order." }); return; }
  try { const value = await prisma.$transaction(async (tx) => { if (!parsed.data.isVisible) { const settings = await tx.knowledgeHubVideoHubSettings.findUnique({ where: { id: "singleton" }, select: { featuredVideoId: true } }); if (settings?.featuredVideoId) { const featured = await tx.knowledgeHubVideo.findFirst({ where: { id: settings.featuredVideoId, categoryId: params.data.id }, select: { id: true } }); if (featured) await tx.knowledgeHubVideoHubSettings.updateMany({ where: { featuredVideoId: featured.id }, data: { featuredVideoId: null } }); } } return tx.knowledgeHubVideoCategory.update({ where: { id: params.data.id }, data: parsed.data }); }); const count = await prisma.knowledgeHubVideo.count({ where: { categoryId: value.id, status: "published" } }); res.json(UpdateAdminKnowledgeHubVideoCategoryResponse.parse(category(value, count))); }
  catch (error) { if (missing(error)) { res.status(404).json({ error: "Video category not found." }); return; } if (conflict(error)) { res.status(409).json({ error: "A category with this slug already exists." }); return; } req.log.error({ err: error }, "Unable to update Video Hub category"); res.status(500).json({ error: "Unable to update this category." }); }
});
router.delete("/admin/knowledge-hub/video-hub/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdminKnowledgeHubVideoCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid category ID." }); return; }
  try { if (await prisma.knowledgeHubVideo.count({ where: { categoryId: params.data.id } })) { res.status(409).json({ error: "Move or delete this category's videos before removing it." }); return; } await prisma.knowledgeHubVideoCategory.delete({ where: { id: params.data.id } }); res.sendStatus(204); }
  catch (error) { if (missing(error)) { res.status(404).json({ error: "Video category not found." }); return; } req.log.error({ err: error }, "Unable to delete Video Hub category"); res.status(500).json({ error: "Unable to delete this category." }); }
});

router.post("/admin/knowledge-hub/video-hub/images/upload-url", requireAdmin, async (req, res): Promise<void> => {
  const parsed = RequestAdminKnowledgeHubVideoImageUploadUrlBody.safeParse(req.body);
  if (!parsed.success || parsed.data.size > 5 * 1024 * 1024 || !IMAGE_TYPES.has(parsed.data.contentType)) { res.status(400).json({ error: "Choose a JPEG, PNG, or WebP image smaller than 5 MB." }); return; }
  try { const uploadURL = await storage.getObjectEntityUploadURL(); const path = storage.normalizeObjectEntityPath(uploadURL); if (!objectPath(path)) { res.status(500).json({ error: "Unable to prepare this image upload." }); return; } res.json(RequestAdminKnowledgeHubVideoImageUploadUrlResponse.parse({ uploadURL, objectPath: path })); }
  catch (error) { req.log.error({ err: error }, "Unable to create Video Hub image upload URL"); res.status(503).json({ error: "Image uploads are temporarily unavailable." }); }
});
router.post("/admin/knowledge-hub/video-hub/images/complete", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CompleteAdminKnowledgeHubVideoImageUploadBody.safeParse(req.body);
  if (!parsed.success || !objectPath(parsed.data.objectPath)) { res.status(400).json({ error: "Invalid uploaded image object." }); return; }
  try { const file = await storage.getObjectEntityFile(parsed.data.objectPath); const [metadata] = await file.getMetadata(); const contentType = String(metadata.contentType ?? ""); if (!IMAGE_TYPES.has(contentType) || Number(metadata.size ?? 0) > 5 * 1024 * 1024) { res.status(400).json({ error: "The uploaded image must be JPEG, PNG, or WebP and smaller than 5 MB." }); return; } const [header] = await file.download({ start: 0, end: 11 }); if (!hasImageSignature(contentType, header)) { res.status(400).json({ error: "The uploaded file does not match its image type." }); return; } const path = await storage.trySetObjectEntityAclPolicy(parsed.data.objectPath, { owner: "video-hub", visibility: "public" }); res.json(CompleteAdminKnowledgeHubVideoImageUploadResponse.parse({ objectPath: path, imageUrl: assetUrl(path) })); }
  catch (error) { if (error instanceof ObjectNotFoundError) { res.status(404).json({ error: "Uploaded image not found." }); return; } req.log.error({ err: error }, "Unable to complete Video Hub image upload"); res.status(500).json({ error: "Unable to complete this image upload." }); }
});

export default router;