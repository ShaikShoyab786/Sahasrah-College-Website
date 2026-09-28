import { PrismaClient } from "@prisma/client";
import {
  DEFAULT_CONTACT_COURSE_OPTIONS,
  isLegacyCollapsedDefaultCourseOptions,
  parseStoredContactCourseOptions,
} from "./contact-course-options";
import { homepagePreviewCopyDefaults } from "./homepage-preview-copy-defaults";
import { COURSE_SEEDS } from "./course-content";
import { DEFAULT_COURSES_MEGA_MENU } from "./courses-mega-menu-content";

const LEGACY_COURSE_ACTIONS = [
  { slug: "mpc", primaryActionLabel: "Explore admissions", secondaryActionLabel: "Talk to a counsellor" },
  { slug: "bipc", primaryActionLabel: "Explore admissions", secondaryActionLabel: "Talk to a counsellor" },
  { slug: "mpc-iit-jee", primaryActionLabel: "Discuss the JEE pathway", secondaryActionLabel: "Ask a counsellor" },
  { slug: "bipc-neet", primaryActionLabel: "Discuss the NEET pathway", secondaryActionLabel: "Ask a counsellor" },
  { slug: "mpc-eamcet", primaryActionLabel: "Discuss the EAMCET pathway", secondaryActionLabel: "Ask a counsellor" },
] as const;

export const prisma = new PrismaClient();

const galleryCategories = ["Campus", "Classrooms", "Sports", "Labs", "Library", "Achievements", "Events"];

async function ensureAlumniStorySchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AlumniSuccessStory" (
      "id" TEXT NOT NULL,
      "displayName" TEXT NOT NULL DEFAULT '',
      "portraitUrl" TEXT,
      "portraitAltText" TEXT,
      "passingYear" TEXT,
      "course" TEXT,
      "currentOutcome" TEXT,
      "story" TEXT NOT NULL DEFAULT '',
      "isPublished" BOOLEAN NOT NULL DEFAULT false,
      "displayOrder" INTEGER NOT NULL,
      "importedFromResultId" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AlumniSuccessStory_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "AlumniSuccessStory_displayOrder_key"
    ON "AlumniSuccessStory" ("displayOrder")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "AlumniSuccessStory_importedFromResultId_key"
    ON "AlumniSuccessStory" ("importedFromResultId")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "AlumniSuccessStory_isPublished_displayOrder_idx"
    ON "AlumniSuccessStory" ("isPublished", "displayOrder")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AlumniStoryImportMarker" (
      "sourceResultId" TEXT NOT NULL,
      "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AlumniStoryImportMarker_pkey" PRIMARY KEY ("sourceResultId")
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AlumniSuccessStoriesRevision" (
      "id" TEXT NOT NULL DEFAULT 'singleton',
      "revision" INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AlumniSuccessStoriesRevision_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.alumniSuccessStoriesRevision.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", revision: 0 },
  });
}

class LegacyResultStoryChangedError extends Error {}

async function backfillLegacyResultStories() {
  const legacyResults = await prisma.homepageResult.findMany({
    where: { story: { not: null } },
    select: { id: true },
  });

  for (const legacy of legacyResults) {
    let completed = false;
    for (let attempt = 0; attempt < 3 && !completed; attempt += 1) {
      try {
        await prisma.$transaction(async (tx) => {
          // Serialize import ordering across concurrently starting server instances.
          await tx.$queryRaw`SELECT 1 AS locked FROM (SELECT pg_advisory_xact_lock(74130105)) AS lock`;
          const source = await tx.homepageResult.findUnique({
            where: { id: legacy.id },
            select: { story: true },
          });
          const storyText = source?.story;
          if (storyText === null || storyText === undefined || storyText.length === 0) return;

          const imported = await tx.alumniStoryImportMarker.createMany({
            data: [{ sourceResultId: legacy.id }],
            skipDuplicates: true,
          });
          if (imported.count > 0) {
            const latest = await tx.alumniSuccessStory.aggregate({ _max: { displayOrder: true } });
            await tx.alumniSuccessStory.create({
              data: {
                displayName: "",
                portraitUrl: null,
                portraitAltText: null,
                passingYear: null,
                course: null,
                currentOutcome: null,
                story: storyText,
                isPublished: false,
                displayOrder: (latest._max.displayOrder ?? 0) + 1,
                importedFromResultId: legacy.id,
              },
            });
            await tx.alumniSuccessStoriesRevision.update({
              where: { id: "singleton" },
              data: { revision: { increment: 1 } },
            });
          }

          const cleared = await tx.homepageResult.updateMany({
            where: { id: legacy.id, story: storyText },
            data: { story: null, storyIsPublished: false },
          });
          if (cleared.count !== 1) {
            throw new LegacyResultStoryChangedError("Legacy result story changed during import.");
          }
        }, { maxWait: 10_000, timeout: 30_000 });
        completed = true;
      } catch (error) {
        if (!(error instanceof LegacyResultStoryChangedError) || attempt === 2) throw error;
      }
    }
  }
}

function normalizeTestimonialText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

async function mergeLegacyAlumniStoriesIntoSharedTestimonials() {
  const legacyStories = await prisma.alumniSuccessStory.findMany({
    orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
  });

  for (const legacy of legacyStories) {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 AS locked FROM (SELECT pg_advisory_xact_lock(74130206)) AS lock`;
      const marker = await tx.alumniStoryShareMarker.findUnique({
        where: { sourceStoryId: legacy.id },
        select: { sourceStoryId: true },
      });
      if (marker) return;

      const existing = await tx.homepageTestimonial.findMany({
        where: { homepageTestimonialsId: "singleton" },
        select: { quote: true },
      });
      const quote = legacy.story.trim();
      const alreadyPresent = quote.length > 0 && existing.some(
        (item) => normalizeTestimonialText(item.quote) === normalizeTestimonialText(quote),
      );

      if (quote.length > 0 && !alreadyPresent) {
        const latestOrder = await tx.homepageTestimonial.aggregate({
          where: { homepageTestimonialsId: "singleton" },
          _max: { displayOrder: true },
        });
        const courseAchievement = [legacy.passingYear, legacy.course, legacy.currentOutcome]
          .map((item) => item?.trim())
          .filter((item): item is string => Boolean(item))
          .join(" · ");
        await tx.homepageTestimonial.create({
          data: {
            homepageTestimonialsId: "singleton",
            rating: null,
            quote,
            personName: legacy.displayName.trim(),
            role: "",
            courseAchievement,
            avatarImageUrl: legacy.portraitUrl,
            avatarAltText: legacy.portraitAltText?.trim() ?? "",
            accentColor: null,
            displayOrder: (latestOrder._max.displayOrder ?? 0) + 1,
            isActive: legacy.isPublished && Boolean(legacy.displayName.trim()),
          },
        });
      }

      await tx.alumniStoryShareMarker.create({
        data: { sourceStoryId: legacy.id },
      });
    }, { maxWait: 10_000, timeout: 30_000 });
  }
}

function getGalleryCategory(category: string | null, title: string) {
  const normalized = category?.trim().toLowerCase();
  const existing = galleryCategories.find((value) => value.toLowerCase() === normalized);
  if (existing) return existing;
  const searchable = `${category ?? ""} ${title}`.toLowerCase();
  if (searchable.includes("classroom") || searchable.includes("class")) return "Classrooms";
  if (searchable.includes("sport") || searchable.includes("activity")) return "Sports";
  if (searchable.includes("lab") || searchable.includes("science")) return "Labs";
  if (searchable.includes("library") || searchable.includes("study")) return "Library";
  if (searchable.includes("achievement") || searchable.includes("award")) return "Achievements";
  if (searchable.includes("event")) return "Events";
  return "Campus";
}

async function backfillCollegeNameTypo() {
  const columns = await prisma.$queryRaw<Array<{ tableName: string; columnName: string }>>`
    SELECT table_name AS "tableName", column_name AS "columnName"
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('character varying', 'text', 'character')
      AND column_name NOT IN ('id', 'tokenHash', 'passwordHash')
  `;

  for (const { tableName, columnName } of columns) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(tableName) || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(columnName)) continue;
    await prisma.$executeRawUnsafe(
      `UPDATE "${tableName}" SET "${columnName}" = replace(replace(replace("${columnName}", 'Sahasara', 'Sahsrah'), 'SAHASARA', 'SAHSRAH'), 'sahasara', 'sahsrah') WHERE "${columnName}" LIKE '%Sahasara%' OR "${columnName}" LIKE '%SAHASARA%' OR "${columnName}" LIKE '%sahasara%'`,
    );
  }
}

export async function initializeDatabase() {
  await prisma.$connect();
  await ensureAlumniStorySchema();
  await backfillLegacyResultStories();
  await backfillCollegeNameTypo();

  for (const course of COURSE_SEEDS) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {},
      create: course,
    });
  }

  for (const legacy of LEGACY_COURSE_ACTIONS) {
    await prisma.course.updateMany({
      where: {
        slug: legacy.slug,
        primaryActionLabel: legacy.primaryActionLabel,
        secondaryActionLabel: legacy.secondaryActionLabel,
        secondaryActionUrl: "/contact",
      },
      data: {
        primaryActionLabel: "Explore admissions",
        secondaryActionLabel: "View Curriculum",
        secondaryActionUrl: "#course-curriculum-heading",
      },
    });
  }

  await prisma.course.updateMany({
    where: { durationLabel: "2 years" },
    data: { durationLabel: "2 Years" },
  });

  await prisma.coursesMegaMenuSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      content: DEFAULT_COURSES_MEGA_MENU,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      collegeName: "Sahsrah Junior College",
      tagline: "Your College Tagline",
      logoUrl: null,
      email: "info@yourcollege.com",
      phone: "+91 XXXXX XXXXX",
      address: "Your College Address",
      primaryColor: "#022A6C",
      accentColor: "#CE0B11",
      surfaceColor: "#F5F7FB",
      themePreset: "sahsrah-blue-red",
      footerText: "Building confident futures through focused learning.",
      loginLeftEyebrow: "ACADEMIC ADMINISTRATION",
      loginLeftHeading: "Manage with",
      loginLeftHighlightedHeading: "clarity and purpose.",
      loginLeftDescription: "A secure workspace for managing Sahsrah Junior College operations, academic information, student records, and institutional updates.",
      loginLeftBottomText: "Authorized administrators only · Internal use",
      loginBackgroundImageUrl: "/api/uploads/admin-login-background.png",
      loginBackgroundImageAltText: "Sahsrah Junior College academic administration workspace",
      loginRightEyebrow: "ADMIN WORKSPACE",
      loginRightHeading: "Welcome back.",
      loginRightDescription: "Sign in to access Sahsrah's administrative workspace.",
      loginEmailLabel: "Official email address",
      loginPasswordLabel: "Password",
      loginButtonLabel: "Sign in →",
      loginSecurityNote: "This workspace is restricted to authorized Sahsrah administrators.",
      loginBackLinkLabel: "Back to website",
    },
  });

  await prisma.homepagePreviewCopy.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", ...homepagePreviewCopyDefaults },
  });
  const existingHomepageCopy = await prisma.homepagePreviewCopy.findUnique({ where: { id: "singleton" } });
  const galleryCopyBackfill: {
    galleryHeading?: string;
    galleryDescription?: string;
    galleryButtonHref?: string;
    facultyButtonHref?: string;
  } = {};
  if (
    existingHomepageCopy?.galleryHeading === "Life at KVR College" ||
    existingHomepageCopy?.galleryHeading === "Life at Sahsrah College"
  ) {
    galleryCopyBackfill.galleryHeading = "Life at Sahasrah College";
  }
  if (
    existingHomepageCopy?.galleryDescription ===
    "A quick look at the spaces, routines, and experiences that shape the KVR college day."
  ) {
    galleryCopyBackfill.galleryDescription =
      "A quick look at the spaces, routines, and experiences that shape the Sahasrah college day.";
  }
  if (existingHomepageCopy?.galleryButtonHref === "/about#campus-highlights") {
    galleryCopyBackfill.galleryButtonHref = "/gallery";
  }
  if (existingHomepageCopy?.facultyButtonHref === "/about#leadership") {
    galleryCopyBackfill.facultyButtonHref = "/faculty";
  }
  if (Object.keys(galleryCopyBackfill).length > 0) {
    await prisma.homepagePreviewCopy.update({
      where: { id: "singleton" },
      data: galleryCopyBackfill,
    });
  }

  await prisma.galleryPageSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "CAMPUS LIFE",
      heading: "Life at Sahasrah College",
      description: "Explore the spaces, people, and experiences that make life at Sahasrah College memorable.",
    },
  });

  await prisma.facultyPageSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "Mentors & Guides",
      heading: "Our Expert Faculty",
      description:
        "Learn from the best minds in education. Our faculty members bring decades of experience guiding students toward success.",
    },
  });

  const currentSettings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (
    currentSettings?.themePreset === "sahsrah-blue-red" &&
    currentSettings.primaryColor === "#12365D" &&
    currentSettings.accentColor === "#D5A63A"
  ) {
    await prisma.siteSettings.update({
      where: { id: "singleton" },
      data: { primaryColor: "#022A6C", accentColor: "#CE0B11", surfaceColor: "#F5F7FB" },
    });
  }
  if (currentSettings && !currentSettings.loginBackgroundImageUrl) {
    await prisma.siteSettings.update({
      where: { id: "singleton" },
      data: { loginBackgroundImageUrl: "/api/uploads/admin-login-background.png" },
    });
  }

  await prisma.contactSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "CONTACT SAHSRAH",
      heading: "Let’s plan the right next step.",
      description: "Speak with our admissions team about courses, campus visits, and a focused start for your student.",
      formHeading: "Start a conversation",
      formDescription: "Share a few details and our admissions team will review your enquiry.",
      responseTimeMessage: "We usually respond during working hours.",
      mainEmail: "admissions@sahsrah.edu",
      primaryPhone: "+91 40 2458 0176",
      additionalPhones: "[]",
      whatsappNumber: "+91 40 2458 0176",
      address: "18 Vidya Marg, Hyderabad, Telangana 500034",
      workingHours: "Monday–Saturday, 9:00–16:30",
      mapEmbedUrl: null,
      mapLabel: "Open the campus location in Maps",
      logoUrl: null,
      socialLinks: "[]",
      courseOptions: JSON.stringify(DEFAULT_CONTACT_COURSE_OPTIONS),
      nameLabel: "Student or parent name",
      phoneLabel: "Indian mobile number",
      courseLabel: "Course of interest",
      emailLabel: "Email address (optional)",
      messageLabel: "Message (optional)",
      submitButtonLabel: "Send enquiry",
      successMessage: "Thank you. Your enquiry has been received.",
      prospectusButtonLabel: "Request the prospectus",
      prospectusButtonHref: "/contact",
      campusVisitButtonLabel: "Plan a campus visit",
      campusVisitButtonHref: "/contact",
      isVisible: true,
    },
  });

  const contactSettings = await prisma.contactSettings.findUnique({ where: { id: "singleton" } });
  if (contactSettings) {
    const contactCopyBackfill: {
      formDescription?: string;
      submitButtonLabel?: string;
      successMessage?: string;
      courseOptions?: string;
    } = {};
    if (contactSettings.formDescription === "Share a few details and our admissions team will continue the conversation on WhatsApp.") {
      contactCopyBackfill.formDescription = "Share a few details and our admissions team will review your enquiry.";
    }
    if (contactSettings.submitButtonLabel === "Send enquiry on WhatsApp") {
      contactCopyBackfill.submitButtonLabel = "Send enquiry";
    }
    if (contactSettings.successMessage === "Thanks — your enquiry has reached our admissions team on WhatsApp.") {
      contactCopyBackfill.successMessage = "Thank you. Your enquiry has been received.";
    }
    const savedCourseOptions = parseStoredContactCourseOptions(contactSettings.courseOptions);
    if (!savedCourseOptions.length || isLegacyCollapsedDefaultCourseOptions(contactSettings.courseOptions)) {
      contactCopyBackfill.courseOptions = JSON.stringify(DEFAULT_CONTACT_COURSE_OPTIONS);
    } else {
      const normalizedCourseOptions = JSON.stringify(savedCourseOptions);
      if (contactSettings.courseOptions !== normalizedCourseOptions) {
        contactCopyBackfill.courseOptions = normalizedCourseOptions;
      }
    }
    if (Object.keys(contactCopyBackfill).length) {
      await prisma.contactSettings.update({ where: { id: "singleton" }, data: contactCopyBackfill });
    }
  }

  const heroSlides = [
    {
      displayOrder: 1,
      eyebrowText: "A focused start to a bright future",
      heading: "Learn with purpose.",
      highlightedHeadingText: "Grow with confidence.",
      description:
        "A welcoming academic environment where students build strong foundations, discover their strengths, and prepare for what comes next.",
      primaryButtonLabel: "Explore admissions",
      primaryButtonUrl: "/contact",
      secondaryButtonLabel: "Discover our approach",
       secondaryButtonUrl: "#about-preview",
      heroImageUrl: null,
      heroImageAltText: "Sahsrah students learning together",
    },
    {
      displayOrder: 2,
      eyebrowText: "Make room for possibility",
      heading: "Ask better",
      highlightedHeadingText: "questions.",
      description:
        "At Sahsrah, curiosity is not a detour from learning. It is where confidence, creativity, and clarity begin.",
      primaryButtonLabel: "See how we learn",
       primaryButtonUrl: "#about-preview",
      secondaryButtonLabel: "Meet Sahsrah",
      secondaryButtonUrl: "/contact",
      heroImageUrl: null,
      heroImageAltText: "Students collaborating in a Sahsrah classroom",
    },
    {
      displayOrder: 3,
      eyebrowText: "Your next chapter starts here",
      heading: "Find your",
      highlightedHeadingText: "direction.",
      description:
        "Choose a path that fits your strengths, then give yourself the space to discover what it can become.",
      primaryButtonLabel: "Start a conversation",
      primaryButtonUrl: "/contact",
      secondaryButtonLabel: "Explore next steps",
       secondaryButtonUrl: "/contact",
      heroImageUrl: null,
      heroImageAltText: "Sahsrah students looking toward their future",
    },
  ];

  for (const slide of heroSlides) {
    await prisma.homepageHero.upsert({
      where: { displayOrder: slide.displayOrder },
      update: {},
      create: { ...slide, isPublished: true },
    });
  }

  await prisma.homepageAboutPreview.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "About Sahsrah",
      heading: "Building Strong Foundations for a Brighter Future",
      description:
        "Sahsrah Junior College is committed to helping students grow through academic guidance, personal attention, and a supportive learning environment.",
      body:
        "Our approach combines focused preparation, experienced guidance, and values that help students move confidently toward higher education and future opportunities.",
      buttonLabel: "Explore Our Philosophy",
      buttonHref: "/about",
      primaryImage:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",
      primaryImageAltText: "Students collaborating together on a college campus",
      secondaryImage:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=85",
      secondaryImageAltText: "Students walking together outside a college building",
      isVisible: true,
      sortOrder: 2,
    },
  });

  const liveUpdateDefaults = [
    {
      title: "Admissions for 2026–27 are now open",
      excerpt: "Meet our admissions team, compare pathways, and find the right academic start for your student.",
      category: "Admissions",
      actionBadge: "Apply Now",
      publishDate: new Date("2026-06-15T00:00:00.000Z"),
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85",
      imageAltText: "Students collaborating around a table",
      detailUrl: "/contact",
      isFeatured: true,
      isActive: true,
      displayOrder: 1,
    },
    {
      title: "Campus visit days are open for booking",
      excerpt: "Walk through our classrooms, laboratories, and student spaces with a member of the Sahsrah team.",
      category: "Campus",
      actionBadge: "Schedule",
      publishDate: new Date("2026-05-28T00:00:00.000Z"),
      imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=85",
      imageAltText: "Bright college classroom",
      detailUrl: "/contact",
      isFeatured: false,
      isActive: true,
      displayOrder: 2,
    },
    {
      title: "A new term of focused learning begins",
      excerpt: "Explore the routines, support, and subject guidance that help students build steady momentum.",
      category: "Community",
      actionBadge: "Latest",
      publishDate: new Date("2026-05-09T00:00:00.000Z"),
      imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=85",
      imageAltText: "Students working together in a science laboratory",
      detailUrl: "/about",
      isFeatured: false,
      isActive: true,
      displayOrder: 3,
    },
  ];
  for (const update of liveUpdateDefaults) {
    await prisma.homepageLiveUpdate.upsert({
      where: { displayOrder: update.displayOrder },
      update: {},
      create: update,
    });
  }

  await prisma.homepageStatistics.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "THE SAHSRAH DIFFERENCE",
      heading: "Progress you can feel.",
      description: "A focused learning environment turns daily effort into outcomes students can carry forward.",
      isVisible: true,
      sortOrder: 4,
    },
  });

  await prisma.homepageFavoriteTopics.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "Explore Our Programs",
      heading: "Favorite Topics To Learn",
      description: "Intermediate MPC & BiPC integrated with IIT-JEE and NEET.",
      isVisible: true,
      sortOrder: 5,
    },
  });
  if ((await prisma.homepageFavoriteTopic.count({ where: { homepageFavoriteTopicsId: "singleton" } })) === 0) {
    await prisma.homepageFavoriteTopic.createMany({
      data: [
        { homepageFavoriteTopicsId: "singleton", categoryLabel: "MPC · Integrated", title: "MPC + IIT-JEE", description: "Build strong concepts and exam confidence through a focused engineering pathway.", featureOne: "Physics, Chemistry & Maths", featureTwo: "IIT-JEE integrated preparation", featureThree: "Regular tests and feedback", imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=85", imageAltText: "Mathematics notes and geometry tools", icon: "atom", curriculumUrl: "/contact", displayOrder: 1, isActive: true },
        { homepageFavoriteTopicsId: "singleton", categoryLabel: "MPC · Integrated", title: "MPC + EAMCET", description: "A steady, practical routine for students preparing for state-level engineering admissions.", featureOne: "Concept-first classroom teaching", featureTwo: "EAMCET practice support", featureThree: "Personal progress guidance", imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1000&q=85", imageAltText: "Geometry drawing on a classroom board", icon: "line-chart", curriculumUrl: "/contact", displayOrder: 2, isActive: true },
        { homepageFavoriteTopicsId: "singleton", categoryLabel: "MPC · Foundation", title: "MPC", description: "Strengthen the fundamentals that make higher study clearer and more confident.", featureOne: "Clear subject foundations", featureTwo: "Guided daily practice", featureThree: "Supportive doubt resolution", imageUrl: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=1000&q=85", imageAltText: "Student studying in a quiet library", icon: "book-open", curriculumUrl: "/contact", displayOrder: 3, isActive: true },
        { homepageFavoriteTopicsId: "singleton", categoryLabel: "BiPC · Foundation", title: "BiPC", description: "Learn biology and the sciences with structure, curiosity, and personal attention.", featureOne: "Biology, Physics & Chemistry", featureTwo: "Visual and practical learning", featureThree: "Consistent revision plans", imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1000&q=85", imageAltText: "Microscope and biology laboratory equipment", icon: "dna", curriculumUrl: "/contact", displayOrder: 4, isActive: true },
        { homepageFavoriteTopicsId: "singleton", categoryLabel: "BiPC · Integrated", title: "BiPC + NEET", description: "Prepare for medical pathways with a strong core and a calm, consistent rhythm.", featureOne: "NEET-aligned subject guidance", featureTwo: "Test analysis and revision", featureThree: "Mentorship for steady progress", imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85", imageAltText: "Medical science laboratory glassware", icon: "heart-pulse", curriculumUrl: "/contact", displayOrder: 5, isActive: true },
        { homepageFavoriteTopicsId: "singleton", categoryLabel: "NEET · Foundation", title: "NEET Foundation", description: "Start early with habits, concepts, and guidance that make later preparation stronger.", featureOne: "Early science foundations", featureTwo: "Focused study habits", featureThree: "Regular mentor check-ins", imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1000&q=85", imageAltText: "Medical anatomy model and study notes", icon: "stethoscope", curriculumUrl: "/contact", displayOrder: 6, isActive: true },
        { homepageFavoriteTopicsId: "singleton", categoryLabel: "Competitive · Preparation", title: "Competitive Exam Preparation", description: "Develop the accuracy, speed, and resilience needed for ambitious academic goals.", featureOne: "Timed practice and analysis", featureTwo: "Exam strategy workshops", featureThree: "Confidence through repetition", imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=85", imageAltText: "Student writing in a preparation notebook", icon: "trophy", curriculumUrl: "/contact", displayOrder: 7, isActive: true },
      ],
    });
  }

  await prisma.homepageResults.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "Pride of Sahasrah",
      heading: "Our Results, Our Pride",
      description: "Steady preparation, strong foundations, and focused guidance help our students turn ambition into meaningful academic achievement.",
      viewAllButtonLabel: "View All Achievements",
      viewAllButtonLink: "/results",
      isVisible: true,
      sortOrder: 6,
    },
  });
  await prisma.homepageResults.updateMany({
    where: { id: "singleton", eyebrow: "Pride of KVR" },
    data: { eyebrow: "Our Achievements" },
  });
  await prisma.homepageResults.updateMany({
    where: { id: "singleton", viewAllButtonLink: "/about#achievement-statistics" },
    data: { viewAllButtonLink: "/results" },
  });
  await prisma.homepageResult.updateMany({
    where: { homepageResultsId: "singleton", studentImageAltText: "KVR student portrait" },
    data: { studentImageAltText: "Student portrait" },
  });
  await prisma.resultsPageSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "Student Outcomes",
      heading: "Results that reflect consistent effort",
      description: "Explore approved student achievements from Sahsrah Junior College.",
      configuredYear: null,
      isVisible: true,
    },
  });

  await prisma.homepageAchievementRibbon.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", isVisible: true, sortOrder: 7 },
  });
  if ((await prisma.homepageAchievementRibbonPhrase.count({ where: { homepageAchievementRibbonId: "singleton" } })) === 0) {
    await prisma.homepageAchievementRibbonPhrase.createMany({
      data: [
        { homepageAchievementRibbonId: "singleton", phrase: "Best NEET Preparation", displayOrder: 1, isActive: true, accentColor: "#D6AD59", separatorStyle: "star" },
        { homepageAchievementRibbonId: "singleton", phrase: "Excellence", displayOrder: 2, isActive: true, accentColor: "#FFFFFF", separatorStyle: "dot" },
        { homepageAchievementRibbonId: "singleton", phrase: "Discipline", displayOrder: 3, isActive: true, accentColor: "#75C7B5", separatorStyle: "star" },
        { homepageAchievementRibbonId: "singleton", phrase: "Dedication", displayOrder: 4, isActive: true, accentColor: "#FFFFFF", separatorStyle: "dot" },
        { homepageAchievementRibbonId: "singleton", phrase: "Top IIT-JEE Coaching", displayOrder: 5, isActive: true, accentColor: "#D6AD59", separatorStyle: "star" },
      ],
    });
  }

  await prisma.homepageTestimonials.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "What Parents & Students Say",
      heading: "Real Stories of Success",
      description: "Real stories from the KVR Junior College family.",
      isVisible: true,
      sortOrder: 8,
    },
  });
  if ((await prisma.homepageTestimonial.count({ where: { homepageTestimonialsId: "singleton" } })) === 0) {
    await prisma.homepageTestimonial.createMany({
      data: [
        { homepageTestimonialsId: "singleton", rating: 5, quote: "The regular feedback and personal attention gave our daughter the confidence to keep improving without feeling overwhelmed.", personName: "Mrs. Lakshmi Rao", role: "Parent", courseAchievement: "BiPC · NEET 2025", avatarImageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=85", avatarAltText: "Parent from the KVR college community", accentColor: "#D6AD59", displayOrder: 1, isActive: true },
        { homepageTestimonialsId: "singleton", rating: 5, quote: "Every subject became clearer because our teachers made time for questions. I learned how to prepare with a steady routine.", personName: "Rohan Mehta", role: "Student", courseAchievement: "MPC · IIT-JEE 2025", avatarImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85", avatarAltText: "Student from the KVR college community", accentColor: "#2E8C7B", displayOrder: 2, isActive: true },
        { homepageTestimonialsId: "singleton", rating: 5, quote: "We chose KVR for the combination of discipline and care. The transition to junior college felt structured and genuinely supportive.", personName: "Mr. Anil Kumar", role: "Parent", courseAchievement: "MPC · EAMCET 2025", avatarImageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=85", avatarAltText: "Parent from the KVR college community", accentColor: "#17365D", displayOrder: 3, isActive: true },
        { homepageTestimonialsId: "singleton", rating: 5, quote: "The mentors helped me see the path ahead, then supported me with the practice and patience to walk it.", personName: "Nandini Shah", role: "Alumni", courseAchievement: "NEET · 2024", avatarImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85", avatarAltText: "Alumna from the KVR college community", accentColor: "#C26D3E", displayOrder: 4, isActive: true },
      ],
    });
  }
  await mergeLegacyAlumniStoriesIntoSharedTestimonials();

  await prisma.homepageKnowledgeHub.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "Knowledge Hub",
      heading: "Your Digital Learning Library",
      description: "Study materials, expert guidance, exam updates, and practical resources for JEE and NEET aspirants.",
      isVisible: true,
      sortOrder: 11,
    },
  });
  if ((await prisma.homepageKnowledgeResource.count({ where: { homepageKnowledgeHubId: "singleton" } })) === 0) {
    await prisma.homepageKnowledgeResource.createMany({
      data: [
        { homepageKnowledgeHubId: "singleton", title: "Complete Target JEE Question Bank", description: "5,000+ handpicked questions with weightage analysis, difficulty ratings, and detailed solutions.", category: "Featured", thumbnailUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=85", thumbnailAltText: "Open study book and notes for JEE preparation", icon: "file-text", fileSize: "8.4 MB", downloadCount: 5200, updatedLabel: "Updated Jun 2026", resourceUrl: "/#home-knowledge-hub", isFeatured: true, isActive: true, displayOrder: 1 },
        { homepageKnowledgeHubId: "singleton", title: "Complete Physics Mechanics Master Notes", description: "Concept-first notes covering kinematics, laws of motion, and rotational dynamics.", category: "Physics", thumbnailUrl: null, thumbnailAltText: "Physics resource document icon", icon: "file-text", fileSize: "4.2 MB", downloadCount: 12500, updatedLabel: "Updated Oct 2023", resourceUrl: "/#home-knowledge-hub", isFeatured: false, isActive: true, displayOrder: 2 },
        { homepageKnowledgeHubId: "singleton", title: "Organic Chemistry Reaction Mechanisms", description: "Visual guidance to the reaction mechanisms required for NEET and JEE Advanced.", category: "Chemistry", thumbnailUrl: null, thumbnailAltText: "Chemistry resource document icon", icon: "file-text", fileSize: "3.8 MB", downloadCount: 8300, updatedLabel: "Updated Nov 2023", resourceUrl: "/#home-knowledge-hub", isFeatured: false, isActive: true, displayOrder: 3 },
        { homepageKnowledgeHubId: "singleton", title: "Integral Calculus Formula Sheet", description: "Quick revision cheat sheet for integration formulas and shortcuts.", category: "Mathematics", thumbnailUrl: null, thumbnailAltText: "Mathematics resource document icon", icon: "file-text", fileSize: "1.2 MB", downloadCount: 15400, updatedLabel: "Updated Dec 2023", resourceUrl: "/#home-knowledge-hub", isFeatured: false, isActive: true, displayOrder: 4 },
      ],
    });
  }

  await prisma.homepageAdmissionsFaq.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "Admissions FAQ",
      heading: "Common Questions, Clear Answers",
      description: "Everything you need to know about joining Sahsrah Junior College.",
      isVisible: true,
      sortOrder: 12,
    },
  });
  if ((await prisma.homepageAdmissionsFaqItem.count({ where: { homepageAdmissionsFaqId: "singleton" } })) === 0) {
    await prisma.homepageAdmissionsFaqItem.createMany({
      data: [
        { homepageAdmissionsFaqId: "singleton", question: "Why should I choose Sahsrah over other junior colleges?", answer: "We combine focused concept learning with personal mentorship, regular feedback, and a supportive environment that helps students build confidence without losing sight of their goals.", displayOrder: 1, isVisible: true },
        { homepageAdmissionsFaqId: "singleton", question: "Do you offer integrated coaching for IIT-JEE and NEET?", answer: "Yes. Our MPC and BiPC pathways include integrated preparation, guided practice, regular tests, and subject support for ambitious IIT-JEE and NEET goals.", displayOrder: 2, isVisible: true },
        { homepageAdmissionsFaqId: "singleton", question: "What is the student-to-teacher ratio?", answer: "We keep groups focused so teachers can notice individual progress, answer questions, and give students useful feedback throughout the academic year.", displayOrder: 3, isVisible: true },
        { homepageAdmissionsFaqId: "singleton", question: "Are separate hostel facilities available for boys and girls?", answer: "Hostel support is available for eligible students. Contact the admissions office for current availability, routines, safety details, and a campus visit.", displayOrder: 4, isVisible: true },
        { homepageAdmissionsFaqId: "singleton", question: "How do you track and improve student performance?", answer: "Regular assessments, review meetings, practice plans, and individual guidance help students identify gaps early and build steady improvement.", displayOrder: 5, isVisible: true },
      ],
    });
  }

  await prisma.homepageFinalCta.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "Join Sahsrah College",
      heading: "Seats Are Limited. Admissions Are Open.",
      supportingText: "Give your child the advantage of personal mentorship from experienced faculty and integrated IIT-JEE and NEET preparation. Limited admission availability for the new academic year.",
      applyButtonLabel: "Apply Now",
      applyButtonHref: "/contact",
      phoneButtonLabel: "Call Admission Office",
      phoneNumber: "",
      backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=85",
      backgroundImageAltText: "Students walking across a college campus",
      backgroundOverlay: true,
      isVisible: true,
      sortOrder: 13,
    },
  });

  await prisma.aboutHero.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "ABOUT SAHSRAH",
      heading: "Growing with Purpose, Learning for Tomorrow.",
      description:
        "Sahsrah Junior College is committed to helping students build strong academic foundations through focused learning, personal guidance, and a supportive environment.",
      mainImageUrl:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",
      mainImageAltText: "Students learning together in a bright classroom",
      floatingLabel: "Admissions Open",
      floatingAcademicYear: "2026–27",
      floatingAvailabilityText: "Limited Seats Available",
      floatingSupportingText: "Join a growing community of successful students.",
      floatingImageUrl: null,
      floatingImageAltText: "Sahsrah students",
      primaryButtonLabel: "Apply for Admission",
      primaryButtonUrl: "/contact",
      primaryButtonVisible: true,
      secondaryButtonLabel: "Schedule a Campus Visit",
      secondaryButtonUrl: "/contact",
      secondaryButtonVisible: true,
      isVisible: true,
      sortOrder: 1,
    },
  });
  if ((await prisma.aboutHeroStat.count({ where: { aboutHeroId: "singleton" } })) === 0) {
    await prisma.aboutHeroStat.createMany({
      data: [
        { aboutHeroId: "singleton", value: "30+", label: "Years of Excellence", displayOrder: 1, isVisible: true },
        { aboutHeroId: "singleton", value: "5000+", label: "Students Guided", displayOrder: 2, isVisible: true },
        { aboutHeroId: "singleton", value: "100+", label: "Academic Achievements", displayOrder: 3, isVisible: true },
        { aboutHeroId: "singleton", value: "500+", label: "Successful Admissions", displayOrder: 4, isVisible: true },
      ],
    });
  }

  await prisma.aboutStory.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "OUR STORY",
      heading: "A Journey Built on Learning and Purpose",
      description:
        "Sahsrah Junior College continues to grow through a commitment to academic discipline, student guidance, and a learning environment that prepares students for the next stage of their journey.",
      buttonLabel: "Explore Our Journey",
      buttonHref: "#our-story-timeline",
      mainImage:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1100&q=85",
      mainImageAltText: "Students walking together outside a college building",
      secondaryImage:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=85",
      secondaryImageAltText: "Students collaborating in a classroom",
      thirdImage:
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=85",
      thirdImageAltText: "Open books and notes on a study table",
      isVisible: true,
      sortOrder: 2,
    },
  });
  if ((await prisma.aboutTimelineItem.count({ where: { aboutStoryId: "singleton" } })) === 0) {
    await prisma.aboutTimelineItem.createMany({
      data: [
        { aboutStoryId: "singleton", period: "20XX", title: "The Beginning", description: "Sahsrah Junior College begins its journey with a commitment to focused learning.", displayOrder: 1, isVisible: true },
        { aboutStoryId: "singleton", period: "20XX", title: "Growing Horizons", description: "The college expands its academic guidance and student support initiatives.", displayOrder: 2, isVisible: true },
        { aboutStoryId: "singleton", period: "20XX", title: "A Stronger Community", description: "More students and families become part of the Sahsrah learning community.", displayOrder: 3, isVisible: true },
        { aboutStoryId: "singleton", period: "Today", title: "Looking Ahead", description: "Sahsrah continues preparing students for higher education and future opportunities.", displayOrder: 4, isVisible: true },
      ],
    });
  }

  await prisma.aboutChairmanMessage.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: "CHAIRMAN'S MESSAGE",
      heading: "Education is the foundation of every meaningful future.",
      message:
        "At Sahsrah Junior College, we believe every student deserves the guidance, encouragement, and learning environment needed to grow with confidence. Our responsibility is to support every learner with purpose and care.",
      signatureName: "Sahsrah Leadership",
      role: "Chairman",
      portraitImage:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85",
      portraitAltText: "Portrait placeholder for Sahsrah leadership",
      buttonLabel: "Read the Full Message",
      buttonHref: "/contact",
      buttonVisible: false,
      isVisible: true,
      sortOrder: 3,
    },
  });

  await prisma.aboutGuidingPrinciples.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Our Guiding Principles",
      description: "The principles that shape how Sahsrah teaches, supports, and prepares every student.",
      visionIcon: "eye",
      visionTitle: "Our Vision",
      visionDescription: "To create a learning environment that helps students build knowledge, confidence, discipline, and a clear direction for the future.",
      missionIcon: "target",
      missionTitle: "Our Mission",
      missionDescription: "To provide focused academic guidance, concept-based learning, and personalized mentorship that helps every student progress with confidence.",
      valuesIcon: "star",
      valuesTitle: "Our Values",
      isVisible: true,
      sortOrder: 4,
    },
  });
  if ((await prisma.aboutGuidingPrincipleValue.count({ where: { aboutGuidingPrinciplesId: "singleton" } })) === 0) {
    await prisma.aboutGuidingPrincipleValue.createMany({
      data: [
        { aboutGuidingPrinciplesId: "singleton", value: "Integrity in all we do", displayOrder: 1, isVisible: true },
        { aboutGuidingPrinciplesId: "singleton", value: "Excellence in education", displayOrder: 2, isVisible: true },
        { aboutGuidingPrinciplesId: "singleton", value: "Care for every student", displayOrder: 3, isVisible: true },
        { aboutGuidingPrinciplesId: "singleton", value: "Commitment to progress", displayOrder: 4, isVisible: true },
      ],
    });
  }

  await prisma.aboutWhyParentsChoose.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Why Parents Choose Sahsrah",
      description: "A focused, supportive approach that helps students build strong foundations and steady momentum.",
      isVisible: true,
      sortOrder: 5,
    },
  });
  if ((await prisma.aboutParentChoiceBenefit.count({ where: { aboutWhyParentsChooseId: "singleton" } })) === 0) {
    await prisma.aboutParentChoiceBenefit.createMany({
      data: [
        { aboutWhyParentsChooseId: "singleton", icon: "users", title: "Experienced Faculty", description: "Guidance from educators who know how to make complex ideas clear.", displayOrder: 1, isVisible: true },
        { aboutWhyParentsChooseId: "singleton", icon: "graduation-cap", title: "Strong Academic Preparation", description: "Structured support for the next stage of every learner’s journey.", displayOrder: 2, isVisible: true },
        { aboutWhyParentsChooseId: "singleton", icon: "book-open", title: "Concept-Based Learning", description: "Learning that builds understanding instead of relying on memorization alone.", displayOrder: 3, isVisible: true },
        { aboutWhyParentsChooseId: "singleton", icon: "check-circle", title: "Regular Tests and Practice", description: "Consistent feedback helps students notice progress and close gaps.", displayOrder: 4, isVisible: true },
        { aboutWhyParentsChooseId: "singleton", icon: "heart-handshake", title: "Personalized Mentorship", description: "A caring environment where students can ask questions and grow in confidence.", displayOrder: 5, isVisible: true },
        { aboutWhyParentsChooseId: "singleton", icon: "badge-check", title: "A Commitment to Student Progress", description: "Shared attention to habits, outcomes, and long-term direction.", displayOrder: 6, isVisible: true },
      ],
    });
  }

  await prisma.aboutLeadership.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Our Leadership",
      description: "Meet the people who help Sahsrah stay focused on thoughtful teaching, student care, and meaningful progress.",
      isVisible: true,
      sortOrder: 6,
    },
  });
  if ((await prisma.aboutLeadershipMember.count({ where: { aboutLeadershipId: "singleton" } })) === 0) {
    await prisma.aboutLeadershipMember.createMany({
      data: [
        { aboutLeadershipId: "singleton", portraitImage: null, portraitAltText: "Portrait placeholder for the Sahsrah chairperson", name: "Chairperson Placeholder", designation: "Chairperson", qualification: "Qualification placeholder", biography: "Provides strategic oversight and long-term guidance for the institution.", displayOrder: 1, isVisible: true },
        { aboutLeadershipId: "singleton", portraitImage: null, portraitAltText: "Portrait placeholder for the Sahsrah academic director", name: "Academic Director Placeholder", designation: "Academic Director", qualification: "Qualification placeholder", biography: "Supports academic direction, curriculum planning, and a strong learning culture.", displayOrder: 2, isVisible: true },
        { aboutLeadershipId: "singleton", portraitImage: null, portraitAltText: "Portrait placeholder for the Sahsrah director", name: "Director Placeholder", designation: "Director", qualification: "Qualification placeholder", biography: "Helps connect institutional priorities with a welcoming student experience.", displayOrder: 3, isVisible: true },
        { aboutLeadershipId: "singleton", portraitImage: null, portraitAltText: "Portrait placeholder for the Sahsrah dean", name: "Dean Placeholder", designation: "Dean", qualification: "Qualification placeholder", biography: "Coordinates student support and keeps care, discipline, and progress at the center.", displayOrder: 4, isVisible: true },
      ],
    });
  }

  await prisma.$transaction(async (tx) => {
    const imported = await tx.facultyImportState.findUnique({ where: { id: "singleton" } });
    if (imported) return;

    const sourceMembers = await tx.aboutLeadershipMember.findMany({
      where: { aboutLeadershipId: "singleton" },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    });
    if (sourceMembers.length) {
      await tx.facultyMember.createMany({
        data: sourceMembers.map((member) => {
          const socialLinks = [
            ...(member.socialUrl?.startsWith("https://") || member.socialUrl?.startsWith("http://")
              ? [{ label: "Social profile", href: member.socialUrl }]
              : []),
            ...(member.homepageProfileUrl?.startsWith("https://") || member.homepageProfileUrl?.startsWith("http://")
              ? [{ label: "Profile", href: member.homepageProfileUrl }]
              : []),
          ].filter((link, index, links) => links.findIndex((candidate) => candidate.href === link.href) === index);

          return {
            sourceAboutLeadershipMemberId: member.id,
            imageUrl: member.portraitImage,
            imageAltText: member.portraitAltText || `${member.name} portrait`,
            name: member.name,
            role: member.designation,
            subject: member.subject || member.qualification || "Academic guidance",
            qualification: member.qualification,
            experience: member.experience || "Experienced educator",
            biography: member.biography,
            socialLinks,
            isActive: member.isVisible,
            displayOrder: member.displayOrder,
            showInHomePreview: member.homepageActive,
            homePreviewOrder: member.displayOrder,
          };
        }),
        skipDuplicates: true,
      });
    }
    await tx.facultyImportState.create({ data: { id: "singleton" } });
  });

  await prisma.aboutCampusHighlights.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Our Campus Highlights",
      description: "Thoughtfully designed spaces that help students learn, practice, recharge, and grow with confidence.",
      isVisible: true,
      sortOrder: 7,
    },
  });
  if ((await prisma.aboutCampusHighlight.count({ where: { aboutCampusHighlightsId: "singleton" } })) === 0) {
    await prisma.aboutCampusHighlight.createMany({
      data: [
        { aboutCampusHighlightsId: "singleton", imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=85", imageAltText: "Bright college classroom with rows of desks", icon: "building-2", title: "AC Classrooms", description: "Comfortable, focused classrooms that keep attention on learning.", displayOrder: 1, isVisible: true },
        { aboutCampusHighlightsId: "singleton", imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=85", imageAltText: "Students working in a science laboratory", icon: "flask-conical", title: "Advanced Science Laboratories", description: "Practical spaces where concepts become experiments and confidence.", displayOrder: 2, isVisible: true },
        { aboutCampusHighlightsId: "singleton", imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85", imageAltText: "Collaborative digital learning space", icon: "monitor-play", title: "Digital Learning Spaces", description: "Modern tools and collaborative settings for connected learning.", displayOrder: 3, isVisible: true },
        { aboutCampusHighlightsId: "singleton", imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=85", imageAltText: "Quiet library with study tables and shelves", icon: "library", title: "Library and Study Areas", description: "Calm spaces for reading, revision, and independent discovery.", displayOrder: 4, isVisible: true },
        { aboutCampusHighlightsId: "singleton", imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=85", imageAltText: "Student resting in a welcoming residence", icon: "house", title: "Safe Hostel Facilities", description: "A supportive residential environment with student wellbeing in mind.", displayOrder: 5, isVisible: true },
        { aboutCampusHighlightsId: "singleton", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=85", imageAltText: "Students participating in outdoor sports", icon: "trophy", title: "Sports and Activity Spaces", description: "Room to move, recharge, build teamwork, and enjoy a balanced routine.", displayOrder: 6, isVisible: true },
      ],
    });
  }

  const galleryImportState = await prisma.galleryImportState.findUnique({ where: { id: "singleton" } });
  if (!galleryImportState) {
    const existingCampusHighlights = await prisma.aboutCampusHighlight.findMany({
      where: { aboutCampusHighlightsId: "singleton" },
      orderBy: { displayOrder: "asc" },
    });
    await prisma.$transaction(async (tx) => {
      await tx.galleryItem.createMany({
        data: existingCampusHighlights.map((highlight) => ({
          sourceAboutId: highlight.id,
          imageUrl: highlight.imageUrl,
          imageAltText: highlight.imageAltText,
          title: highlight.title,
          description: highlight.description,
          category: getGalleryCategory(highlight.category, highlight.title),
          locationLabel: highlight.locationLabel,
          isPublished: highlight.isVisible,
          displayOrder: highlight.displayOrder,
          showInHomePreview: highlight.homepageActive && highlight.homepageFeatured,
          homePreviewOrder: highlight.displayOrder,
        })),
        skipDuplicates: true,
      });
      await tx.galleryImportState.upsert({
        where: { id: "singleton" },
        update: {},
        create: { id: "singleton" },
      });
    });
  }

  await prisma.aboutAchievements.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Progress You Can Measure",
      description: "A few of the outcomes that reflect our shared commitment to steady, meaningful progress.",
      isVisible: true,
      sortOrder: 8,
    },
  });
  if ((await prisma.aboutAchievementStatistic.count({ where: { aboutAchievementsId: "singleton" } })) === 0) {
    await prisma.aboutAchievementStatistic.createMany({
      data: [
        { aboutAchievementsId: "singleton", numericTarget: 30, suffix: "+", icon: "calendar-days", label: "Years of Excellence", displayOrder: 1, isVisible: true },
        { aboutAchievementsId: "singleton", numericTarget: 5000, suffix: "+", icon: "users", label: "Students Mentored", displayOrder: 2, isVisible: true },
        { aboutAchievementsId: "singleton", numericTarget: 100, suffix: "+", icon: "graduation-cap", label: "IIT/NIT Selections", displayOrder: 3, isVisible: true },
        { aboutAchievementsId: "singleton", numericTarget: 500, suffix: "+", icon: "stethoscope", label: "Medical Admissions", displayOrder: 4, isVisible: true },
        { aboutAchievementsId: "singleton", numericTarget: 95, suffix: "%", icon: "heart-handshake", label: "Parent Satisfaction", displayOrder: 5, isVisible: true },
        { aboutAchievementsId: "singleton", numericTarget: 25, suffix: "+", icon: "badge-check", label: "Expert Faculty", displayOrder: 6, isVisible: true },
      ],
    });
  }

  await prisma.aboutFaq.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Frequently Asked Questions",
      description: "Helpful answers for families planning the next step in their student’s journey.",
      isVisible: true,
      sortOrder: 9,
    },
  });
  if ((await prisma.aboutFaqItem.count({ where: { aboutFaqId: "singleton" } })) === 0) {
    await prisma.aboutFaqItem.createMany({
      data: [
        { aboutFaqId: "singleton", question: "Which programs are available for the 2026–27 academic year?", answer: "Admissions are open for MPC, BiPC, IIT-JEE, and NEET integrated programs. Our counselors can help you compare the right path for your student.", displayOrder: 1, isVisible: true },
        { aboutFaqId: "singleton", question: "Can we visit the campus before applying?", answer: "Yes. Contact our admissions team to arrange a campus visit and learn more about classrooms, laboratories, student support, and daily routines.", displayOrder: 2, isVisible: true },
        { aboutFaqId: "singleton", question: "How does Sahsrah support students who need extra guidance?", answer: "Students receive regular practice, feedback, subject guidance, and personal mentorship so they can identify gaps early and keep moving forward.", displayOrder: 3, isVisible: true },
        { aboutFaqId: "singleton", question: "What should we bring for the admission discussion?", answer: "Start with your questions and the student’s latest academic details. Our counselor will explain eligibility, the application steps, and the documents needed for enrollment.", displayOrder: 4, isVisible: true },
        { aboutFaqId: "singleton", question: "Are hostel facilities available?", answer: "Safe hostel facilities are available for students who need residential support. Please contact admissions for current availability, routines, and visit arrangements.", displayOrder: 5, isVisible: true },
        { aboutFaqId: "singleton", question: "How can we request a prospectus?", answer: "Use the prospectus action below or contact admissions. The team will share the latest program details and guide you through the next step.", displayOrder: 6, isVisible: true },
      ],
    });
  }

  await prisma.aboutAdmissionCta.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Begin Your Journey Towards Success with Sahsrah Junior College",
      supportingText: "Admissions for 2026–27 are now open. Limited seats are available for MPC, BiPC, IIT-JEE, and NEET integrated programs.",
      applyButtonLabel: "Apply Now",
      applyButtonHref: "/contact",
      campusVisitButtonLabel: "Book Campus Visit",
      campusVisitButtonHref: "/contact",
      prospectusButtonLabel: "Download Prospectus",
      prospectusButtonHref: "/contact",
      backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=85",
      backgroundImageAltText: "Students walking across a college campus",
      counselorButtonLabel: "Talk to Admission Counselor",
      counselorButtonHref: "/contact",
      admissionPhone: "+91 XXXXX XXXXX",
      workingHours: "Monday–Saturday, 9:00–16:30",
      isVisible: true,
      sortOrder: 10,
    },
  });
  const admissionCta = await prisma.aboutAdmissionCta.findUnique({ where: { id: "singleton" } });
  if (admissionCta && [admissionCta.applyButtonHref, admissionCta.campusVisitButtonHref, admissionCta.prospectusButtonHref, admissionCta.counselorButtonHref].some((href) => href === "#contact" || href === "/#contact" || href === "mailto:info@yourcollege.com")) {
    await prisma.aboutAdmissionCta.update({
      where: { id: "singleton" },
      data: {
        applyButtonHref: admissionCta.applyButtonHref === "#contact" || admissionCta.applyButtonHref === "/#contact" ? "/contact" : admissionCta.applyButtonHref,
        campusVisitButtonHref: admissionCta.campusVisitButtonHref === "#contact" || admissionCta.campusVisitButtonHref === "/#contact" ? "/contact" : admissionCta.campusVisitButtonHref,
        prospectusButtonHref: admissionCta.prospectusButtonHref === "#contact" || admissionCta.prospectusButtonHref === "/#contact" ? "/contact" : admissionCta.prospectusButtonHref,
        counselorButtonHref: admissionCta.counselorButtonHref === "#contact" || admissionCta.counselorButtonHref === "/#contact" || admissionCta.counselorButtonHref === "mailto:info@yourcollege.com" ? "/contact" : admissionCta.counselorButtonHref,
      },
    });
  }

  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (email && password) {
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (!existing) {
      const { hashPassword } = await import("./security");
      await prisma.admin.create({
        data: {
          email,
          passwordHash: await hashPassword(password),
          displayName: "College Administrator",
        },
      });
    }
  }
}