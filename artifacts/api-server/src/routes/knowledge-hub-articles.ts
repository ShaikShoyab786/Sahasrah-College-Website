import { Prisma } from "@prisma/client";
import { Router, type IRouter } from "express";
import {
  CreateAdminKnowledgeHubArticleBody,
  CreateAdminKnowledgeHubArticleCategoryBody,
  CreateAdminKnowledgeHubArticleCategoryResponse,
  CreateAdminKnowledgeHubArticleResponse,
  DeleteAdminKnowledgeHubArticleCategoryParams,
  DeleteAdminKnowledgeHubArticleParams,
  GetAdminKnowledgeHubArticlesResponse,
  GetKnowledgeHubArticleBySlugParams,
  GetKnowledgeHubArticleBySlugResponse,
  GetKnowledgeHubArticlesPageResponse,
  GetKnowledgeHubArticlesQueryParams,
  GetKnowledgeHubArticlesResponse,
  UpdateAdminKnowledgeHubArticleBody,
  UpdateAdminKnowledgeHubArticleCategoryBody,
  UpdateAdminKnowledgeHubArticleCategoryParams,
  UpdateAdminKnowledgeHubArticleCategoryResponse,
  UpdateAdminKnowledgeHubArticleParams,
  UpdateAdminKnowledgeHubArticleResponse,
  UpdateAdminKnowledgeHubArticlesPageBody,
  UpdateAdminKnowledgeHubArticlesPageResponse,
} from "@workspace/api-zod";
import { DEFAULT_KNOWLEDGE_HUB_ARTICLES_PAGE } from "../lib/knowledge-hub-articles-content";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

type ArticleWithCategory = Prisma.KnowledgeHubArticleGetPayload<{ include: { category: true } }>;
type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  displayOrder: number;
  isVisible: boolean;
};

function readPageContent(value: Prisma.JsonValue | undefined) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return DEFAULT_KNOWLEDGE_HUB_ARTICLES_PAGE;
}

function isSafeImageUrl(value: string | null) {
  if (value === null) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.split("/").includes("..")) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isSafeLink(value: string) {
  if (value.startsWith("#")) return value.length > 1;
  if (value.startsWith("/") && !value.startsWith("//") && !value.split("/").includes("..")) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isUniqueConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function isMissingRecord(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

function toArticleSummary(article: ArticleWithCategory) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    categoryId: article.categoryId,
    categoryName: article.category.name,
    categorySlug: article.category.slug,
    categoryIcon: article.category.icon,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImageUrl,
    coverImageAltText: article.coverImageAltText,
    author: article.author,
    readTimeMinutes: article.readTimeMinutes,
    publishedAt: article.publishedAt?.toISOString() ?? null,
  };
}

function toArticle(article: ArticleWithCategory) {
  return {
    ...toArticleSummary(article),
    body: article.body,
    status: article.status,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

async function getPublishedCountsByCategory() {
  const rows = await prisma.knowledgeHubArticle.groupBy({
    by: ["categoryId"],
    where: { status: "published" },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.categoryId, row._count._all]));
}

function toCategory(category: CategoryWithCount, publishedArticleCount: number) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    displayOrder: category.displayOrder,
    isVisible: category.isVisible,
    publishedArticleCount,
  };
}

async function loadCategoryResponseRows(visibleOnly: boolean) {
  const [categories, counts] = await Promise.all([
    prisma.knowledgeHubArticleCategory.findMany({
      where: visibleOnly ? { isVisible: true } : undefined,
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    getPublishedCountsByCategory(),
  ]);
  return categories.map((category) => toCategory(category, counts.get(category.id) ?? 0));
}

router.get("/knowledge-hub/articles/page", async (req, res): Promise<void> => {
  try {
    const [page, categories, publishedArticleCount] = await Promise.all([
      prisma.knowledgeHubArticlesPageSettings.findUnique({ where: { id: "singleton" } }),
      loadCategoryResponseRows(true),
      prisma.knowledgeHubArticle.count({
        where: { status: "published", category: { isVisible: true } },
      }),
    ]);

    let featuredArticle: ReturnType<typeof toArticleSummary> | null = null;
    if (page?.featuredArticleId) {
      const found = await prisma.knowledgeHubArticle.findFirst({
        where: {
          id: page.featuredArticleId,
          status: "published",
          category: { isVisible: true },
        },
        include: { category: true },
      });
      if (found) featuredArticle = toArticleSummary(found);
    }

    res.json(GetKnowledgeHubArticlesPageResponse.parse({
      settings: readPageContent(page?.content),
      featuredArticle,
      publishedArticleCount,
      publishedCategoryCount: categories.filter((category) => category.publishedArticleCount > 0).length,
      categories,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read Knowledge Hub Articles page");
    res.status(500).json({ error: "Unable to load Articles page content." });
  }
});

router.get("/knowledge-hub/articles", async (req, res): Promise<void> => {
  const rawQuery = {
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    category: typeof req.query.category === "string" ? req.query.category : undefined,
    sort: typeof req.query.sort === "string" ? req.query.sort : "recent",
    offset: req.query.offset === undefined ? 0 : Number(req.query.offset),
    limit: req.query.limit === undefined ? 9 : Number(req.query.limit),
  };
  const query = GetKnowledgeHubArticlesQueryParams.safeParse(rawQuery);
  if (!query.success) {
    res.status(400).json({ error: "Check the article search, filter, and page settings." });
    return;
  }

  const where: Prisma.KnowledgeHubArticleWhereInput = {
    status: "published",
    category: query.data.category
      ? { isVisible: true, slug: query.data.category }
      : { isVisible: true },
    ...(query.data.search ? {
      OR: [
        { title: { contains: query.data.search, mode: "insensitive" } },
        { excerpt: { contains: query.data.search, mode: "insensitive" } },
        { body: { contains: query.data.search, mode: "insensitive" } },
      ],
    } : {}),
  };
  const orderBy: Prisma.KnowledgeHubArticleOrderByWithRelationInput[] = query.data.sort === "oldest"
    ? [{ publishedAt: "asc" }, { id: "asc" }]
    : query.data.sort === "title"
      ? [{ title: "asc" }, { id: "asc" }]
      : [{ publishedAt: "desc" }, { id: "asc" }];

  try {
    const [articles, total] = await Promise.all([
      prisma.knowledgeHubArticle.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: query.data.offset,
        take: query.data.limit,
      }),
      prisma.knowledgeHubArticle.count({ where }),
    ]);
    res.json(GetKnowledgeHubArticlesResponse.parse({
      items: articles.map(toArticleSummary),
      total,
      offset: query.data.offset,
      limit: query.data.limit,
      hasMore: query.data.offset + articles.length < total,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to search Knowledge Hub Articles");
    res.status(500).json({ error: "Unable to load articles." });
  }
});

router.get("/knowledge-hub/articles/:slug", async (req, res): Promise<void> => {
  const params = GetKnowledgeHubArticleBySlugParams.safeParse({ slug: req.params.slug });
  if (!params.success) {
    res.status(400).json({ error: "Invalid article link." });
    return;
  }
  try {
    const article = await prisma.knowledgeHubArticle.findFirst({
      where: {
        slug: params.data.slug,
        status: "published",
        category: { isVisible: true },
      },
      include: { category: true },
    });
    if (!article) {
      res.status(404).json({ error: "Article not found." });
      return;
    }
    res.json(GetKnowledgeHubArticleBySlugResponse.parse(toArticle(article)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read Knowledge Hub article");
    res.status(500).json({ error: "Unable to load this article." });
  }
});

router.get("/admin/knowledge-hub/articles", requireAdmin, async (req, res): Promise<void> => {
  try {
    const [page, categories, articles] = await Promise.all([
      prisma.knowledgeHubArticlesPageSettings.findUnique({ where: { id: "singleton" } }),
      loadCategoryResponseRows(false),
      prisma.knowledgeHubArticle.findMany({
        include: { category: true },
        orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      }),
    ]);
    res.json(GetAdminKnowledgeHubArticlesResponse.parse({
      settings: {
        ...readPageContent(page?.content),
        featuredArticleId: page?.featuredArticleId ?? null,
      },
      categories,
      articles: articles.map(toArticle),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin Knowledge Hub Articles content");
    res.status(500).json({ error: "Unable to load Articles management content." });
  }
});

router.put("/admin/knowledge-hub/articles/page", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminKnowledgeHubArticlesPageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the Articles page content and links." });
    return;
  }
  const { featuredArticleId, ...content } = parsed.data;
  if (
    !isSafeImageUrl(content.heroImageUrl)
    || (content.heroImageUrl !== null && !content.heroImageAltText.trim())
    || !isSafeLink(content.heroCtaHref)
    || !isSafeLink(content.topicPanelHref)
    || !isSafeLink(content.updatesPanelHref)
  ) {
    res.status(400).json({ error: "Check the hero image text and page links." });
    return;
  }
  if (featuredArticleId !== null) {
    const article = await prisma.knowledgeHubArticle.findFirst({
      where: { id: featuredArticleId, status: "published", category: { isVisible: true } },
      select: { id: true },
    });
    if (!article) {
      res.status(400).json({ error: "Choose a published article in a visible category as the featured article." });
      return;
    }
  }

  try {
    const settings = await prisma.knowledgeHubArticlesPageSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        content: content as Prisma.InputJsonValue,
        featuredArticleId,
      },
      update: {
        content: content as Prisma.InputJsonValue,
        featuredArticleId,
      },
    });
    res.json(UpdateAdminKnowledgeHubArticlesPageResponse.parse({
      ...readPageContent(settings.content),
      featuredArticleId: settings.featuredArticleId,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update Articles page settings");
    res.status(500).json({ error: "Unable to save Articles page settings." });
  }
});

router.post("/admin/knowledge-hub/articles/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdminKnowledgeHubArticleCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the category name, slug, and display order." });
    return;
  }
  try {
    const category = await prisma.knowledgeHubArticleCategory.create({ data: parsed.data });
    res.status(201).json(CreateAdminKnowledgeHubArticleCategoryResponse.parse(toCategory(category, 0)));
  } catch (error) {
    if (isUniqueConflict(error)) {
      res.status(409).json({ error: "A category with this slug already exists." });
      return;
    }
    req.log.error({ err: error }, "Unable to create Articles category");
    res.status(500).json({ error: "Unable to create this category." });
  }
});

router.put("/admin/knowledge-hub/articles/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminKnowledgeHubArticleCategoryParams.safeParse({ id: req.params.id });
  const parsed = UpdateAdminKnowledgeHubArticleCategoryBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Check the category name, slug, and display order." });
    return;
  }
  try {
    const category = await prisma.knowledgeHubArticleCategory.update({
      where: { id: params.data.id },
      data: parsed.data,
    });
    const publishedArticleCount = await prisma.knowledgeHubArticle.count({
      where: { categoryId: category.id, status: "published" },
    });
    res.json(UpdateAdminKnowledgeHubArticleCategoryResponse.parse(toCategory(category, publishedArticleCount)));
  } catch (error) {
    if (isMissingRecord(error)) {
      res.status(404).json({ error: "Article category not found." });
      return;
    }
    if (isUniqueConflict(error)) {
      res.status(409).json({ error: "A category with this slug already exists." });
      return;
    }
    req.log.error({ err: error }, "Unable to update Articles category");
    res.status(500).json({ error: "Unable to update this category." });
  }
});

router.delete("/admin/knowledge-hub/articles/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdminKnowledgeHubArticleCategoryParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid category ID." });
    return;
  }
  try {
    const articleCount = await prisma.knowledgeHubArticle.count({ where: { categoryId: params.data.id } });
    if (articleCount > 0) {
      res.status(409).json({ error: "Move or delete this category's articles before removing the category." });
      return;
    }
    await prisma.knowledgeHubArticleCategory.delete({ where: { id: params.data.id } });
    res.sendStatus(204);
  } catch (error) {
    if (isMissingRecord(error)) {
      res.status(404).json({ error: "Article category not found." });
      return;
    }
    req.log.error({ err: error }, "Unable to delete Articles category");
    res.status(500).json({ error: "Unable to delete this category." });
  }
});

router.post("/admin/knowledge-hub/articles", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdminKnowledgeHubArticleBody.safeParse(req.body);
  if (!parsed.success || !isSafeImageUrl(parsed.data?.coverImageUrl ?? null) || (parsed.data?.coverImageUrl && !parsed.data.coverImageAltText.trim())) {
    res.status(400).json({ error: "Check the article fields and cover image text." });
    return;
  }
  const category = await prisma.knowledgeHubArticleCategory.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });
  if (!category) {
    res.status(400).json({ error: "Choose an existing article category." });
    return;
  }
  try {
    const article = await prisma.knowledgeHubArticle.create({
      data: {
        ...parsed.data,
        publishedAt: parsed.data.status === "published" ? new Date() : null,
      },
      include: { category: true },
    });
    res.status(201).json(CreateAdminKnowledgeHubArticleResponse.parse(toArticle(article)));
  } catch (error) {
    if (isUniqueConflict(error)) {
      res.status(409).json({ error: "An article with this slug already exists." });
      return;
    }
    req.log.error({ err: error }, "Unable to create Knowledge Hub article");
    res.status(500).json({ error: "Unable to create this article." });
  }
});

router.put("/admin/knowledge-hub/articles/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminKnowledgeHubArticleParams.safeParse({ id: req.params.id });
  const parsed = UpdateAdminKnowledgeHubArticleBody.safeParse(req.body);
  if (!params.success || !parsed.success || !isSafeImageUrl(parsed.data?.coverImageUrl ?? null) || (parsed.data?.coverImageUrl && !parsed.data.coverImageAltText.trim())) {
    res.status(400).json({ error: "Check the article fields and cover image text." });
    return;
  }
  const [existing, category] = await Promise.all([
    prisma.knowledgeHubArticle.findUnique({
      where: { id: params.data.id },
      select: { id: true, publishedAt: true },
    }),
    prisma.knowledgeHubArticleCategory.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    }),
  ]);
  if (!existing) {
    res.status(404).json({ error: "Article not found." });
    return;
  }
  if (!category) {
    res.status(400).json({ error: "Choose an existing article category." });
    return;
  }
  try {
    const article = await prisma.$transaction(async (tx) => {
      if (parsed.data.status === "draft") {
        await tx.knowledgeHubArticlesPageSettings.updateMany({
          where: { featuredArticleId: params.data.id },
          data: { featuredArticleId: null },
        });
      }
      return tx.knowledgeHubArticle.update({
        where: { id: params.data.id },
        data: {
          ...parsed.data,
          publishedAt: parsed.data.status === "published"
            ? existing.publishedAt ?? new Date()
            : null,
        },
        include: { category: true },
      });
    });
    res.json(UpdateAdminKnowledgeHubArticleResponse.parse(toArticle(article)));
  } catch (error) {
    if (isUniqueConflict(error)) {
      res.status(409).json({ error: "An article with this slug already exists." });
      return;
    }
    if (isMissingRecord(error)) {
      res.status(404).json({ error: "Article not found." });
      return;
    }
    req.log.error({ err: error }, "Unable to update Knowledge Hub article");
    res.status(500).json({ error: "Unable to save this article." });
  }
});

router.delete("/admin/knowledge-hub/articles/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdminKnowledgeHubArticleParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid article ID." });
    return;
  }
  try {
    await prisma.knowledgeHubArticle.delete({ where: { id: params.data.id } });
    res.sendStatus(204);
  } catch (error) {
    if (isMissingRecord(error)) {
      res.status(404).json({ error: "Article not found." });
      return;
    }
    req.log.error({ err: error }, "Unable to delete Knowledge Hub article");
    res.status(500).json({ error: "Unable to delete this article." });
  }
});

export default router;