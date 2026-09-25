import { Router, type IRouter } from "express";
import { Prisma } from "@prisma/client";
import {
  CreateAdminFacultyMemberBody,
  CreateAdminFacultyMemberResponse,
  DeleteAdminFacultyMemberParams,
  DeleteAdminFacultyMemberResponse,
  GetAdminFacultyResponse,
  GetFacultyPageResponse,
  GetHomepageFacultyResponse,
  UpdateAdminFacultyMemberBody,
  UpdateAdminFacultyMemberParams,
  UpdateAdminFacultyMemberResponse,
  UpdateAdminFacultyOrderBody,
  UpdateAdminFacultyOrderResponse,
  UpdateAdminFacultySettingsBody,
  UpdateAdminFacultySettingsResponse,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

type FacultyRecord = {
  id: string;
  imageUrl: string | null;
  imageAltText: string;
  name: string;
  role: string;
  subject: string;
  qualification: string;
  experience: string;
  biography: string;
  socialLinks: Prisma.JsonValue;
  displayOrder: number;
  isActive: boolean;
  showInHomePreview: boolean;
  homePreviewOrder: number;
};

function isValidImageReference(value: string | null) {
  return value === null || value.startsWith("/api/uploads/") || isHttpUrl(value);
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function toSocialLinks(value: Prisma.JsonValue) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const label = entry.label;
    const href = entry.href;
    if (
      typeof label !== "string" ||
      !label.trim() ||
      label.length > 48 ||
      typeof href !== "string" ||
      href.length > 500 ||
      !isHttpUrl(href)
    ) {
      return [];
    }
    return [{ label: label.trim(), href }];
  });
}

function toFacultyProfile(member: FacultyRecord) {
  return {
    id: member.id,
    imageUrl: member.imageUrl,
    imageAltText: member.imageAltText,
    name: member.name,
    role: member.role,
    subject: member.subject,
    qualification: member.qualification,
    experience: member.experience,
    biography: member.biography,
    socialLinks: toSocialLinks(member.socialLinks),
    displayOrder: member.displayOrder,
    isActive: member.isActive,
  };
}

function toAdminFacultyMember(member: FacultyRecord) {
  return {
    ...toFacultyProfile(member),
    showInHomePreview: member.showInHomePreview,
    homePreviewOrder: member.homePreviewOrder,
  };
}

async function readFacultyCollection(includeInactive: boolean) {
  const [settings, members] = await Promise.all([
    prisma.facultyPageSettings.findUnique({ where: { id: "singleton" } }),
    prisma.facultyMember.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    }),
  ]);
  if (!settings) throw new Error("Faculty page settings have not been initialized.");
  return {
    settings: {
      eyebrow: settings.eyebrow,
      heading: settings.heading,
      description: settings.description,
    },
    members: members.map(includeInactive ? toAdminFacultyMember : toFacultyProfile),
  };
}

function hasValidSocialLinks(links: Array<{ label: string; href: string }>) {
  return links.every((link) => link.label.trim().length > 0 && isHttpUrl(link.href));
}

function memberWriteData(input: {
  imageUrl: string | null;
  imageAltText: string;
  name: string;
  role: string;
  subject: string;
  qualification: string;
  experience: string;
  biography: string;
  socialLinks: Array<{ label: string; href: string }>;
  displayOrder: number;
  isActive: boolean;
  showInHomePreview: boolean;
  homePreviewOrder: number;
}) {
  return {
    ...input,
    socialLinks: input.socialLinks as unknown as Prisma.InputJsonValue,
  };
}

router.get("/homepage-faculty", async (req, res): Promise<void> => {
  try {
    const members = await prisma.facultyMember.findMany({
      where: { isActive: true, showInHomePreview: true },
      orderBy: [{ homePreviewOrder: "asc" }, { id: "asc" }],
    });
    res.json(
      GetHomepageFacultyResponse.parse(
        members.map((member) => ({
          ...toFacultyProfile(member),
          displayOrder: member.homePreviewOrder,
        })),
      ),
    );
  } catch (error) {
    req.log.error({ err: error }, "Unable to read homepage faculty");
    res.status(500).json({ error: "Unable to load homepage faculty." });
  }
});

router.get("/faculty", async (req, res): Promise<void> => {
  try {
    res.json(GetFacultyPageResponse.parse(await readFacultyCollection(false)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read the Faculty page");
    res.status(500).json({ error: "Unable to load the Faculty page." });
  }
});

router.get("/admin/faculty", requireAdmin, async (req, res): Promise<void> => {
  try {
    res.json(GetAdminFacultyResponse.parse(await readFacultyCollection(true)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin Faculty content");
    res.status(500).json({ error: "Unable to load Faculty content." });
  }
});

router.put("/admin/faculty/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminFacultySettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the Faculty eyebrow, heading, and description." });
    return;
  }
  try {
    const settings = await prisma.facultyPageSettings.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });
    res.json(
      UpdateAdminFacultySettingsResponse.parse({
        eyebrow: settings.eyebrow,
        heading: settings.heading,
        description: settings.description,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Unable to update Faculty page copy");
    res.status(500).json({ error: "Unable to save Faculty page copy." });
  }
});

router.post("/admin/faculty/members", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdminFacultyMemberBody.safeParse(req.body);
  if (
    !parsed.success ||
    !isValidImageReference(parsed.data?.imageUrl ?? null) ||
    (parsed.success && !hasValidSocialLinks(parsed.data.socialLinks))
  ) {
    res.status(400).json({ error: "Check the faculty profile fields, image reference, and social links." });
    return;
  }
  try {
    const member = await prisma.facultyMember.create({ data: memberWriteData(parsed.data) });
    res.status(201).json(CreateAdminFacultyMemberResponse.parse(toAdminFacultyMember(member)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to create faculty profile");
    res.status(500).json({ error: "Unable to create faculty profile." });
  }
});

router.put("/admin/faculty/members/order", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminFacultyOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the faculty profile ordering." });
    return;
  }
  const requested = parsed.data.items;
  if (
    new Set(requested.map((item) => item.id)).size !== requested.length ||
    new Set(requested.map((item) => item.displayOrder)).size !== requested.length
  ) {
    res.status(400).json({ error: "Faculty IDs and full-page orders must be unique." });
    return;
  }
  try {
    const members = await prisma.$transaction(async (tx) => {
      const current = await tx.facultyMember.findMany({ select: { id: true, showInHomePreview: true } });
      const currentIds = new Set(current.map((member) => member.id));
      if (requested.length !== current.length || requested.some((item) => !currentIds.has(item.id))) {
        throw new Error("The faculty list changed. Reload and try again.");
      }
      const selectedIds = new Set(current.filter((member) => member.showInHomePreview).map((member) => member.id));
      const selectedHomeOrders = requested.filter((item) => selectedIds.has(item.id)).map((item) => item.homePreviewOrder);
      if (new Set(selectedHomeOrders).size !== selectedHomeOrders.length) {
        throw new Error("Selected Home preview orders must be unique.");
      }
      for (const item of requested) {
        await tx.facultyMember.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder, homePreviewOrder: item.homePreviewOrder },
        });
      }
      return tx.facultyMember.findMany({ orderBy: [{ displayOrder: "asc" }, { id: "asc" }] });
    });
    res.json(UpdateAdminFacultyOrderResponse.parse(members.map(toAdminFacultyMember)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to reorder faculty profiles");
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to reorder faculty profiles." });
  }
});

router.put("/admin/faculty/members/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminFacultyMemberParams.safeParse(req.params);
  const parsed = UpdateAdminFacultyMemberBody.safeParse(req.body);
  if (
    !params.success ||
    !parsed.success ||
    !isValidImageReference(parsed.data?.imageUrl ?? null) ||
    (parsed.success && !hasValidSocialLinks(parsed.data.socialLinks))
  ) {
    res.status(400).json({ error: "Check the faculty profile fields, image reference, and social links." });
    return;
  }
  try {
    const member = await prisma.facultyMember.update({
      where: { id: params.data.id },
      data: memberWriteData(parsed.data),
    });
    res.json(UpdateAdminFacultyMemberResponse.parse(toAdminFacultyMember(member)));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      res.status(404).json({ error: "Faculty profile not found." });
      return;
    }
    req.log.error({ err: error }, "Unable to update faculty profile");
    res.status(500).json({ error: "Unable to update faculty profile." });
  }
});

router.delete("/admin/faculty/members/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdminFacultyMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid faculty profile ID." });
    return;
  }
  try {
    await prisma.facultyMember.delete({ where: { id: params.data.id } });
    res.json(DeleteAdminFacultyMemberResponse.parse({ id: params.data.id }));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      res.status(404).json({ error: "Faculty profile not found." });
      return;
    }
    req.log.error({ err: error }, "Unable to delete faculty profile");
    res.status(500).json({ error: "Unable to delete faculty profile." });
  }
});

export default router;