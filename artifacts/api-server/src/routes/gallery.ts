import { Router, type IRouter } from "express";
import {
  CreateAdminGalleryItemBody,
  CreateAdminGalleryItemResponse,
  DeleteAdminGalleryItemParams,
  GetAdminGalleryResponse,
  GetGalleryPageResponse,
  GetHomepageGalleryResponse,
  UpdateAdminGalleryItemBody,
  UpdateAdminGalleryItemParams,
  UpdateAdminGalleryItemResponse,
  UpdateAdminGalleryOrderBody,
  UpdateAdminGalleryOrderResponse,
  UpdateAdminGallerySettingsBody,
  UpdateAdminGallerySettingsResponse,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

function isValidImageReference(value: string | null) {
  return value === null || value.startsWith("/api/uploads/") || value.startsWith("https://") || value.startsWith("http://");
}

function toGalleryItem(item: {
  id: string;
  imageUrl: string | null;
  imageAltText: string;
  title: string;
  description: string | null;
  category: string;
  locationLabel: string | null;
  displayOrder: number;
  isPublished: boolean;
  showInHomePreview: boolean;
  showOnCourses: boolean;
  homePreviewOrder: number;
}) {
  return {
    id: item.id,
    imageUrl: item.imageUrl,
    imageAltText: item.imageAltText,
    title: item.title,
    description: item.description,
    category: item.category,
    locationLabel: item.locationLabel,
    displayOrder: item.displayOrder,
    isPublished: item.isPublished,
    showInHomePreview: item.showInHomePreview,
    showOnCourses: item.showOnCourses,
    homePreviewOrder: item.homePreviewOrder,
  };
}

async function readGalleryCollection(includeUnpublished: boolean) {
  const [settings, items] = await Promise.all([
    prisma.galleryPageSettings.findUnique({ where: { id: "singleton" } }),
    prisma.galleryItem.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    }),
  ]);
  if (!settings) throw new Error("Gallery settings have not been initialized.");
  return {
    settings: {
      eyebrow: settings.eyebrow,
      heading: settings.heading,
      description: settings.description,
    },
    items: items.map(toGalleryItem),
  };
}

router.get("/gallery", async (req, res): Promise<void> => {
  try {
    res.json(GetGalleryPageResponse.parse(await readGalleryCollection(false)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read the Gallery page");
    res.status(500).json({ error: "Unable to load the Gallery page." });
  }
});

router.get("/homepage-gallery", async (req, res): Promise<void> => {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { isPublished: true, showInHomePreview: true, imageUrl: { not: null } },
      orderBy: [{ homePreviewOrder: "asc" }, { id: "asc" }],
      take: 6,
    });
    const preview = items.map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl,
      imageAltText: item.imageAltText,
      title: item.title,
      category: item.category,
      description: item.description ?? "",
      locationLabel: item.locationLabel,
      displayOrder: item.homePreviewOrder,
      isFeatured: true,
      isActive: true,
    }));
    res.json(GetHomepageGalleryResponse.parse(preview));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage gallery");
    res.status(500).json({ error: "Unable to load homepage gallery." });
  }
});

router.get("/admin/gallery", requireAdmin, async (req, res): Promise<void> => {
  try {
    res.json(GetAdminGalleryResponse.parse(await readGalleryCollection(true)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin Gallery content");
    res.status(500).json({ error: "Unable to load Gallery content." });
  }
});

router.put("/admin/gallery/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminGallerySettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the Gallery eyebrow, heading, and description." });
    return;
  }
  try {
    const settings = await prisma.galleryPageSettings.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });
    res.json(UpdateAdminGallerySettingsResponse.parse({
      eyebrow: settings.eyebrow,
      heading: settings.heading,
      description: settings.description,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update Gallery page copy");
    res.status(500).json({ error: "Unable to save Gallery page copy." });
  }
});

router.post("/admin/gallery/items", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdminGalleryItemBody.safeParse(req.body);
  if (!parsed.success || !isValidImageReference(parsed.data?.imageUrl ?? null) || (parsed.data?.isPublished && !parsed.data.imageUrl)) {
    res.status(400).json({ error: "Check the Gallery item fields and image reference. Published items require an image." });
    return;
  }
  try {
    const item = await prisma.galleryItem.create({ data: parsed.data });
    res.status(201).json(CreateAdminGalleryItemResponse.parse(toGalleryItem(item)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to create Gallery item");
    res.status(500).json({ error: "Unable to create Gallery item." });
  }
});

router.put("/admin/gallery/items/order", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminGalleryOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the Gallery item order." });
    return;
  }
  const requested = parsed.data.items;
  if (new Set(requested.map((item) => item.id)).size !== requested.length || new Set(requested.map((item) => item.displayOrder)).size !== requested.length) {
    res.status(400).json({ error: "Gallery item IDs and full-page display orders must be unique." });
    return;
  }
  try {
    const orderedItems = await prisma.$transaction(async (tx) => {
      const current = await tx.galleryItem.findMany({ select: { id: true, showInHomePreview: true } });
      const currentIds = new Set(current.map((item) => item.id));
      if (requested.length !== current.length || requested.some((item) => !currentIds.has(item.id))) {
        throw new Error("Gallery item list changed. Reload and try again.");
      }
      const selectedHomeItems = requested.filter((item) => current.find((entry) => entry.id === item.id)?.showInHomePreview);
      if (new Set(selectedHomeItems.map((item) => item.homePreviewOrder)).size !== selectedHomeItems.length) {
        throw new Error("Home preview orders must be unique.");
      }
      for (const item of requested) {
        await tx.galleryItem.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder, homePreviewOrder: item.homePreviewOrder },
        });
      }
      return tx.galleryItem.findMany({ orderBy: [{ displayOrder: "asc" }, { id: "asc" }] });
    });
    res.json(UpdateAdminGalleryOrderResponse.parse(orderedItems.map(toGalleryItem)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to reorder Gallery items");
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to reorder Gallery items." });
  }
});

router.put("/admin/gallery/items/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminGalleryItemParams.safeParse(req.params);
  const parsed = UpdateAdminGalleryItemBody.safeParse(req.body);
  if (!params.success || !parsed.success || !isValidImageReference(parsed.data?.imageUrl ?? null) || (parsed.data?.isPublished && !parsed.data.imageUrl)) {
    res.status(400).json({ error: "Check the Gallery item fields and image reference. Published items require an image." });
    return;
  }
  try {
    const item = await prisma.galleryItem.update({
      where: { id: params.data.id },
      data: parsed.data,
    });
    res.json(UpdateAdminGalleryItemResponse.parse(toGalleryItem(item)));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      res.status(404).json({ error: "Gallery item not found." });
      return;
    }
    req.log.error({ err: error }, "Unable to update Gallery item");
    res.status(500).json({ error: "Unable to update Gallery item." });
  }
});

router.delete("/admin/gallery/items/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdminGalleryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid Gallery item ID." });
    return;
  }
  try {
    await prisma.galleryItem.delete({ where: { id: params.data.id } });
    res.sendStatus(204);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      res.status(404).json({ error: "Gallery item not found." });
      return;
    }
    req.log.error({ err: error }, "Unable to delete Gallery item");
    res.status(500).json({ error: "Unable to delete Gallery item." });
  }
});

export default router;