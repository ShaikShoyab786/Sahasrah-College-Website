import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function initializeDatabase() {
  await prisma.$connect();

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      collegeName: "Your College Name",
      tagline: "Your College Tagline",
      logoUrl: null,
      email: "info@yourcollege.com",
      phone: "+91 XXXXX XXXXX",
      address: "Your College Address",
      primaryColor: "#12365D",
      accentColor: "#D5A63A",
      footerText: "Building confident futures through focused learning.",
    },
  });

  const heroSlides = [
    {
      displayOrder: 1,
      eyebrowText: "A focused start to a bright future",
      heading: "Learn with purpose.",
      highlightedHeadingText: "Grow with confidence.",
      description:
        "A welcoming academic environment where students build strong foundations, discover their strengths, and prepare for what comes next.",
      primaryButtonLabel: "Explore admissions",
      primaryButtonUrl: "#contact",
      secondaryButtonLabel: "Discover our approach",
       secondaryButtonUrl: "#about-preview",
      heroImageUrl: null,
      heroImageAltText: "Sahasara students learning together",
    },
    {
      displayOrder: 2,
      eyebrowText: "Make room for possibility",
      heading: "Ask better",
      highlightedHeadingText: "questions.",
      description:
        "At Sahasara, curiosity is not a detour from learning. It is where confidence, creativity, and clarity begin.",
      primaryButtonLabel: "See how we learn",
       primaryButtonUrl: "#about-preview",
      secondaryButtonLabel: "Meet Sahasara",
      secondaryButtonUrl: "#contact",
      heroImageUrl: null,
      heroImageAltText: "Students collaborating in a Sahasara classroom",
    },
    {
      displayOrder: 3,
      eyebrowText: "Your next chapter starts here",
      heading: "Find your",
      highlightedHeadingText: "direction.",
      description:
        "Choose a path that fits your strengths, then give yourself the space to discover what it can become.",
      primaryButtonLabel: "Start a conversation",
      primaryButtonUrl: "#contact",
      secondaryButtonLabel: "Explore next steps",
       secondaryButtonUrl: "#contact",
      heroImageUrl: null,
      heroImageAltText: "Sahasara students looking toward their future",
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
      eyebrow: "About Sahasara",
      heading: "Building Strong Foundations for a Brighter Future",
      description:
        "Sahasara Junior College is committed to helping students grow through academic guidance, personal attention, and a supportive learning environment.",
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