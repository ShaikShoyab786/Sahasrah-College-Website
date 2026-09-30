import { Router, type IRouter } from "express";
import {
  CreateAdminContactEnquiryNoteBody,
  CreateAdminContactEnquiryNoteResponse,
  GetAdminContactEnquiryResponse,
  GetAdminContactEnquiriesResponse,
  GetAdminContactSettingsResponse,
  GetCallbackPopupSettingsResponse,
  GetContactSettingsResponse,
  SubmitContactEnquiryBody,
  SubmitContactEnquiryResponse,
  UpdateAdminContactEnquiryBody,
  UpdateAdminContactEnquiryResponse,
  UpdateContactSettingsBody,
  UpdateContactSettingsResponse,
} from "@workspace/api-zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";
import {
  getContactCourseOptions,
  normalizeContactCourseOptions,
} from "../lib/contact-course-options";

const router: IRouter = Router();

type ContactSocialLink = { label: string; href: string };

function readJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toContactResponse(settings: {
  id: string;
  eyebrow: string;
  heading: string;
  description: string;
  formHeading: string;
  formDescription: string;
  responseTimeMessage: string;
  mainEmail: string;
  primaryPhone: string;
  additionalPhones: string;
  whatsappNumber: string;
  address: string;
  workingHours: string;
  mapEmbedUrl: string | null;
  mapLabel: string;
  logoUrl: string | null;
  socialLinks: string;
  courseOptions: string;
  nameLabel: string;
  phoneLabel: string;
  courseLabel: string;
  emailLabel: string;
  messageLabel: string;
  submitButtonLabel: string;
  successMessage: string;
  prospectusButtonLabel: string;
  prospectusButtonHref: string;
  campusVisitButtonLabel: string;
  campusVisitButtonHref: string;
  callbackPopupEnabled: boolean;
  callbackPopupDelaySeconds: number;
  callbackPopupEyebrow: string;
  callbackPopupHeading: string;
  callbackPopupDescription: string;
  callbackPopupNameLabel: string;
  callbackPopupPhoneLabel: string;
  callbackPopupCourseLabel: string;
  callbackPopupEmailLabel: string;
  callbackPopupMessageLabel: string;
  callbackPopupSubmitButtonLabel: string;
  callbackPopupSuccessMessage: string;
  isVisible: boolean;
  updatedAt: Date;
}) {
  return {
    ...settings,
    additionalPhones: readJson<string[]>(settings.additionalPhones, []),
    socialLinks: readJson<ContactSocialLink[]>(settings.socialLinks, []),
    courseOptions: getContactCourseOptions(settings.courseOptions),
  };
}

function normalizeIndianMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  const mobile = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(mobile) ? `+91${mobile}` : null;
}

router.get("/contact", async (req, res) => {
  try {
    const settings = await prisma.contactSettings.findUnique({ where: { id: "singleton" } });
    if (!settings || !settings.isVisible) {
      res.status(404).json({ error: "Contact page is not available." });
      return;
    }
    res.json(GetContactSettingsResponse.parse(toContactResponse(settings)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read Contact settings");
    res.status(500).json({ error: "Unable to load Contact settings." });
  }
});

router.get("/callback-popup-settings", async (req, res) => {
  try {
    const settings = await prisma.contactSettings.findUnique({ where: { id: "singleton" } });
    if (!settings) {
      res.status(404).json({ error: "Callback popup settings are not available." });
      return;
    }
    res.json(GetCallbackPopupSettingsResponse.parse({
      callbackPopupEnabled: settings.callbackPopupEnabled,
      callbackPopupDelaySeconds: settings.callbackPopupDelaySeconds,
      callbackPopupEyebrow: settings.callbackPopupEyebrow,
      callbackPopupHeading: settings.callbackPopupHeading,
      callbackPopupDescription: settings.callbackPopupDescription,
      callbackPopupNameLabel: settings.callbackPopupNameLabel,
      callbackPopupPhoneLabel: settings.callbackPopupPhoneLabel,
      callbackPopupCourseLabel: settings.callbackPopupCourseLabel,
      callbackPopupEmailLabel: settings.callbackPopupEmailLabel,
      callbackPopupMessageLabel: settings.callbackPopupMessageLabel,
      callbackPopupSubmitButtonLabel: settings.callbackPopupSubmitButtonLabel,
      callbackPopupSuccessMessage: settings.callbackPopupSuccessMessage,
      courseOptions: getContactCourseOptions(settings.courseOptions),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read callback popup settings");
    res.status(500).json({ error: "Unable to load callback popup settings." });
  }
});

router.post("/contact-enquiries", async (req, res) => {
  const isCallbackRequest = req.body?.source === "callback-request";
  const validationMessage = isCallbackRequest
    ? "Enter your name and a valid Indian mobile number."
    : "Enter your name, a valid Indian mobile number, and choose a course.";
  const raw = {
    ...req.body,
    name: typeof req.body?.name === "string" ? req.body.name.trim() : req.body?.name,
    phone: typeof req.body?.phone === "string" ? req.body.phone.replace(/\D/g, "") : req.body?.phone,
    course: typeof req.body?.course === "string" ? req.body.course.trim() || undefined : req.body?.course,
    email: typeof req.body?.email === "string" ? req.body.email.trim() || undefined : req.body?.email,
    message: typeof req.body?.message === "string" ? req.body.message.trim() || undefined : req.body?.message,
  };
  const parsed = SubmitContactEnquiryBody.safeParse(raw);
  if (!parsed.success) {
    res.status(400).json({ error: validationMessage });
    return;
  }

  const settings = await prisma.contactSettings.findUnique({ where: { id: "singleton" } });
  const phone = normalizeIndianMobile(parsed.data.phone);
  const courses = settings ? getContactCourseOptions(settings.courseOptions) : [];
  const source = parsed.data.source ?? "contact-form";
  const course = parsed.data.course ?? null;
  const pageIsUnavailable = isCallbackRequest
    ? !settings?.callbackPopupEnabled
    : !settings?.isVisible || !course;
  if (!phone || !settings || pageIsUnavailable || (course !== null && !courses.includes(course))) {
    res.status(400).json({ error: validationMessage });
    return;
  }

  const enquiry = await prisma.contactEnquiry.create({
    data: {
      name: parsed.data.name,
      phone,
      course,
      source,
      email: parsed.data.email ?? null,
      message: parsed.data.message ?? null,
      status: "new",
      type: source === "callback-request" ? "call-back-requested" : "other",
    },
  });

  res.status(201).json(SubmitContactEnquiryResponse.parse({
    enquiryId: enquiry.id,
    message: isCallbackRequest ? settings.callbackPopupSuccessMessage : settings.successMessage,
  }));
});

router.get("/admin/contact", requireAdmin, async (req, res) => {
  try {
    const settings = await prisma.contactSettings.findUnique({ where: { id: "singleton" } });
    if (!settings) {
      res.status(404).json({ error: "Contact settings are not available." });
      return;
    }
    res.json(GetAdminContactSettingsResponse.parse(toContactResponse(settings)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read admin Contact settings");
    res.status(500).json({ error: "Unable to load Contact settings." });
  }
});

router.put("/admin/contact", requireAdmin, async (req, res) => {
  const parsed = UpdateContactSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the Contact page settings and try again." });
    return;
  }
  const courseOptions = normalizeContactCourseOptions(parsed.data.courseOptions);
  if (!courseOptions.length || courseOptions.length > 20) {
    res.status(400).json({ error: "Add between 1 and 20 unique course options." });
    return;
  }
  try {
    const settings = await prisma.contactSettings.upsert({
      where: { id: "singleton" },
      update: {
        ...parsed.data,
        additionalPhones: JSON.stringify(parsed.data.additionalPhones),
        socialLinks: JSON.stringify(parsed.data.socialLinks),
        courseOptions: JSON.stringify(courseOptions),
      },
      create: {
        id: "singleton",
        ...parsed.data,
        additionalPhones: JSON.stringify(parsed.data.additionalPhones),
        socialLinks: JSON.stringify(parsed.data.socialLinks),
        courseOptions: JSON.stringify(courseOptions),
      },
    });
    res.json(UpdateContactSettingsResponse.parse(toContactResponse(settings)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update Contact settings");
    res.status(500).json({ error: "Unable to save Contact settings." });
  }
});

router.get("/admin/contact-enquiries", requireAdmin, async (req, res) => {
  try {
    const enquiries = await prisma.contactEnquiry.findMany({ orderBy: { createdAt: "desc" } });
    res.json(GetAdminContactEnquiriesResponse.parse(enquiries));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read Contact enquiries");
    res.status(500).json({ error: "Unable to load Contact enquiries." });
  }
});

router.get("/admin/contact-enquiries/:id", requireAdmin, async (req, res) => {
  try {
    const enquiry = await prisma.contactEnquiry.findUnique({
      where: { id: String(req.params.id) },
      include: { notes: { orderBy: { createdAt: "asc" } } },
    });
    if (!enquiry) {
      res.status(404).json({ error: "That enquiry could not be found." });
      return;
    }
    res.json(GetAdminContactEnquiryResponse.parse({ enquiry, notes: enquiry.notes }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to read Contact enquiry details");
    res.status(500).json({ error: "Unable to load Contact enquiry details." });
  }
});

router.patch("/admin/contact-enquiries/:id", requireAdmin, async (req, res) => {
  const raw = {
    ...req.body,
    nextAction: typeof req.body?.nextAction === "string"
      ? req.body.nextAction.trim() || null
      : req.body?.nextAction,
  };
  const parsed = UpdateAdminContactEnquiryBody.safeParse(raw);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the enquiry details and try again." });
    return;
  }
  try {
    const { nextActionDueAt, ...updates } = parsed.data;
    const data = {
      ...updates,
      ...(nextActionDueAt !== undefined
        ? { nextActionDueAt: nextActionDueAt === null ? null : new Date(nextActionDueAt) }
        : {}),
    };
    const enquiry = await prisma.contactEnquiry.update({ where: { id: String(req.params.id) }, data });
    res.json(UpdateAdminContactEnquiryResponse.parse(enquiry));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update Contact enquiry");
    res.status(404).json({ error: "That enquiry could not be found." });
  }
});

router.post("/admin/contact-enquiries/:id/notes", requireAdmin, async (req, res) => {
  const raw = {
    ...req.body,
    body: typeof req.body?.body === "string" ? req.body.body.trim() : req.body?.body,
  };
  const parsed = CreateAdminContactEnquiryNoteBody.safeParse(raw);
  if (!parsed.success) {
    res.status(400).json({ error: "Write a note before adding it to enquiry history." });
    return;
  }
  try {
    const enquiryId = String(req.params.id);
    const enquiry = await prisma.contactEnquiry.findUnique({
      where: { id: enquiryId },
      select: { id: true },
    });
    if (!enquiry) {
      res.status(404).json({ error: "That enquiry could not be found." });
      return;
    }
    const admin = res.locals.admin as { id: string; displayName: string; email: string };
    const note = await prisma.contactEnquiryNote.create({
      data: {
        enquiryId,
        authorAdminId: admin.id,
        authorName: admin.displayName || admin.email,
        body: parsed.data.body,
      },
    });
    res.status(201).json(CreateAdminContactEnquiryNoteResponse.parse(note));
  } catch (error) {
    req.log.error({ err: error }, "Unable to append a Contact enquiry note");
    res.status(500).json({ error: "Unable to add the note. Please try again." });
  }
});

router.delete("/admin/contact-enquiries/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.contactEnquiry.delete({ where: { id: String(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    req.log.error({ err: error }, "Unable to delete Contact enquiry");
    res.status(404).json({ error: "That enquiry could not be found." });
  }
});

export default router;