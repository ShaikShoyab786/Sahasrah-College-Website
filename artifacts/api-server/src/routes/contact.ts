import { Router, type IRouter } from "express";
import {
  GetAdminContactEnquiriesResponse,
  GetAdminContactSettingsResponse,
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
  isVisible: boolean;
  updatedAt: Date;
}) {
  return {
    ...settings,
    additionalPhones: readJson<string[]>(settings.additionalPhones, []),
    socialLinks: readJson<ContactSocialLink[]>(settings.socialLinks, []),
    courseOptions: readJson<string[]>(settings.courseOptions, ["MPC", "BiPC"]),
  };
}

function normalizeWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

function normalizeIndianMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  const mobile = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(mobile) ? `+91${mobile}` : null;
}

function enquiryMessage(input: {
  name: string;
  phone: string;
  course: string;
  email?: string | null;
  message?: string | null;
}) {
  return [
    "New website enquiry",
    `Name: ${input.name}`,
    `Mobile: ${input.phone}`,
    `Course: ${input.course}`,
    `Email: ${input.email || "Not provided"}`,
    `Message: ${input.message || "Not provided"}`,
  ].join("\n");
}

async function sendWhatsAppMessage(recipient: string, body: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!accessToken || !phoneNumberId) {
    return { status: "whatsapp_not_configured", error: "WhatsApp delivery is not configured." };
  }

  try {
    const graphVersion = process.env.WHATSAPP_GRAPH_VERSION?.trim() || "v22.0";
    const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient.replace(/\D/g, ""),
        type: "text",
        text: { body },
      }),
    });
    if (!response.ok) {
      return { status: "whatsapp_failed", error: "WhatsApp rejected the enquiry." };
    }
    return { status: "whatsapp_accepted", error: null };
  } catch {
    return { status: "whatsapp_failed", error: "WhatsApp could not be reached." };
  }
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

router.post("/contact-enquiries", async (req, res) => {
  const raw = {
    ...req.body,
    name: typeof req.body?.name === "string" ? req.body.name.trim() : req.body?.name,
    phone: typeof req.body?.phone === "string" ? req.body.phone.replace(/\D/g, "") : req.body?.phone,
    course: typeof req.body?.course === "string" ? req.body.course.trim() : req.body?.course,
    email: typeof req.body?.email === "string" ? req.body.email.trim() || undefined : req.body?.email,
    message: typeof req.body?.message === "string" ? req.body.message.trim() || undefined : req.body?.message,
  };
  const parsed = SubmitContactEnquiryBody.safeParse(raw);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter your name, a valid Indian mobile number, and choose a course." });
    return;
  }

  const settings = await prisma.contactSettings.findUnique({ where: { id: "singleton" } });
  const phone = normalizeIndianMobile(parsed.data.phone);
  const courses = settings ? readJson<string[]>(settings.courseOptions, []) : [];
  if (!phone || !settings || !settings.isVisible || !courses.includes(parsed.data.course)) {
    res.status(400).json({ error: "Enter your name, a valid Indian mobile number, and choose a course." });
    return;
  }

  const recipient = normalizeWhatsAppNumber(settings.whatsappNumber);
  const enquiry = await prisma.contactEnquiry.create({
    data: {
      name: parsed.data.name,
      phone,
      course: parsed.data.course,
      email: parsed.data.email ?? null,
      message: parsed.data.message ?? null,
      whatsappRecipient: recipient,
      deliveryStatus: "pending",
    },
  });

  if (!recipient) {
    const deliveryError = "WhatsApp delivery is not configured. Please try again later.";
    await prisma.contactEnquiry.update({ where: { id: enquiry.id }, data: { deliveryStatus: "whatsapp_not_configured", deliveryError } });
    res.status(503).json({ error: deliveryError, enquiryId: enquiry.id, deliveryStatus: "whatsapp_not_configured" });
    return;
  }

  const delivery = await sendWhatsAppMessage(recipient, enquiryMessage({ ...parsed.data, phone }));
  await prisma.contactEnquiry.update({
    where: { id: enquiry.id },
    data: { deliveryStatus: delivery.status, deliveryError: delivery.error },
  });

  if (delivery.status !== "whatsapp_accepted") {
    res.status(503).json({ error: delivery.error || "WhatsApp delivery failed. Please try again later.", enquiryId: enquiry.id, deliveryStatus: delivery.status });
    return;
  }

  res.status(201).json(SubmitContactEnquiryResponse.parse({
    accepted: true,
    enquiryId: enquiry.id,
    deliveryStatus: delivery.status,
    message: settings.successMessage,
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
  try {
    const settings = await prisma.contactSettings.upsert({
      where: { id: "singleton" },
      update: {
        ...parsed.data,
        additionalPhones: JSON.stringify(parsed.data.additionalPhones),
        socialLinks: JSON.stringify(parsed.data.socialLinks),
        courseOptions: JSON.stringify(parsed.data.courseOptions),
      },
      create: {
        id: "singleton",
        ...parsed.data,
        additionalPhones: JSON.stringify(parsed.data.additionalPhones),
        socialLinks: JSON.stringify(parsed.data.socialLinks),
        courseOptions: JSON.stringify(parsed.data.courseOptions),
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

router.patch("/admin/contact-enquiries/:id", requireAdmin, async (req, res) => {
  const parsed = UpdateAdminContactEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the enquiry status and try again." });
    return;
  }
  try {
    const enquiry = await prisma.contactEnquiry.update({ where: { id: String(req.params.id) }, data: parsed.data });
    res.json(UpdateAdminContactEnquiryResponse.parse(enquiry));
  } catch (error) {
    req.log.error({ err: error }, "Unable to update Contact enquiry");
    res.status(404).json({ error: "That enquiry could not be found." });
  }
});

export default router;